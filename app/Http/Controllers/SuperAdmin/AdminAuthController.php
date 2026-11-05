<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\SuperAdmin;
use App\Models\Member;
use App\Models\ActivityLog;
use App\Enums\ActionTypeEnum;
class AdminAuthController extends Controller
{
    /**
     * @return mixed
     */
    public function login()
    {
        if (Auth::guard('superadmin')->check()) {
            return redirect()->route('super.dashboard');
        }
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }
        if (Auth::guard('member')->check()) {
            return redirect()->route('member.dashboard');
        }
        if (Auth::guard('callingteam')->check()) {
            return redirect()->route('callingteam.dashboard');
        }

        return Inertia::render('SuperAdmin/Auth/Login');
    }


    public function forgotPassword(Request $request){
                return Inertia::render('Auth/SuperForgetPassword', []);
    }



    /**
     * Super Amdin Login
     * @param Request $request
     * @return mixed
     */

    public function verify(Request $request)
    {
        $identifier = trim((string) $request->input('identifier', ''));
        $ip = $request->ip();

        // 1. IP-based & Identifier Rate Limiting (Brute-force protection)
        $ipKey = 'super-login-ip:' . $ip;
        $throttleKey = 'super-login:' . Str::lower($identifier) . '|' . $ip;

        if (RateLimiter::tooManyAttempts($ipKey, 5) || RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = max(RateLimiter::availableIn($ipKey), RateLimiter::availableIn($throttleKey));
            return back()->withErrors([
                'login' => "Too many login attempts from this IP address. Please try again in {$seconds} seconds.",
            ]);
        }

        // 2. Strict Server-Side Validation
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'min:3', 'max:150'],
            'password'   => ['required', 'string', 'min:6', 'max:150'],
            'remember'   => ['nullable', 'boolean'],
        ], [
            'identifier.required' => 'Please enter your email, phone, or username.',
            'identifier.min'      => 'Identifier must be at least 3 characters.',
            'identifier.max'      => 'Identifier cannot exceed 150 characters.',
            'password.required'   => 'Please enter your password.',
            'password.min'        => 'Password must be at least 6 characters.',
        ]);

        $identifier = trim($validated['identifier']);
        $field = $this->determineLoginField($identifier);
        $password = $validated['password'];
        $remember = (bool) $request->boolean('remember');

        // 3. Attempt SuperAdmin Authentication
        $superAdmin = SuperAdmin::where($field, $identifier)->first();
        if ($superAdmin && (int)($superAdmin->status ?? 1) === 1) {
            if (Auth::guard('superadmin')->attempt([
                $field    => $identifier,
                'password' => $password,
                'status'   => 1,
            ], $remember)) {
                RateLimiter::clear($ipKey);
                RateLimiter::clear($throttleKey);

                $request->session()->regenerate();
                return redirect()->route('super.dashboard');
            }
        }

        // 4. Attempt Member Authentication
        $member = Member::where($field, $identifier)->first();
        if ($member && !$member->is_calling_team && (int)($member->status ?? 1) === 1) {
            $guard = $this->determineGuardFromRoles(is_array($member->roles) ? $member->roles : []);

            if (Auth::guard($guard)->attempt([
                $field    => $identifier,
                'password' => $password,
                'status'   => 1,
            ], $remember)) {
                RateLimiter::clear($ipKey);
                RateLimiter::clear($throttleKey);

                $authenticatedUser = Auth::guard($guard)->user();
                $request->session()->regenerate();

                if ($authenticatedUser) {
                    ActivityLog::create([
                        'user_id'     => $authenticatedUser->id,
                        'user_role'   => $authenticatedUser->user_role ?? 'doer',
                        'action_type' => ActionTypeEnum::LOGIN,
                        'description' => 'User logged in via ' . $guard . ' guard',
                        'ip_address'  => $request->ip(),
                        'user_agent'  => $request->userAgent(),
                        'action_time' => now(),
                    ]);
                }

                $roleId = $this->getFirstValidRoleId($authenticatedUser);
                if (!$roleId) {
                    Auth::guard($guard)->logout();
                    return redirect()->route('login')->withErrors([
                        'login' => 'You do not have access to any valid roles.',
                    ]);
                }

                session(['current_role' => $roleId]);

                return match ((int)$roleId) {
                    1 => redirect()->route('admin.dashboard'),
                    3 => redirect()->route('member.dashboard'),
                    default => redirect()->intended('/'),
                };
            }
        }

        // 5. Generic Error on Failure (Never reveal user existence or reason)
        RateLimiter::hit($ipKey, 60);
        RateLimiter::hit($throttleKey, 60);

        return back()->withErrors([
            'login' => 'The provided credentials do not match our records.',
        ]);
    }

    protected function determineGuardFromRoles(array $roles): string
    {
        if (in_array(1, $roles)) {
            return 'admin';
        }
        if (in_array(3, $roles)) {
            return 'member';
        }
        return 'web';
    }

    protected function getFirstValidRoleId($user): ?int
    {
        if (!$user) {
            return null;
        }

        $roles = is_array($user->roles) ? $user->roles : [];

        if (in_array(1, $roles)) {
            return 1;
        }
        if (in_array(3, $roles)) {
            return 3;
        }

        return null;
    }

    protected function determineLoginField($login): string
    {
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            return 'email';
        }
        if (is_numeric($login)) {
            return 'phone';
        }
        return 'username';
    }
}
