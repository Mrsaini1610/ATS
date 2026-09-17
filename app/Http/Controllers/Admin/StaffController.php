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
        $query = Admin::query()
            ->where('id', '!=', Auth::guard('admin')->id())
            ->latest();

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
                'permissions' => $member->permissions ?? [],
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
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'username'    => 'required|string|max:255|unique:admins,username',
            'email'       => 'required|email|max:255|unique:admins,email',
            'phone'       => 'nullable|string|max:20',
            'password'    => 'required|string|min:6',
            'role'        => ['required', Rule::in(['admin', 'team_member', 'super_admin'])],
            'permissions' => 'nullable|array',
        ]);

        Admin::create([
            'name'                 => $validated['name'],
            'username'             => $validated['username'],
            'email'                => $validated['email'],
            'phone'                => $validated['phone'] ?? null,
            'password'             => Hash::make($validated['password']),
            'role'                 => $validated['role'],
            'permissions'          => $validated['permissions'] ?? [],
            'status'               => true,
            'created_by'           => Auth::guard('admin')->id(),
            'must_change_password' => false,
        ]);

        return redirect()->back()->with('success', 'Staff member successfully created.');
    }

    public function update(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'username'    => ['required', 'string', 'max:255', Rule::unique('admins', 'username')->ignore($admin->id)],
            'email'       => ['required', 'email', 'max:255', Rule::unique('admins', 'email')->ignore($admin->id)],
            'phone'       => 'nullable|string|max:20',
            'password'    => 'nullable|string|min:6',
            'role'        => ['required', Rule::in(['admin', 'team_member', 'super_admin'])],
            'permissions' => 'nullable|array',
        ]);

        $updateData = [
            'name'        => $validated['name'],
            'username'    => $validated['username'],
            'email'       => $validated['email'],
            'phone'       => $validated['phone'] ?? null,
            'role'        => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $admin->update($updateData);

        return redirect()->back()->with('success', 'Staff member successfully updated.');
    }

    public function toggleStatus(Admin $admin)
    {
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
        if ($admin->role === 'super_admin') {
            return back()->with('error', 'Super Admin cannot be deleted.');
        }

        $admin->delete();

        return back()->with('success', 'Staff member deleted.');
    }
}