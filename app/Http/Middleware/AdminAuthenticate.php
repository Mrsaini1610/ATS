<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthenticate
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Check if admin guard is logged in
        if (! Auth::guard('admin')->check()) {
            return redirect()->route('admin.login');
        }

        $admin = Auth::guard('admin')->user();

        // 2. Account active status check
        if (! $admin->status) {
            Auth::guard('admin')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->withErrors([
                'error' => 'Aapka account currently deactivated ya suspended hai.',
            ]);
        }

        // 3. Role check (agar middleware me role pass kiya ho)
        if (! empty($roles) && ! in_array($admin->role, $roles)) {
            // Agar role match nahi hota toh candidate page par nahi, balki uske sahi dashboard par bhejein
            if ($admin->role === 'super_admin') {
                return redirect()->route('admin.super.dashboard');
            } elseif ($admin->role === 'calling_team') {
                return redirect()->route('admin.calling.dashboard');
            }
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
