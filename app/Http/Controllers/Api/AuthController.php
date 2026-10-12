<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Kreait\Firebase\Factory;
use Throwable;
use App\Services\MailService;

class AuthController extends Controller
{
    protected $firebaseAuth;

    public function __construct()
    {
        $serviceAccountPath = storage_path('app/firebase-auth.json');

        if (file_exists($serviceAccountPath)) {
            try {
                $this->firebaseAuth = (new Factory)
                    ->withServiceAccount($serviceAccountPath)
                    ->createAuth();
            } catch (Throwable $e) {
                Log::warning('Firebase Auth initialization error in Api\AuthController: ' . $e->getMessage());
                $this->firebaseAuth = null;
            }
        }
    }

    /**
     * Clean and normalize Indian mobile number to 10 digits.
     */
    protected function normalizePhone(?string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        $cleaned = preg_replace('/\D+/', '', (string) $phone);

        if (strlen($cleaned) === 12 && str_starts_with($cleaned, '91')) {
            $cleaned = substr($cleaned, 2);
        } elseif (strlen($cleaned) === 11 && str_starts_with($cleaned, '0')) {
            $cleaned = substr($cleaned, 1);
        }

        return $cleaned;
    }

    /**
     * Step 1: Request OTP via Firebase REST API
     */
    public function sendOtp(Request $request)
    {
        $phone = $this->normalizePhone($request->input('phone'));

        $validator = Validator::make(['phone' => $phone], [
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ], [
            'phone.required' => 'Mobile number is required.',
            'phone.regex'    => 'Please provide a valid 10-digit Indian mobile number.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first('phone'),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $phoneNumber = '+91' . $phone;
        $apiKey = config('services.firebase.api_key') ?: env('VITE_FIREBASE_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'status'  => false,
                'message' => 'Firebase API key configuration is missing.',
            ], 500);
        }

        try {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->post("https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key={$apiKey}", [
                    'phoneNumber' => $phoneNumber,
                ]);

            if ($response->successful()) {
                return response()->json([
                    'status'      => true,
                    'message'     => 'OTP request processed successfully!',
                    'phone'       => $phone,
                    'sessionInfo' => $response->json('sessionInfo'),
                ], 200);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Firebase Auth Error',
                'error'   => $response->json('error.message', 'Unknown error occurred.')
            ], $response->status() ?: 400);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Network/Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 2: Verify OTP via sessionInfo + code & Auto-Register/Login
     */
    public function verifyOtp(Request $request)
    {
        $phone = $this->normalizePhone($request->input('phone'));

        $validator = Validator::make([
            'phone'       => $phone,
            'sessionInfo' => $request->input('sessionInfo'),
            'code'        => $request->input('code'),
        ], [
            'phone'       => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
            'sessionInfo' => ['required', 'string'],
            'code'        => ['required', 'digits:6'],
        ], [
            'phone.required'       => 'Mobile number is required.',
            'phone.regex'          => 'Please provide a valid 10-digit Indian mobile number.',
            'sessionInfo.required' => 'Session information is required.',
            'code.required'        => 'OTP code is required.',
            'code.digits'          => 'OTP code must be 6 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $sessionInfo = $request->input('sessionInfo');
        $code        = $request->input('code');
        $apiKey      = config('services.firebase.api_key') ?: env('VITE_FIREBASE_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'status'  => false,
                'message' => 'Firebase API key configuration is missing.'
            ], 500);
        }

        try {
            // 1. Internally Exchange sessionInfo + OTP Code for Firebase ID Token
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key={$apiKey}", [
                    'sessionInfo' => $sessionInfo,
                    'code'        => (string) $code,
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'OTP Verification Failed',
                    'error'   => $response->json('error.message', 'Invalid or expired OTP.')
                ], 400);
            }

            $firebasePhone  = $response->json('phoneNumber');
            $formattedPhone = '+91' . $phone;

