<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Admin/Auth/Login');
    }

    public function login(Request $request)
    {
        $loginInput = trim((string) $request->input('login', ''));
        $ip = $request->ip();

        // 1. IP-based & Identifier Rate Limiting (Brute-force protection)
        $ipKey = 'admin-login-ip:' . $ip;
        $userIpKey = 'admin-login:' . Str::lower($loginInput) . '|' . $ip;

        if (RateLimiter::tooManyAttempts($ipKey, 5) || RateLimiter::tooManyAttempts($userIpKey, 5)) {
            $seconds = max(RateLimiter::availableIn($ipKey), RateLimiter::availableIn($userIpKey));
            return back()->withErrors([
                'login' => "Too many login attempts from this IP address. Please try again in {$seconds} seconds.",
            ]);
        }

        // 2. Strict Server-Side Validation
        $validated = $request->validate([
            'login'    => ['required', 'string', 'min:3', 'max:150'],
            'password' => ['required', 'string', 'min:6', 'max:150'],
            'remember' => ['nullable', 'boolean'],
        ], [
            'login.required'    => 'Please enter your email or username.',
            'login.min'         => 'Email or username must be at least 3 characters.',
            'login.max'         => 'Email or username cannot exceed 150 characters.',
            'password.required' => 'Please enter your password.',
            'password.min'      => 'Password must be at least 6 characters.',
        ]);

        $loginInput = trim($validated['login']);

        try {
            // Find admin by email or username
            $admin = Admin::where('email', $loginInput)
                ->orWhere('username', $loginInput)
                ->first();

            // 3. Generic Error: whether admin doesn't exist, password mismatch, or status is inactive,
            // return the EXACT same generic error message to prevent account enumeration.
            if (! $admin || ! Hash::check($validated['password'], $admin->password) || ! $admin->status) {
                RateLimiter::hit($ipKey, 60);
                RateLimiter::hit($userIpKey, 60);

                Log::warning('Failed admin login attempt', [
                    'ip'    => $ip,
                    'login' => $loginInput,
                ]);

                return back()->withErrors([
                    'login' => 'Invalid login credentials. Please check your details and try again.',
                ]);
            }

            // Authentication succeeded: clear rate limiter
            RateLimiter::clear($ipKey);
            RateLimiter::clear($userIpKey);

            // Authenticate guard and persist session
            Auth::guard('admin')->login($admin, $request->boolean('remember'));
            $request->session()->put('admin_logged_in_id', $admin->id);
            $request->session()->save();
            $request->session()->regenerate();
            $newSessionId = $request->session()->getId();

            // Enforce single admin web session
            $admin->update([
                'current_web_session_id' => $newSessionId,
                'last_web_login_at'      => now(),
            ]);

            // Audit Trail Log for Admin Login
            AuditLogService::log(
                action: 'admin_logged_in',
                description: "Admin {$admin->name} ({$admin->email}) logged in successfully.",
                details: [
                    'role'     => $admin->role,
                    'email'    => $admin->email,
                    'username' => $admin->username,
                    'platform' => 'web',
                ],
                module: 'auth',
                entity: $admin,
                status: 'success',
                actor: $admin,
                request: $request
            );

            // Sync candidate session ID if Candidate is already authenticated in this session
            if (Auth::guard('web')->check()) {
                $currentCandidate = Auth::guard('web')->user();
                if ($currentCandidate) {
                    $currentCandidate->update([
                        'current_web_session_id' => $newSessionId,
                    ]);
                }
            }

            // Database role ke mutabiq redirection URL set karein
            $redirectUrl = route('admin.dashboard');
            if ($admin->role === 'super_admin') {
                $redirectUrl = route('admin.super.dashboard');
            } elseif ($admin->role === 'team_member') {
                $redirectUrl = route('admin.member.dashboard');
            }

            return Inertia::location($redirectUrl);

        } catch (\Throwable $e) {
            RateLimiter::hit($ipKey, 60);
            RateLimiter::hit($userIpKey, 60);

            Log::error('Admin login exception', [
                'ip'    => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'login' => 'An unexpected error occurred during login. Please try again later.',
            ]);
        }
    }

    public function logout(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        if ($admin) {
            AuditLogService::log(
                action: 'admin_logged_out',
                description: "Admin {$admin->name} ({$admin->email}) logged out.",
                details: [
                    'role'     => $admin->role,
                    'email'    => $admin->email,
                    'platform' => 'web',
                ],
                module: 'auth',
                entity: $admin,
                status: 'success',
                actor: $admin,
                request: $request
            );

            $admin->update([
                'current_web_session_id' => null,
            ]);
        }

        Auth::guard('admin')->logout();
        $request->session()->forget('admin_logged_in_id');
        $request->session()->forget(Auth::guard('admin')->getName());

        // Only invalidate entire session if candidate is not logged in
        if (!Auth::guard('web')->check()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return Inertia::location(route('admin.login'));
    }
}