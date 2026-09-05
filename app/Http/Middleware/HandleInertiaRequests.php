<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $adminUser = null;
        if (Auth::guard('admin')->check()) {
            $adminUser = Auth::guard('admin')->user();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'admin' => $adminUser ? [
                    'id'            => $adminUser->id,
                    'uuid'          => $adminUser->uuid,
                    'name'          => $adminUser->name,
                    'email'         => $adminUser->email,
                    'role'          => $adminUser->role,
                    'profile_image' => $adminUser->profile_image,
                ] : null,
            ],
            'csrf_token' => csrf_token(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}