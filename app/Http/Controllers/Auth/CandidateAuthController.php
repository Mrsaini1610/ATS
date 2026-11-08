<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use App\Services\GeocodingService;
use App\Services\MailService;

class CandidateAuthController extends Controller
{
    /**
     * Login / Unified Candidate Auth Page Render
     */
    public function showLogin()
    {
        // If already logged in, check profile status
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            if (!$user->isProfileComplete()) {
                return inertia('Candidate/Login', [
                    'initialStep' => 'profile',
                    'candidate'   => $user,
                ]);
            }
            return redirect()->route('home');
        }

        return inertia('Candidate/Login');
    }

    /**
     * Register Route - Redirect to Unified Login/Register
     */
    public function showRegister()
    {
        return redirect()->route('login');
    }

    /**
     * Optional pre-check for phone number
     */
    public function checkPhoneLogin(Request $request)
    {
        // 1. IP-based Rate Limiter
        $ipKey = 'candidate-check-phone-ip:' . $request->ip();
        if (RateLimiter::tooManyAttempts($ipKey, 10)) {
            $seconds = RateLimiter::availableIn($ipKey);
            return response()->json([
                'success' => false,
                'message' => "Too many requests from this IP address. Please try again in {$seconds} seconds.",
            ], 429);
        }
        RateLimiter::hit($ipKey, 60);

        // 2. Server-side validation
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ], [
            'phone.required' => 'Mobile number is required.',
            'phone.regex'    => 'Please provide a valid 10-digit mobile number.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid 10-digit mobile number.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::where('phone', $request->phone)->first();

        // 3. Generic response: avoid leaking sensitive status
        return response()->json([
            'success' => true,
            'exists'  => (bool) $user,
            'message' => 'Phone verified successfully.',
        ]);
    }

    /**
     * Final Login / Registration Action after OTP verification
     */
    public function phoneLogin(Request $request, GeocodingService $geocodingService)
    {
        // 1. IP-based Rate Limiter
        $ipKey = 'candidate-login-ip:' . $request->ip();
        if (RateLimiter::tooManyAttempts($ipKey, 5)) {
            $seconds = RateLimiter::availableIn($ipKey);
            return response()->json([
                'success' => false,
                'message' => "Too many login attempts from this IP address. Please try again in {$seconds} seconds.",
            ], 429);
        }

        // 2. Server-Side Validation
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'phone'     => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
            'job_id'    => ['nullable', 'string', 'max:100'],
            'latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ], [
            'phone.required' => 'Mobile number is required.',
            'phone.regex'    => 'Please provide a valid 10-digit Indian mobile number.',
        ]);

        if ($validator->fails()) {
            RateLimiter::hit($ipKey, 60);
            return response()->json([
                'success' => false,
                'message' => 'Invalid login details. Please check your information and try again.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $phone = $request->phone;
            $lat = $request->latitude;
            $lng = $request->longitude;
            $detectedCity = null;
            $detectedArea = null;

            if (!empty($lat) && !empty($lng) && is_numeric($lat) && is_numeric($lng)) {
                $geo = $geocodingService->reverseGeocodeResult((float)$lat, (float)$lng);
                $detectedCity = $geo['city'] ?? null;
                $detectedArea = $geo['area'] ?? null;
            }

            $user = User::where('phone', $phone)->first();
            $isNew = false;

            if (!$user) {
                // Auto-create user record in DB
                $user = User::create([
                    'phone'               => $phone,
                    'full_name'           => 'Candidate ' . substr($phone, -4),
                    'username'            => 'user_' . $phone,
                    'password'            => Hash::make(uniqid('pass_')),
                    'registered_from'     => 'web',
                    'city'                => $detectedCity,
                    'area'                => $detectedArea,
                    'web_latitude'        => $lat,
                    'web_longitude'       => $lng,
                    'web_is_online'       => true,
                    'web_last_active'     => now(),
                    'is_online'           => true,
                    'last_active'         => now(),
                    'latitude'            => $lat,
                    'longitude'           => $lng,
                    'is_profile_complete' => false,
                ]);
                $isNew = true;
            } else {
                // Update web tracking fields for existing user
                $user->update([
                    'web_is_online'   => true,
                    'web_last_active' => now(),
                    'web_latitude'    => $lat ?? $user->web_latitude,
                    'web_longitude'   => $lng ?? $user->web_longitude,
                    'is_online'       => true,
                    'last_active'     => now(),
                    'latitude'        => $lat ?? $user->latitude,
                    'longitude'       => $lng ?? $user->longitude,
                    'city'            => $user->city ?: $detectedCity,
                    'area'            => $user->area ?: $detectedArea,
                ]);
            }

            // Login candidate
            Auth::guard('web')->login($user, remember: true);
            $request->session()->regenerate();
            $newSessionId = $request->session()->getId();

            // Enforce single web session (invalidates any older web session on other devices/browsers)
            $user->update([
                'current_web_session_id' => $newSessionId,
                'last_web_login_at'      => now(),
            ]);

            // Sync admin session ID if an Admin is already authenticated in this session
            if (Auth::guard('admin')->check()) {
                $currentAdmin = Auth::guard('admin')->user();
                if ($currentAdmin) {
                    $currentAdmin->update([
                        'current_web_session_id' => $newSessionId,
                    ]);
                }
            }

            // Clear rate limiter on successful login
            RateLimiter::clear($ipKey);

            // Check if profile is complete
            $isProfileComplete = $user->isProfileComplete();

            // Dynamic redirect URL
            $redirectUrl = route('home');
            if ($request->job_id) {
                $redirectUrl = "/apply/{$request->job_id}";
            }

            return response()->json([
                'success'          => true,
                'is_new'           => $isNew,
                'profile_complete' => $isProfileComplete,
                'user'             => [
                    'id'         => $user->id,
                    'uuid'       => $user->uuid,
                    'full_name'  => $user->full_name,
                    'email'      => $user->email,
                    'phone'      => $user->phone,
                    'gender'     => $user->gender,
                    'dob'        => $user->dob ? $user->dob->format('Y-m-d') : null,
                    'city'       => $user->city,
                    'area'       => $user->area,
                    'job_title'  => $user->job_title,
                    'education'  => $user->education,
                    'experience' => $user->total_experience_years,
                ],
                'redirect'         => $redirectUrl,
            ]);

        } catch (\Throwable $e) {
            RateLimiter::hit($ipKey, 60);

            \Illuminate\Support\Facades\Log::error('Candidate phoneLogin exception', [
                'ip'    => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            // 3. Generic Error message
            return response()->json([
                'success' => false,
                'message' => 'Unable to complete login at this time. Please try again later.',
            ], 500);
        }
    }

    /**
     * Complete Candidate Profile onboarding
     */
    public function completeProfile(Request $request)
    {
        $user = Auth::guard('web')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login to continue.'
            ], 401);
        }

        // Rate Limiter
        $key = 'complete-profile:' . $user->id . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Too many attempts from this IP. Please try again in {$seconds} seconds."
            ], 429);
        }
        RateLimiter::hit($key, 60);

        $validated = $request->validate([
            'full_name'  => ['required', 'string', 'min:2', 'max:100'],
            'email'      => ['required', 'email', 'max:150', 'unique:users,email,' . $user->id],
            'gender'     => ['required', 'string', 'in:male,female,other,Male,Female,Other'],
            'dob'        => ['required', 'date', 'before:-18 years'],
            'city'       => ['required', 'string', 'max:100'],
            'area'       => ['nullable', 'string', 'max:100'],
            'job_title'  => ['nullable', 'string', 'max:100'],
            'experience' => ['nullable', 'string', 'max:50'],
            'education'  => ['nullable', 'string', 'max:100'],
            'latitude'   => ['nullable', 'numeric'],
            'longitude'  => ['nullable', 'numeric'],
            'job_id'     => ['nullable', 'string'],
        ], [
            'email.required'     => 'Kripya apna email address darj karein.',
            'email.email'        => 'Kripya sahi email address darj karein.',
            'email.unique'       => 'Yeh email address pehle se registered hai.',
            'dob.before'         => 'Aapki umar kam se kam 18 saal honi chahiye.',
            'full_name.required' => 'Kripya apna poora naam darj karein.',
            'gender.required'    => 'Kripya apna gender select karein.',
            'city.required'      => 'Kripya apna shehar (City) darj karein.',
        ]);

        $user->update([
            'full_name'              => $validated['full_name'],
            'email'                  => $validated['email'],
            'gender'                 => strtolower($validated['gender']),
            'dob'                    => $validated['dob'],
            'city'                   => $validated['city'],
            'area'                   => $validated['area'] ?? $user->area,
            'job_title'              => $validated['job_title'] ?? $user->job_title,
            'education'              => $validated['education'] ?? $user->education,
            'total_experience_years' => $validated['experience'] ?? $user->total_experience_years,
            'web_latitude'           => $request->latitude ?? $user->web_latitude,
            'web_longitude'          => $request->longitude ?? $user->web_longitude,
            'latitude'               => $request->latitude ?? $user->latitude,
            'longitude'              => $request->longitude ?? $user->longitude,
            'is_profile_complete'    => true,
            'web_is_online'          => true,
            'web_last_active'        => now(),
            'is_online'              => true,
            'last_active'            => now(),
        ]);

        // Dispatch Welcome Email and Super Admin Notification
        try {
            MailService::sendWelcomeCandidate($user);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Candidate welcome email trigger error: ' . $e->getMessage());
        }

        // Destination redirect
        $redirectUrl = route('home');
        if ($request->job_id) {
            $redirectUrl = "/apply/{$request->job_id}";
        }

        return response()->json([
            'success'  => true,
            'message'  => 'Profile complete ho gaya!',
            'redirect' => $redirectUrl,
            'user'     => $user,
        ]);
    }

    /**
     * Check Phone Number for Registration (legacy fallback)
     */
    public function checkPhoneRegister(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ]);

        $exists = User::where('phone', $request->phone)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }

    /**
     * Candidate Logout (Updates web tracking)
     */
    public function logout(Request $request)
    {
        $user = Auth::guard('web')->user();

        if ($user) {
            $user->update([
                'web_is_online'          => false,
                'web_last_active'        => now(),
                'is_online'              => (bool) $user->app_is_online,
                'last_active'            => now(),
                'current_web_session_id' => null,
            ]);
        }

        Auth::guard('web')->logout();
        $request->session()->forget(Auth::guard('web')->getName());

        // Only invalidate entire session if admin is not logged in
        if (!Auth::guard('admin')->check()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('login');
    }
}