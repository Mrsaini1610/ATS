<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $members = Admin::where('role', '!=', 'super_admin')
            ->latest()
            ->get()
            ->map(function (Admin $admin) {
                return [
                    'id'          => $admin->id,
                    'name'        => $admin->name,
                    'role'        => $admin->role,
                    'permissions' => $admin->permissionList(),
                ];
            });

        return Inertia::render('Admin/Permissions', [
            'members' => $members,
        ]);
    }

    public function update(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'permissions'   => 'present|array',
            'permissions.*' => 'string',
        ]);

        $permissions = array_values($validated['permissions']);

        if ($admin->role === 'team_member') {
            $staffPerms = [
                'view_team_member',
                'create_team_member',
                'edit_team_member',
                'status_team_member',
                'delete_team_member',
            ];
            $permissions = array_values(array_diff($permissions, $staffPerms));
        }

        $admin->update([
            'permissions' => $permissions,
        ]);

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}
