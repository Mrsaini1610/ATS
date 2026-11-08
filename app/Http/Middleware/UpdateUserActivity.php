<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UpdateUserActivity
{
    /**
     * Handle an incoming request.
     * Continuously tracks active / online presence for Candidate & Admin.
     * Throttled to at most once per 45 seconds per user.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $now = now();

        // 1. Candidate Web Presence
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            if ($user) {
                $lastActive = $user->web_last_active;
                if (!$user->web_is_online || !$lastActive || $lastActive->diffInSeconds($now) >= 45) {
                    $user->updateQuietly([
                        'web_is_online'   => true,
                        'web_last_active' => $now,
                        'is_online'       => true,
                        'last_active'     => $now,
                    ]);
                }
            }
        }

        // 2. Admin Presence
        if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();
            if ($admin) {
                $lastActive = $admin->last_active;
                if (!$admin->is_online || !$lastActive || $lastActive->diffInSeconds($now) >= 45) {
                    $admin->updateQuietly([
                        'is_online'       => true,
                        'last_active'     => $now,
                        'web_is_online'   => true,
                        'web_last_active' => $now,
                    ]);
                }
            }
        }

        // 3. Candidate Mobile App API (Sanctum) Presence
        if ($request->is('api/*') && Auth::guard('sanctum')->check()) {
            $apiUser = Auth::guard('sanctum')->user();
            if ($apiUser && $apiUser instanceof \App\Models\User) {
                $lastActive = $apiUser->app_last_active;
                if (!$apiUser->app_is_online || !$lastActive || $lastActive->diffInSeconds($now) >= 45) {
                    $apiUser->updateQuietly([
                        'app_is_online'   => true,
                        'app_last_active' => $now,
                        'is_online'       => true,
                        'last_active'     => $now,
                    ]);
                }
            }
        }

        return $next($request);
    }
}

