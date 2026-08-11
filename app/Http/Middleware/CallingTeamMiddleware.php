<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CallingTeamMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::guard('callingteam')->check()) {
            return redirect()->route('callingteam.login')->with('error', 'Please login as calling team member');
        }

        $user = Auth::guard('callingteam')->user();

        if (!$user || !$user->is_calling_team) {
            Auth::guard('callingteam')->logout();

            return redirect()->route('callingteam.login')->with('error', 'You are not authorized as calling team member');
        }

        return $next($request);
    }
}
