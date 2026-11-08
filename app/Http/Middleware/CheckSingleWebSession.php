<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSingleWebSession
{
    /**
     * Handle an incoming request.
     * Enforces single active web session per candidate and admin.
     * Candidate web session is independent of candidate mobile app session.
     * Admin and Candidate can be logged in concurrently on the same browser without conflict.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $currentSessionId = $request->session()->getId();
        $isAdminRoute = $request->is('admin') || $request->is('admin/*');

        // 1. Candidate Web Guard Check
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();

            if ($user && $user->current_web_session_id && $user->current_web_session_id !== $currentSessionId) {
                // Candidate logged into another web browser / device
                Auth::guard('web')->logout();
                $request->session()->forget(Auth::guard('web')->getName());

                // Only invalidate entire session if admin is not logged in
                if (!Auth::guard('admin')->check()) {
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }

                $message = 'Aapka account kisi doosre device ya browser me login kiya gaya hai. Is wajah se aapka session yahan band kar diya gaya hai.';

                // If user was browsing candidate routes, redirect or return error
                if (!$isAdminRoute) {
                    if ($request->wantsJson() && !$request->header('X-Inertia')) {
                        return response()->json([
                            'logged_out_other_device' => true,
                            'guard'                   => 'web',
                            'message'                 => $message,
                        ], 401);
                    }

                    return redirect()->route('login')->with('logged_out_other_device', $message);
                }
                // If user was in Admin Panel, candidate session is quietly cleared without disrupting admin work
            }
        }

        // 2. Admin Web Guard Check
        if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();

            if ($admin && $admin->current_web_session_id && $admin->current_web_session_id !== $currentSessionId) {
                // Admin logged into another system / browser
                Auth::guard('admin')->logout();
                $request->session()->forget('admin_logged_in_id');
                $request->session()->forget(Auth::guard('admin')->getName());

                // Only invalidate entire session if candidate is not logged in
                if (!Auth::guard('web')->check()) {
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }

                $message = 'Aapka Admin account kisi doosre browser/device me login ho chuka hai. Yahan se session logout kar diya gaya hai.';

                // If user was in Admin Panel, redirect to admin login
                if ($isAdminRoute) {
                    if ($request->wantsJson() && !$request->header('X-Inertia')) {
                        return response()->json([
                            'logged_out_other_device' => true,
                            'guard'                   => 'admin',
                            'message'                 => $message,
                        ], 401);
                    }

                    return redirect()->route('admin.login')->with('logged_out_other_device', $message);
                }
                // If user was browsing candidate site, admin session is quietly cleared without disrupting candidate browsing
            }
        }

        return $next($request);
    }
}

