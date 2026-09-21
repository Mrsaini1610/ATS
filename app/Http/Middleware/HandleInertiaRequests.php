<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Inertia\Inertia;
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
                    'permissions'   => $adminUser->permissionList(),
                    'profile_image' => $adminUser->profile_image,
                ] : null,
            ],
            'csrf_token' => csrf_token(),
            'flash' => Inertia::always(function () use ($request) {
                $session = $request->hasSession() ? $request->session() : null;
                $success = $session ? ($session->get('success') ?? $session->get('status')) : null;
                $error   = $session ? $session->get('error') : null;
                $warning = $session ? $session->get('warning') : null;
                $info    = $session ? $session->get('info') : null;

                // Fallback: check if flasher envelopes exist in session
                if ($session && $session->has('flasher::envelopes')) {
                    try {
                        $rawEnvelopes = $session->get('flasher::envelopes', []);
                        if (is_array($rawEnvelopes)) {
                            foreach ($rawEnvelopes as $raw) {
                                $env = null;
                                if ($raw instanceof \Flasher\Prime\Notification\Envelope) {
                                    $env = $raw;
                                } elseif (is_string($raw)) {
                                    $env = @unserialize($raw);
                                }
                                if ($env instanceof \Flasher\Prime\Notification\Envelope) {
                                    $t = $env->getType();
                                    $m = $env->getMessage();
                                    if ($t === 'success' && empty($success)) $success = $m;
                                    elseif ($t === 'error' && empty($error)) $error = $m;
                                    elseif ($t === 'warning' && empty($warning)) $warning = $m;
                                    elseif ($t === 'info' && empty($info)) $info = $m;
                                }
                            }
                        }
                        $session->forget('flasher::envelopes');
                    } catch (\Throwable $e) {
                        // ignore gracefully
                    }
                }

                return [
                    'success' => $success,
                    'error'   => $error,
                    'warning' => $warning,
                    'info'    => $info,
                    '_key'    => ($success || $error || $warning || $info) ? uniqid('flash_', true) : null,
                ];
            }),
            'messages' => Inertia::always(function () use ($request) {
                return ['envelopes' => []];
            }),
        ]);
    }
}

