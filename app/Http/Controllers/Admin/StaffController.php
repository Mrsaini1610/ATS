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
                'phone'       => $member->phone ?? '',
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
        // Name strictly alphabetical aur phone exactly 10 digits validation
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\s]+$/'],
            'username'    => 'required|string|max:255',
            'email'       => 'required|email|max:255',
            'phone'       => ['nullable', 'digits:10'],
            'password'    => 'required|string|min:6',
            'role'        => ['required', Rule::in(['admin', 'team_member', 'super_admin'])],
            'permissions' => 'nullable|array',
            'force_action'=> 'nullable|string|in:restore,force_new',
        ], [
            'name.regex' => 'The name may only contain alphabetical letters and spaces.',
            'phone.digits' => 'The phone number must be exactly 10 digits without +91.',
        ]);

        // Check if already exists in active records
        $existingActive = Admin::where('email', $validated['email'])
            ->orWhere('username', $validated['username'])
            ->first();

        if ($existingActive) {
            return back()->withErrors([
                'email' => 'The email or username has already been taken.',
            ]);
        }

        // Check if exists in soft-deleted records (Trash)
        $trashedAdmin = Admin::onlyTrashed()
            ->where(function($q) use ($validated) {
                $q->where('email', $validated['email'])
                  ->orWhere('username', $validated['username']);
            })
            ->first();

        if ($trashedAdmin && !$request->filled('force_action')) {
            // Frontend ko prompt ke liye flash signal bhejo
            return redirect()->back()->with([
                'trashed_conflict' => [
                    'id' => $trashedAdmin->id,
                    'email' => $trashedAdmin->email,
                ]
            ]);
        }

        if ($trashedAdmin && $request->input('force_action') === 'restore') {
            // Restore purana member aur data update kar do
            $trashedAdmin->restore();
            $trashedAdmin->update([
                'name'         => $validated['name'],
                'username'     => $validated['username'],
                'phone'        => $validated['phone'] ?? null,
                'role'         => $validated['role'],
                'permissions'  => $validated['permissions'] ?? [],
                'status'       => true,
            ]);

            if (!empty($validated['password'])) {
                $trashedAdmin->update(['password' => Hash::make($validated['password'])]);
            }

            return redirect()->back()->with('success', 'Previously deleted staff member successfully restored and updated.');
        }

        if ($trashedAdmin && $request->input('force_action') === 'force_new') {
            // Purana data permanent delete (force delete) kar do
            $trashedAdmin->forceDelete();
        }

        // Naya create karega
        Admin::create([
            'name'                 => $validated['name'],
            'username'             => $validated['username'],
            'email'                => $validated['email'],
            'phone'                => $validated['phone'] ?? null, // +91 store nahi hoga, sirf 10 digits
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
            'name'        => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\s]+$/'],
            'username'    => ['required', 'string', 'max:255', Rule::unique('admins', 'username')->ignore($admin->id)],
            'email'       => ['required', 'email', 'max:255', Rule::unique('admins', 'email')->ignore($admin->id)],
            'phone'       => ['nullable', 'digits:10'],
            'password'    => 'nullable|string|min:6',
            'role'        => ['required', Rule::in(['admin', 'team_member', 'super_admin'])],
            'permissions' => 'nullable|array',
        ], [
            'name.regex' => 'The name may only contain alphabetical letters and spaces.',
            'phone.digits' => 'The phone number must be exactly 10 digits without +91.',
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

        $admin->delete(); // Soft delete

        return back()->with('success', 'Staff member deleted.');
    }
}
