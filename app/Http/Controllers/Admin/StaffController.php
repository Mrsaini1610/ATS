<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Request $request): Response
    {
        $currentUser = Auth::guard('admin')->user();
        if (! $currentUser || $currentUser->isTeamMember()) {
            abort(403, 'Team members are not allowed to access Staff & Team.');
        }

        $query = Admin::query()->latest();

        if ($currentUser->isAdmin()) {
            // Admin only sees their own team members; never super admin or other admins
            $query->where('created_by', $currentUser->id)->where('role', 'team_member');
        } else {
            // Super Admin sees all other staff
            $query->where('id', '!=', $currentUser->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $staff = $query->paginate(10)->withQueryString();

        $staff->getCollection()->transform(function ($member) {
            return [
                'id'          => $member->id,
                'uuid'        => (string) $member->id,
                'name'        => $member->name,
                'username'    => $member->username,
                'email'       => $member->email,
                'phone'       => $member->phone ?? '—',
                'role'        => $member->role,
                'roleLabel'   => str_replace('_', ' ', ucwords($member->role, '_')),
                'active'      => (bool) $member->status,
                'permissions' => $member->permissionList(),
                'createdAt'   => $member->created_at ? $member->created_at->format('d M Y') : 'Recent',
            ];
        });

        return Inertia::render('Admin/Team', [
            'members' => $staff->items(),
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = Auth::guard('admin')->user();
        if (! $currentUser || $currentUser->isTeamMember()) {
            abort(403, 'Team members are not allowed to create staff.');
        }

        $allowedRoles = $currentUser->isSuperAdmin() ? ['admin', 'team_member'] : ['team_member'];

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'username'    => 'required|string|max:255|unique:admins,username',
            'email'       => 'required|email|max:255|unique:admins,email',
            'phone'       => 'nullable|string|max:20',
            'password'    => 'required|string|min:6',
            'role'        => ['required', Rule::in($allowedRoles)],
            'permissions' => 'nullable|array',
        ]);

        $role = $currentUser->isAdmin() ? 'team_member' : $validated['role'];
        $permissions = $validated['permissions'] ?? [];
        if ($currentUser->isAdmin()) {
            $adminPerms = $currentUser->permissionList();
            $permissions = array_values(array_intersect($permissions, $adminPerms));
        }
        if ($role === 'team_member') {
            $staffPerms = ['view_team_member', 'create_team_member', 'edit_team_member', 'status_team_member', 'delete_team_member'];
            $permissions = array_values(array_diff($permissions, $staffPerms));
        }

        Admin::create([
            'name'                 => $validated['name'],
            'username'             => $validated['username'],
            'email'                => $validated['email'],
            'phone'                => $validated['phone'] ?? null,
            'password'             => Hash::make($validated['password']),
            'role'                 => $role,
            'permissions'          => $permissions,
            'status'               => true,
            'created_by'           => $currentUser->id,
            'must_change_password' => false,
        ]);

        return redirect()->back()->with('success', 'Staff member successfully created.');
    }

    public function update(Request $request, Admin $admin)
    {
        $currentUser = Auth::guard('admin')->user();
        if (! $currentUser || $currentUser->isTeamMember()) {
            abort(403, 'Unauthorized.');
        }

        if ($currentUser->isAdmin() && ($admin->created_by !== $currentUser->id || $admin->role !== 'team_member')) {
            abort(403, 'You can only update your own team members.');
        }

        $allowedRoles = $currentUser->isSuperAdmin() ? ['admin', 'team_member'] : ['team_member'];

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'username'    => ['required', 'string', 'max:255', Rule::unique('admins', 'username')->ignore($admin->id)],
            'email'       => ['required', 'email', 'max:255', Rule::unique('admins', 'email')->ignore($admin->id)],
            'phone'       => 'nullable|string|max:20',
            'password'    => 'nullable|string|min:6',
            'role'        => ['required', Rule::in($allowedRoles)],
            'permissions' => 'nullable|array',
        ]);

        $role = $currentUser->isAdmin() ? 'team_member' : $validated['role'];
        $permissions = $validated['permissions'] ?? [];
        if ($currentUser->isAdmin()) {
            $adminPerms = $currentUser->permissionList();
            $permissions = array_values(array_intersect($permissions, $adminPerms));
        }
        if ($role === 'team_member') {
            $staffPerms = ['view_team_member', 'create_team_member', 'edit_team_member', 'status_team_member', 'delete_team_member'];
            $permissions = array_values(array_diff($permissions, $staffPerms));
        }

        $updateData = [
            'name'        => $validated['name'],
            'username'    => $validated['username'],
            'email'       => $validated['email'],
            'phone'       => $validated['phone'] ?? null,
            'role'        => $role,
            'permissions' => $permissions,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $admin->update($updateData);

        return redirect()->back()->with('success', 'Staff member successfully updated.');
    }

    public function toggleStatus(Admin $admin)
    {
        $currentUser = Auth::guard('admin')->user();
        if (! $currentUser || $currentUser->isTeamMember()) {
            abort(403, 'Unauthorized.');
        }

        if ($currentUser->isAdmin() && ($admin->created_by !== $currentUser->id || $admin->role !== 'team_member')) {
            abort(403, 'You can only manage your own team members.');
        }

        if ($admin->role === 'super_admin') {
            return back()->with('error', 'Super Admin status cannot be toggled.');
        }

        $admin->update([
            'status' => !$admin->status,
        ]);

        return back()->with('success', 'Staff status updated.');
    }

    public function destroy(Admin $admin)
    {
        $currentUser = Auth::guard('admin')->user();
        if (! $currentUser || $currentUser->isTeamMember()) {
            abort(403, 'Unauthorized.');
        }

        if ($currentUser->isAdmin() && ($admin->created_by !== $currentUser->id || $admin->role !== 'team_member')) {
            abort(403, 'You can only delete your own team members.');
        }

        if ($admin->role === 'super_admin') {
            return back()->with('error', 'Super Admin cannot be deleted.');
        }

        $admin->delete();

        return back()->with('success', 'Staff member deleted.');
    }
}