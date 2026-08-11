<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Kreait\Firebase\Factory;
use Throwable;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    protected $firebaseAuth;

    public function __construct()
    {
        $serviceAccountPath = storage_path('app/firebase-auth.json');

        $this->firebaseAuth = (new Factory)
            ->withServiceAccount($serviceAccountPath)
            ->createAuth();
    }

    /**
     * Step 1: Request OTP via Firebase REST API
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|numeric|digits:10',
        ]);

        $phoneNumber = '+91' . $request->phone;
        $apiKey = env('VITE_FIREBASE_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'status'  => false,
                'message' => 'VITE_FIREBASE_API_KEY is missing in .env file.'
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
                    'phone'       => $request->phone,
                    'sessionInfo' => $response->json('sessionInfo')
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
        $validator = Validator::make($request->all(), [
            'phone'       => 'required|numeric|digits:10',
            'sessionInfo' => 'required|string',
            'code'        => 'required|numeric|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $phone       = $request->phone;
        $sessionInfo = $request->sessionInfo;
        $code        = $request->code;
        $apiKey      = env('VITE_FIREBASE_API_KEY');

        try {
            // 1. Internally Exchange sessionInfo + OTP Code for Firebase ID Token
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key={$apiKey}", [
                    'sessionInfo' => $sessionInfo,
                    'code'        => $code,
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
                    'phone'    => $phone,
                    'username' => 'user_' . substr($phone, -4) . rand(100, 999),
                ]);
                $isNewUser = true;
            }

            $user->update([
                'is_online'   => true,
                'last_active' => now()
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status'      => true,
                'message'     => $isNewUser ? 'User registered and logged in successfully' : 'Login successful',
                'is_new_user' => $isNewUser,
                'token'       => $token,
                'user'        => $user
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Server Error: ' . $e->getMessage()
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
                'is_online'   => false,
                'last_active' => now()
            ]);

            $request->user()->currentAccessToken()->delete();

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