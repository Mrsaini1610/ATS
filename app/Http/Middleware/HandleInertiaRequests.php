<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use App\Models\Admin;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $adminUser = null;

        // Check if admin guard is authenticated
        if (Auth::guard('admin')->check()) {
            $adminUser = Auth::guard('admin')->user();
        } 
        // Fallback: If session has our custom admin id, fetch directly
        elseif (session()->has('admin_id')) {
            $adminUser = Admin::find(session('admin_id'));
            if ($adminUser) {
                Auth::guard('admin')->setUser($adminUser);
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'admin' => $adminUser ? [
                    'id'            => $adminUser->id,
                    'uuid'          => $adminUser->uuid,
                    'name'          => $adminUser->name,
                    'email'         => $adminUser->email,
                    'role'          => $adminUser->role, // super_admin, admin, team_member
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

