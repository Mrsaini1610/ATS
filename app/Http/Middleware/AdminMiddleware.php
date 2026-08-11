<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
   // AdminMiddleware.php
public function handle(Request $request, Closure $next)
{
    if (!Auth::guard('admin')->check()) {
        return redirect()->route('home')->with('error', 'Please login as admin');
    }

    // $user = Auth::guard('admin')->user();
    // $userRoles = is_array($user->roles) ? $user->roles : [];

    // if (!in_array(1, $userRoles)) {
    //     Auth::guard('admin')->logout();
    //     return redirect()->route('home')->with('error', 'You are not authorized as admin');
    // }

    return $next($request);
}

}
