<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = auth('admin')->user();
        $assignedPermissions = $user?->permissionList() ?? [];
        $allowed = $user?->role === 'super_admin' || collect($permissions)
            ->flatMap(fn ($permission) => explode(',', $permission))
            ->contains(fn ($permission) => in_array($permission, $assignedPermissions, true));

        if (!$user || !$allowed) {
            abort(403, 'Unauthorized: Missing required permission.');
        }

        return $next($request);
    }
}