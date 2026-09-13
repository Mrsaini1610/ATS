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
            ->map(function ($admin) {
                return [
                    'id'          => $admin->id,
                    'name'        => $admin->name,
                    'role'        => $admin->role,
                    'permissions' => $admin->permissions ? json_decode($admin->permissions, true) : [],
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

        $admin->update([
            'permissions' => json_encode($validated['permissions']),
        ]);

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}