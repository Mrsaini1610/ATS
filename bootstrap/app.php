<?php

use App\Http\Middleware\AdminAuthenticate;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventBackHistory;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Web Middleware Stack
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Dynamic Redirects (Admin vs Candidate)
        $middleware->redirectTo(
            guests: function (Request $request) {
                if ($request->is('admin') || $request->is('admin/*')) {
                    return route('admin.login');
                }
                return route('login');
            },
            users: function (Request $request) {
                if (Auth::guard('admin')->check()) {
                    $admin = Auth::guard('admin')->user();
                    if ($admin->role === 'super_admin') {
                        return route('admin.super.dashboard');
                    } elseif ($admin->role === 'team_member') { 
                        return route('admin.member.dashboard');
                    }
                    return route('admin.dashboard');
                }
                return route('home');
            }
        );

        // Custom Middleware Aliases
        $middleware->alias([
            'admin.auth' => AdminAuthenticate::class,
            'no-cache'   => PreventBackHistory::class, // <--- 419 error fix karne ke liye add kiya
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();