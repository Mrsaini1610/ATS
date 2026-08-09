<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Department;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Models\Role;

class RolesController extends Controller
{

     /**
     * Get paginated departments with search, status, and creator filters
     *
     * @param Request $request - Contains filter params: search, status, created_by, per_page
     * @return Inertia\Response - Renders departments/Index view with filtered data
     */
    public function list(Request $request)
    {
        $roles = Role::with(['creator'])
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->status, function ($q) use ($request) {
                $statusValue = $request->status == 'active' ? 1 : 0;
                $q->where('status', $statusValue);
            })
            ->when($request->created_by, fn($q) => $q->where('created_by', $request->created_by))
            ->latest()
            ->paginate($request->per_page ?? 10);

        return Inertia::render('SuperAdmin/Roles/List', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'status', 'created_by', 'per_page'])
        ]);
    }
    /**
     * Create or update a departments
     *
     * @param Request $request - Contains departments data: name, status, created_by (for create)
     * @param string|null $uuid - UUID of departments to update (null for create)
     * @return \Illuminate\Http\RedirectResponse - Redirects back with success message
     * @throws \Illuminate\Validation\ValidationException - If validation fails
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException - If departments not found (update)
     */
   public function addRole(Request $request, $uuid = null)
{
    // Normalize name
    $name = rtrim($request->input('name'), " .");

    // Generate unique slug
    $slug = $this->generateUniqueSlug($name, $uuid);

    $validationRules = [
        'name' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) use ($uuid) {
                $cleanedName = rtrim($value, " .");
                $existing = Role::whereRaw('LOWER(name) = ?', [strtolower($cleanedName)])
                    ->whereNull('deleted_at')
                    ->when($uuid, fn($q) => $q->where('uuid', '!=', $uuid))
                    ->first();

                if ($existing) {
                    $fail('The role name already exists.');
                }
            },
        ],
    ];

    if ($request->isMethod('post')) {
        $validationRules['created_by'] = 'required|exists:super_admins,id';
    }

    $validated = $request->validate($validationRules);

    $roleData = [
        'name' => $name,
        'slug' => $slug,
    ];

    if ($request->isMethod('post')) {
        $roleData['created_by'] = $validated['created_by'];
        $role = Role::create($roleData);
        $message = 'Role created successfully!';
    } else {
        $role = Role::where('uuid', $uuid)->firstOrFail();
        $role->update($roleData);
        $message = 'Role updated successfully!';
    }

    return redirect()->back()->with('success', $message);
}
private function generateUniqueSlug($name, $uuid = null)
{
    $baseSlug = Str::slug($name);
    $slug = $baseSlug;
    $i = 2;

    while (
        Role::withTrashed()
            ->where('slug', $slug)
            ->when($uuid, fn($q) => $q->where('uuid', '!=', $uuid))
            ->exists()
    ) {
        $slug = $baseSlug . '_' . $i;
        $i++;
    }

    return $slug;
}


  public function updateStatus(Request $request, $uuid, $status = 1)
{
    try {
        $roleDetails = Role::where('uuid', $uuid)->first();
        if (!$roleDetails) {
            return redirect()->back()->with('error', 'Role not found.');
        }
        $validatedStatus = $request->status ?? $status;
        if (!in_array($validatedStatus, [0, 1])) {
            return redirect()->back()->with('error', 'Invalid status value.');
        }
        $roleDetails->status = $validatedStatus;
        $roleDetails->save();
        return redirect()->back()->with('success', 'Role status updated successfully!');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Something went wrong while updating the role status.');
    }
}

/**
     * Soft delete the specified Role.
     *
     * @param int $id The ID of the Role to delete.
     * @return RedirectResponse Redirects back with a success message.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If the Role is not found.
     */
    public function destroy($id)
    {
        $member = Role::where('uuid',$id)->first();
        $member->delete();

        return redirect()->back()->with('success', 'Role deleted successfully!');
    }
}
