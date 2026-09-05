<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Admin/Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login'       => 'required|string',
            'password'    => 'required|string',
            'target_role' => 'required|in:super_admin,admin,team_member',
        ]);

        $loginInput = $request->input('login');
        $targetRole = $request->input('target_role');

        $admin = Admin::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->first();

        if (! $admin || ! Hash::check($request->input('password'), $admin->password)) {
            return back()->withErrors([
                'login' => 'Credentials record se match nahi karte.',
            ]);
        }

        if ($admin->role !== $targetRole) {
            $readableTarget = str_replace('_', ' ', ucwords($targetRole, '_'));
            $readableUserRole = str_replace('_', ' ', ucwords($admin->role, '_'));

            return back()->withErrors([
                'error' => "Access Denied: Yeh account '{$readableUserRole}' hai. Aapne '{$readableTarget}' tab select kiya hai.",
            ]);
        }

        if (! $admin->status) {
            return back()->withErrors([
                'error' => 'Aapka account currently deactivated ya suspended hai.',
            ]);
        }

        Auth::guard('admin')->login($admin, $request->boolean('remember'));
        $request->session()->regenerate();

        // Determine destination route based on role
        $redirectUrl = route('admin.dashboard');
        if ($admin->role === 'super_admin') {
            $redirectUrl = route('admin.super.dashboard');
        } elseif ($admin->role === 'team_member') {
            $redirectUrl = route('admin.member.dashboard');
        }

        // Inertia::location use karne se browser fresh reload ke sath redirect hoga (419 error khatam)
        return Inertia::location($redirectUrl);
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Hard redirect on logout to clear client-side Inertia token memory
        return Inertia::location(route('admin.login'));
    }
}