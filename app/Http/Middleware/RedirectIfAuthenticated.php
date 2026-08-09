<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string[] ...$guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                switch ($guard) {
                    case 'superadmin':
                        return redirect()->route('super.dashboard');
                    case 'admin':
                        return redirect()->route('admin.dashboard');
                    case 'member':
                        return redirect()->route('member.dashboard');
                    case 'callingteam':
                        return redirect()->route('callingteam.dashboard');
                    default:
                        return redirect('/dashboard');
                }
            }
        }

        return $next($request);
    }
}
