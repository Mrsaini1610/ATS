<?php

namespace App\Http\Controllers\CallingTeam;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login()
    {
        if (Auth::guard('callingteam')->check()) {
            return redirect()->route('callingteam.dashboard');
        }

        return Inertia::render('CallingTeam/Auth/Login');
    }

    public function verify(Request $request)
    {
        $identifierInput = trim((string) $request->input('identifier', ''));
        $ip = $request->ip();

        // 1. IP-based & Identifier Rate Limiter
        $ipKey = 'callingteam-login-ip:' . $ip;
        $throttleKey = 'callingteam-login:' . Str::lower($identifierInput) . '|' . $ip;

        if (RateLimiter::tooManyAttempts($ipKey, 5) || RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = max(RateLimiter::availableIn($ipKey), RateLimiter::availableIn($throttleKey));
            return back()->withErrors([
                'login' => "Too many login attempts from this IP address. Please try again in {$seconds} seconds.",
            ]);
        }

        // 2. Strict Server-Side Validation
        $request->validate([
            'identifier' => ['required', 'string', 'min:3', 'max:150'],
            'password'   => ['required', 'string', 'min:6', 'max:150'],
            'remember'   => ['nullable', 'boolean'],
        ], [
            'identifier.required' => 'Please enter your username, email or phone.',
            'identifier.min'      => 'Login identifier must be at least 3 characters.',
            'password.required'   => 'Please enter your password.',
            'password.min'        => 'Password must be at least 6 characters.',
        ]);

        $identifier = $request->string('identifier')->trim()->toString();
        $field = $this->determineLoginField($identifier);

        try {
            $member = Member::query()
                ->where($field, $identifier)
                ->where('is_calling_team', true)
                ->first();

            // 3. Generic Error: If member not found, inactive, or password fails,
            // return the same generic message.
            if (!$member || (int) ($member->status ?? 1) === 0 || !Auth::guard('callingteam')->attempt([
                $field => $identifier,
                'password' => $request->string('password')->toString(),
                'status' => 1,
                'is_calling_team' => 1,
            ], (bool) $request->boolean('remember'))) {
                RateLimiter::hit($ipKey, 60);
                RateLimiter::hit($throttleKey, 60);

                Log::warning('Failed calling team login attempt', [
                    'ip'         => $request->ip(),
                    'identifier' => $identifier,
                ]);

                return back()->withErrors([
                    'login' => 'The provided credentials do not match our records.',
                ]);
            }

            // Authentication succeeded: clear rate limiter
            RateLimiter::clear($ipKey);
            RateLimiter::clear($throttleKey);

            $request->session()->regenerate();

            return redirect()->route('callingteam.dashboard');

        } catch (\Throwable $e) {
            RateLimiter::hit($ipKey, 60);
            RateLimiter::hit($throttleKey, 60);

            Log::error('Calling team login exception', [
                'ip'    => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'login' => 'An unexpected error occurred during login. Please try again later.',
            ]);
        }
    }

    protected function determineLoginField(string $identifier): string
    {
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return 'email';
        }

        if (is_numeric($identifier)) {
            return 'phone';
        }

        return 'username';
    }
}
