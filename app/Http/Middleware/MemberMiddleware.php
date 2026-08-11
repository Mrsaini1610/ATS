<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\Member;
class MemberMiddleware
{

// MemberMiddleware.php
public function handle(Request $request, Closure $next)
{
    if (!Auth::guard('member')->check()) {
        return redirect()->route('home')->with('error', 'Please login as member');
    }



    return $next($request);
}
}
