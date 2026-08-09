<?php

use App\Http\Middleware\ContractorMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PartnerMiddleware;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

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

        // Default Redirect Rules (Logged-in user ko '/' redirect karega)
        $middleware->redirectTo(
            guests: '/login',
            users: '/'
        );

        // Custom Middleware Aliases
        $middleware->alias([
            'candidate' => RedirectIfAuthenticated::class, //  alias register kar diya gaya hai
            'auth.superadmin' => SuperAdminMiddleware::class,
            'authorized' => RedirectIfAuthenticated::class,
            'member' => \App\Http\Middleware\MemberMiddleware::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'callingteam' => \App\Http\Middleware\CallingTeamMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();