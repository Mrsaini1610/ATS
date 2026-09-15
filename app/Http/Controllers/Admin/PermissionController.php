<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $members = Admin::whereIn('role', ['admin', 'team_member'])
            ->latest()
            ->get()
            ->map(function ($admin) {
                $permissions = $admin->permissions;

                return [
                    'id'          => $admin->id,
                    'name'        => $admin->name,
                    'role'        => $admin->role,
                    'permissions' => is_string($permissions)
                        ? (json_decode($permissions, true) ?: [])
                        : (is_array($permissions) ? $permissions : []),
                ];
            });

        return Inertia::render('Admin/Permissions', [
            'members' => $members,
        ]);
    }

    public function update(Request $request, Admin $admin)
    {
        if ($admin->isSuperAdmin()) {
            return back()->withErrors(['permissions' => 'Super Admin permissions cannot be changed.']);
        }

        $validated = $request->validate([
            'permissions'   => 'present|array',
            'permissions.*' => ['string', Rule::in([
                'create_jobs', 'approve_jobs', 'reject_jobs', 'hold_jobs', 'deactivate_jobs',
                'view_applications', 'update_application_status', 'create_companies', 'edit_companies',
                'delete_companies', 'create_categories', 'edit_categories', 'create_skills', 'edit_skills',
                'create_admin', 'create_team_member', 'manage_permissions', 'add_users', 'view_users',
                'call_users', 'delete_user', 'assign_tasks', 'view_tasks', 'complete_tasks',
                'schedule_interviews', 'update_interviews',
            ])],
        ]);

        $admin->update([
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}