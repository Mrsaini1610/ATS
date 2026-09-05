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
    /**
     * List all Staff Members (Admins & Team Members)
     */
    public function index(Request $request): Response
    {
        $query = Admin::query()
            ->where('id', '!=', Auth::guard('admin')->id()) // Exclude logged in Super Admin
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

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $staff = $query->paginate(10)->withQueryString();

        // Transform pagination items for frontend compatibility
        $staff->getCollection()->transform(function ($member) {
            return [
                'id'        => $member->id,
                'uuid'      => (string) $member->id,
                'name'      => $member->name,
                'username'  => $member->username,
                'email'     => $member->email,
                'phone'     => $member->phone ?? '—',
                'role'      => $member->role,
                'roleLabel' => str_replace('_', ' ', ucwords($member->role, '_')),
                'active'    => (bool) $member->status,
                'createdAt' => $member->created_at ? $member->created_at->format('d M Y') : 'Recent',
            ];
        });

        return Inertia::render('Admin/Team', [
            'members' => $staff->items(),
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Store new Staff Member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:admins,username',
            'email'    => 'required|email|max:255|unique:admins,email',
            'phone'    => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'role'     => ['required', Rule::in(['admin', 'team_member', 'super_admin'])],
        ]);

        Admin::create([
            'name'                 => $validated['name'],
            'username'             => $validated['username'],
            'email'                => $validated['email'],
            'phone'                => $validated['phone'] ?? null,
            'password'             => Hash::make($validated['password']),
            'role'                 => $validated['role'],
            'status'               => true,
            'created_by'           => Auth::guard('admin')->id(),
            'must_change_password' => false,
        ]);

        return redirect()->back()->with('success', 'Staff member successfully created.');
    }

    /**
     * Toggle Active/Inactive Status
     */
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

    /**
     * Delete Staff Member
     */
    public function destroy(Admin $admin)
    {
        if ($admin->role === 'super_admin') {
            return back()->with('error', 'Super Admin cannot be deleted.');
        }

        $admin->delete();

        return back()->with('success', 'Staff member deleted.');
    }
}