<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class CandidateAuthController extends Controller
{
    /**
     * Login Page Render
     */
    public function showLogin()
    {
        return inertia('Candidate/Login');
    }

    /**
     * Register Page Render
     */
    public function showRegister()
    {
        return inertia('Candidate/Register');
    }

    /**
     * Check Phone Number for Login
     */
    public function checkPhoneLogin(Request $request)
    {
        // Rate Limiter: Max 5 requests per minute per IP
        $key = 'check-phone-login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'message' => 'Bohat jyada attempts hue hain. Kripya 1 minute baad try karein.'
            ], 429);
        }
        RateLimiter::hit($key, 60);

        // Validation
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ], [
            'phone.required' => 'Phone number zaroori hai.',
            'phone.regex' => 'Kripya sahi 10-digit mobile number darj karein.'
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Ye phone number registered nahi hai. Kripya naya account banayein.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User mil gaya.'
        ]);
    }

    /**
     * Final Login Action
     */
    public function phoneLogin(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
            'job_id' => ['nullable', 'integer'],
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Account nahi mila.'
            ], 404);
        }

        // Login the user securely
        Auth::login($user, remember: true);

        // Security: Prevent Session Fixation
        $request->session()->regenerate();

        // Redirect URL logic
        $redirectUrl = route('home');
        if ($request->job_id) {
            $redirectUrl = "/jobs/{$request->job_id}";
        }

        return response()->json([
            'success' => true,
            'redirect' => $redirectUrl
        ]);
    }

    /**
     * Check Phone Number for Registration
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
     * Complete Candidate Registration
     */
    public function register(Request $request)
    {
        // Rate Limiting
        $key = 'register-attempt:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'success' => false,
                'message' => 'Aapne multiple attempts kiye hain. Kuch samay baad try karein.'
            ], 429);
        }
        RateLimiter::hit($key, 60);

        // Strict Server Validation
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/', 'unique:users,phone'],
            'full_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s]+$/'],
            'dob' => ['required', 'date', 'before:-18 years'], // Must be 18+
            'city' => ['required', 'string', 'max:50'],
            'job_title' => ['required', 'string', 'max:100'],
            'experience' => ['required', 'string', 'max:50'],
            'education' => ['required', 'string', 'max:100'],
        ], [
            'phone.unique' => 'Ye phone number pehle se registered hai.',
            'dob.before' => 'Aapki umar kam se kam 18 saal honi chahiye.',
            'full_name.regex' => 'Naam me sirf letters aur spaces hone chahiye.'
        ]);

        // Create User
        $user = User::create([
            'name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'dob' => $validated['dob'],
            'city' => $validated['city'],
            'job_title' => $validated['job_title'],
            'experience' => $validated['experience'],
            'education' => $validated['education'],
            'role' => 'candidate',
            'password' => Hash::make(uniqid('pass_')), // Dummy random secure hash
        ]);

        // Login Automatically
        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Registration safaltapurvak ho gaya.'
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}