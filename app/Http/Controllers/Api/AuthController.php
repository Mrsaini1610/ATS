<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
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
        $ip = $request->ip();
        $ipKey = 'api-send-otp-ip:' . $ip;

        // 1. IP-based Rate Limiter (Brute-force / SMS flood prevention)
        if (RateLimiter::tooManyAttempts($ipKey, 5)) {
            $seconds = RateLimiter::availableIn($ipKey);
            return response()->json([
                'status'  => false,
                'message' => "Too many OTP requests from this IP address. Please try again in {$seconds} seconds.",
            ], 429);
        }

        // 2. Normalize and Server-Side Validate Phone
        $phone = $this->normalizePhone($request->input('phone'));
        $phoneKey = 'api-send-otp-phone:' . ($phone ?: 'empty');

        if (!empty($phone) && RateLimiter::tooManyAttempts($phoneKey, 3)) {
            $seconds = RateLimiter::availableIn($phoneKey);
            return response()->json([
                'status'  => false,
                'message' => "Too many OTP requests for this mobile number. Please try again in {$seconds} seconds.",
            ], 429);
        }

        $validator = Validator::make(['phone' => $phone], [
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ], [
            'phone.required' => 'Mobile number is required.',
            'phone.regex'    => 'Please provide a valid 10-digit Indian mobile number.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Please provide a valid 10-digit Indian mobile number.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        RateLimiter::hit($ipKey, 60);
        RateLimiter::hit($phoneKey, 60);

        $phoneNumber = '+91' . $phone;
        $apiKey = config('services.firebase.api_key') ?: env('VITE_FIREBASE_API_KEY');

        if (!$apiKey) {
            Log::error('Firebase API key configuration is missing.');
            return response()->json([
                'status'  => false,
                'message' => 'Unable to send verification code. Please try again later.',
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
                    'message'     => 'Verification code sent successfully.',
                    'phone'       => $phone,
                    'sessionInfo' => $response->json('sessionInfo'),
                ], 200);
            }

            // 3. Generic Error message (prevent leaking Firebase details)
            Log::warning('Firebase sendOtp error for IP ' . $ip . ' / Phone ' . $phone . ': ' . $response->body());
            return response()->json([
                'status'  => false,
                'message' => 'Unable to send verification code. Please verify your mobile number and try again.',
            ], 400);

        } catch (Throwable $e) {
            Log::error('API sendOtp exception for IP ' . $ip . ': ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'An unexpected error occurred. Please try again later.',
            ], 500);
        }
    }

    /**
     * Step 2: Verify OTP via sessionInfo + code & Auto-Register/Login
     */
    public function verifyOtp(Request $request)
    {
        $ip = $request->ip();
        $ipKey = 'api-verify-otp-ip:' . $ip;

        // 1. IP-based Rate Limiter (Brute-force protection on code guessing)
        if (RateLimiter::tooManyAttempts($ipKey, 5)) {
            $seconds = RateLimiter::availableIn($ipKey);
            return response()->json([
                'status'  => false,
                'message' => "Too many verification attempts from this IP address. Please try again in {$seconds} seconds.",
            ], 429);
        }

        // 2. Normalize and Server-Side Validate Input
        $phone = $this->normalizePhone($request->input('phone'));
        $phoneKey = 'api-verify-otp-phone:' . ($phone ?: 'empty');

        if (!empty($phone) && RateLimiter::tooManyAttempts($phoneKey, 5)) {
            $seconds = RateLimiter::availableIn($phoneKey);
            return response()->json([
                'status'  => false,
                'message' => "Too many verification attempts for this mobile number. Please try again in {$seconds} seconds.",
            ], 429);
        }

        $validator = Validator::make([
            'phone'       => $phone,
            'sessionInfo' => $request->input('sessionInfo'),
            'code'        => $request->input('code'),
            'device_id'   => $request->input('device_id') ?? $request->input('deviceId'),
            'fcm_token'   => $request->input('fcm_token') ?? $request->input('fcmToken'),
        ], [
            'phone'       => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
            'sessionInfo' => ['required', 'string', 'max:1000'],
            'code'        => ['required', 'digits:6'],
            'device_id'   => ['nullable', 'string', 'max:100'],
            'fcm_token'   => ['nullable', 'string', 'max:500'],
        ], [
            'phone.required'       => 'Mobile number is required.',
            'phone.regex'          => 'Please provide a valid 10-digit Indian mobile number.',
            'sessionInfo.required' => 'Session information is required.',
            'code.required'        => 'OTP code is required.',
            'code.digits'          => 'OTP code must be 6 digits.',
        ]);

        if ($validator->fails()) {
            RateLimiter::hit($ipKey, 60);
            return response()->json([
                'status'  => false,
                'message' => 'Invalid verification details. Please check and try again.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $sessionInfo = $request->input('sessionInfo');
        $code        = $request->input('code');
        $apiKey      = config('services.firebase.api_key') ?: env('VITE_FIREBASE_API_KEY');

        if (!$apiKey) {
            Log::error('Firebase API key configuration is missing.');
            return response()->json([
                'status'  => false,
                'message' => 'Unable to verify code at this time. Please try again later.'
            ], 500);
        }

        try {
            // 3. Internally Exchange sessionInfo + OTP Code for Firebase ID Token
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key={$apiKey}", [
                    'sessionInfo' => $sessionInfo,
                    'code'        => (string) $code,
                ]);

            if (!$response->successful()) {
                RateLimiter::hit($ipKey, 60);
                if (!empty($phone)) {
                    RateLimiter::hit($phoneKey, 60);
                }

                Log::warning('Firebase verifyOtp failure for IP ' . $ip . ' / Phone ' . $phone . ': ' . $response->body());
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid or expired verification code. Please check and try again.',
                ], 400);
            }

            $firebasePhone  = $response->json('phoneNumber');
            $formattedPhone = '+91' . $phone;

            if ($firebasePhone !== $formattedPhone) {
                RateLimiter::hit($ipKey, 60);
                if (!empty($phone)) {
                    RateLimiter::hit($phoneKey, 60);
                }

                Log::warning('Firebase verifyOtp phone mismatch for IP ' . $ip);
                return response()->json([
                    'status'  => false,
                    'message' => 'Verification failed. Please check your details and try again.',
                ], 400);
            }

            // Verification succeeded: clear rate limiter
            RateLimiter::clear($ipKey);
            RateLimiter::clear($phoneKey);

            // Fetch or Create User
            $user = User::where('phone', $phone)->first();
            $isNewUser = false;

            if (!$user) {
                $user = User::create([
                    'phone'               => $phone,
                    'username'            => 'user_' . $phone,
                    'registered_from'     => 'app',
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

            // Register or Update FCM Token if provided by mobile app
            $fcmToken = $request->input('fcm_token') ?? $request->input('fcmToken');
            $deviceId = $request->input('device_id') ?? $request->input('deviceId') ?? 'app_device';

            // Check if user was previously logged in on another mobile device
            $previousDeviceId = $user->current_app_device_id;
            if ($previousDeviceId && $previousDeviceId !== $deviceId) {
                try {
                    PushNotificationService::sendCandidatePersonal(
                        $user,
                        'Device Session Expired',
                        'Aapka account kisi dusre mobile device par login ho gaya hai. Suraksha ke liye is device par logout kar diya gaya hai.',
                        ['type' => 'LOGGED_OUT_OTHER_DEVICE']
                    );
                } catch (Throwable $e) {}
            }

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

            // Enforce Single App Session: Revoke all prior mobile app tokens
            $user->tokens()->where('name', 'auth_token')->delete();

            $user->update([
                'current_app_device_id' => $deviceId,
                'last_app_login_at'     => now(),
            ]);

            // Issue new Sanctum Token for this active app device
            $token = $user->createToken('auth_token')->plainTextToken;

            // Load candidate relations
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
            RateLimiter::hit($ipKey, 60);

            Log::error('API verifyOtp exception for IP ' . $ip . ': ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'An unexpected error occurred during verification. Please try again later.'
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
