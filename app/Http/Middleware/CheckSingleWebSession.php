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
     * (Web session is kept independent of Mobile App token session).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Candidate Web Guard Check
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            $currentSessionId = $request->session()->getId();

            if ($user && $user->current_web_session_id && $user->current_web_session_id !== $currentSessionId) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                $message = 'Aapka account kisi doosre device ya browser me login kiya gaya hai. Is wajah se aapka session yahan band kar diya gaya hai.';

                if ($request->wantsJson() && !$request->header('X-Inertia')) {
                    return response()->json([
                        'logged_out_other_device' => true,
                        'message'                 => $message,
                    ], 401);
                }

                return redirect()->route('login')->with('logged_out_other_device', $message);
            }
        }

        // 2. Admin Web Guard Check
        if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();
            $currentSessionId = $request->session()->getId();

            if ($admin && $admin->current_web_session_id && $admin->current_web_session_id !== $currentSessionId) {
                Auth::guard('admin')->logout();
                $request->session()->forget('admin_logged_in_id');
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                $message = 'Aapka Admin account kisi doosre browser/device me login ho chuka hai. Yahan se session logout kar diya gaya hai.';

                if ($request->wantsJson() && !$request->header('X-Inertia')) {
                    return response()->json([
                        'logged_out_other_device' => true,
                        'message'                 => $message,
                    ], 401);
                }

                return redirect()->route('admin.login')->with('logged_out_other_device', $message);
            }
        }

        return $next($request);
    }
}

