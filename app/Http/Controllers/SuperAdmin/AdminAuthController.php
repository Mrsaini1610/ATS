<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ]);

        $field = $this->determineLoginField($request->identifier);

        $superAdmin = SuperAdmin::where($field, $request->identifier)->first();
        if ($superAdmin) {
            if ((int)($superAdmin->status ?? 1) === 0) {
                return back()->withErrors([
                    'login' => 'Your account is inactive. Please contact admin to activate your account.',
                ]);
            }

            if (Auth::guard('superadmin')->attempt([
                $field => $request->identifier,
                'password' => $request->password,
                'status' => 1,
            ], (bool)$request->remember)) {
                $request->session()->regenerate();
                return redirect()->route('super.dashboard');
            }

            return back()->withErrors([
                'login' => 'The provided credentials do not match our records.',
            ]);
        }

        $member = Member::where($field, $request->identifier)->first();
        if (!$member) {
            return back()->withErrors([
                'login' => 'The provided credentials do not match our records.',
            ]);
        }

        if ((int)($member->status ?? 1) === 0) {
            return back()->withErrors([
                'login' => 'Your account is inactive. Please contact admin to activate your account.',
            ]);
        }

        if ($member->is_calling_team) {
            return back()->withErrors([
                'login' => 'Use the calling team login portal to access your account.',
            ]);
        }

        $guard = $this->determineGuardFromRoles(is_array($member->roles) ? $member->roles : []);

        if (!Auth::guard($guard)->attempt([
            $field => $request->identifier,
            'password' => $request->password,
            'status' => 1,
        ], (bool)$request->remember)) {
            return back()->withErrors([
                'login' => 'The provided credentials do not match our records.',
            ]);
        }

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
                'login' => 'You do not have access to any valid roles',
            ]);
        }

        session(['current_role' => $roleId]);

        return match ((int)$roleId) {
            1 => redirect()->route('admin.dashboard'),
            3 => redirect()->route('member.dashboard'),
            default => redirect()->intended('/'),
        };
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
