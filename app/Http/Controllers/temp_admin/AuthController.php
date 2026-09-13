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
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = $request->input('login');

        // Database se user ko email ya username ke zariye find karein
        $admin = Admin::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->first();

        if (! $admin || ! Hash::check($request->input('password'), $admin->password)) {
            return back()->withErrors([
                'login' => 'Credentials record se match nahi karte.',
            ]);
        }

        // Account status check karein (active hai ya nahi)
        if (! $admin->status) {
            return back()->withErrors([
                'error' => 'Aapka account currently deactivated ya suspended hai.',
            ]);
        }

        // Authenticate guard and persist session
        Auth::guard('admin')->login($admin, $request->boolean('remember'));
        $request->session()->put('admin_logged_in_id', $admin->id);
        $request->session()->save();
        $request->session()->regenerate();

        // Database role ke mutabiq redirection URL set karein
        $redirectUrl = route('admin.dashboard');
        if ($admin->role === 'super_admin') {
            $redirectUrl = route('admin.super.dashboard');
        } elseif ($admin->role === 'team_member') {
            $redirectUrl = route('admin.member.dashboard');
        }

        return Inertia::location($redirectUrl);
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();
        $request->session()->forget('admin_logged_in_id');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('admin.login'));
    }
}