            if ($firebasePhone !== $formattedPhone) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Phone number mismatch with Firebase verification.'
                ], 400);
            }

            // 2. Fetch or Create User
            $user = User::where('phone', $phone)->first();
            $isNewUser = false;

            if (!$user) {
                $user = User::create([
                    'phone'               => $phone,
                    'username'            => 'user_' . $phone,
                    'is_profile_complete' => false,
                    'app_is_online'       => true,
                    'app_last_active'     => now(),
                    'is_online'           => true,
                    'last_active'         => now(),
                ]);
                $isNewUser = true;
            } else {
                $user->update([
                    'app_is_online'   => true,
                    'app_last_active' => now(),
                    'is_online'       => true,
                    'last_active'     => now(),
                ]);
            }

            // 3. Register or Update FCM Token if provided by mobile app
            $fcmToken = $request->input('fcm_token') ?? $request->input('fcmToken');
            $deviceId = $request->input('device_id') ?? $request->input('deviceId') ?? 'app_device';

            if (!empty($fcmToken)) {
                try {
                    FcmToken::updateOrCreate(
                        [
                            'user_id'   => $user->id,
                            'guard'     => 'api',
                            'device_id' => $deviceId,
                        ],
                        [
                            'token'      => $fcmToken,
                            'deleted_at' => null,
                        ]
                    );
                } catch (Throwable $e) {
                    Log::warning('FCM Token save failed during verifyOtp: ' . $e->getMessage());
                }
            }

            // 4. Issue Sanctum Token for the app
            $token = $user->createToken('auth_token')->plainTextToken;

            // 5. Load candidate relations
            $user->load(['educations', 'experiences', 'resumes', 'certificates']);

            // Send welcome mail if candidate has email and profile complete
            if (!empty($user->email) && $user->isProfileComplete()) {
                try {
                    MailService::sendWelcomeCandidate($user);
                } catch (Throwable $e) {}
            }

            return response()->json([
                'status'              => true,
                'message'             => $isNewUser ? 'User registered and logged in successfully' : 'Login successful',
                'is_new_user'         => $isNewUser,
                'is_profile_complete' => (bool) $user->isProfileComplete(),
                'token'               => $token,
                'user'                => $user
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Standalone Endpoint: Update or refresh FCM token (e.g. app startup / onTokenRefresh)
     */
    public function updateFcmToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fcm_token' => 'required|string',
            'device_id' => 'nullable|string',
        ], [
            'fcm_token.required' => 'FCM token is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $deviceId = $request->input('device_id') ?? $request->input('deviceId') ?? 'app_device';

        try {
            FcmToken::updateOrCreate(
                [
                    'user_id'   => $user->id,
                    'guard'     => 'api',
                    'device_id' => $deviceId,
                ],
                [
                    'token'      => $request->input('fcm_token'),
                    'deleted_at' => null,
                ]
            );

            return response()->json([
                'status'  => true,
                'success' => true,
                'message' => 'FCM token updated successfully',
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'success' => false,
                'message' => 'Failed to update FCM token: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout User
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            $user->update([
                'app_is_online'   => false,
                'app_last_active' => now(),
                'is_online'       => (bool) $user->web_is_online,
                'last_active'     => now(),
            ]);

            // Clear FCM Token for this app / device
            try {
                $fcmToken = $request->input('fcm_token') ?? $request->input('fcmToken');
                $deviceId = $request->input('device_id') ?? $request->input('deviceId');

                $query = FcmToken::where('user_id', $user->id)
                    ->where('guard', 'api');

                if (!empty($fcmToken)) {
                    $query->where('token', $fcmToken)->delete();
                } elseif (!empty($deviceId)) {
                    $query->where('device_id', $deviceId)->delete();
                } else {
                    $query->delete();
                }
            } catch (Throwable $e) {
                Log::warning('FCM Token delete failed during logout: ' . $e->getMessage());
            }

            if ($request->user()->currentAccessToken()) {
                $request->user()->currentAccessToken()->delete();
            }

            return response()->json([
                'status'  => true,
                'message' => 'Logged out successfully'
            ], 200);
        }

        return response()->json([
            'status'  => false,
            'message' => 'User not authenticated'
        ], 401);
    }
}
