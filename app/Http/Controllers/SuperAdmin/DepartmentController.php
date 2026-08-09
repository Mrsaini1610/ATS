<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Department;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{


    /**
     * Get paginated departments with search, status, and creator filters
     *
     * @param Request $request - Contains filter params: search, status, created_by, per_page
     * @return Inertia\Response - Renders departments/Index view with filtered data
     */
    public function departments(Request $request)
    {
        $roles = Department::with(['creator', 'designationList' => function ($query) {
            $query->select('id', 'name', 'department_id', 'description', 'slug');
        }])
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->status, function ($q) use ($request) {
                $statusValue = $request->status == 'active' ? 1 : 0;
                $q->where('status', $statusValue);
            })
            ->when($request->created_by, fn($q) => $q->where('created_by', $request->created_by))
            ->latest()
            ->paginate($request->per_page ?? 10);
        return Inertia::render('SuperAdmin/Departments/List', [
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
   public function addDepartments(Request $request, $uuid = null)
{
    // Trim trailing dots and spaces from name
    $name = rtrim($request->input('name'), " .");

    // Generate unique slug
    $slug = $this->generateUniqueDepartmentSlug($name, $uuid);

    $validationRules = [
        'name' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) use ($uuid) {
                $cleanedName = rtrim($value, " .");
                $existing = Department::whereRaw('LOWER(name) = ?', [strtolower($cleanedName)])
                    ->whereNull('deleted_at')
                    ->when($uuid, fn($q) => $q->where('uuid', '!=', $uuid))
                    ->first();

                if ($existing) {
                    $fail('The department name already exists.');
                }
            },
        ],
    ];
    if ($request->isMethod('post')) {
        $validationRules['created_by'] = 'required|exists:super_admins,id';
    }
    $validated = $request->validate($validationRules);
    $departmentData = [
        'name' => $name,
        'slug' => $slug,
    ];
    if ($request->isMethod('post')) {
        $departmentData['created_by'] = $validated['created_by'];
        $department = Department::create($departmentData);
        $message = 'Department created successfully!';
    } else {
        $department = Department::where('uuid', $uuid)->firstOrFail();
        $department->update($departmentData);
        $message = 'Department updated successfully!';
    }
    return redirect()->back()->with('success', $message);
}

private function generateUniqueDepartmentSlug($name, $uuid = null)
{
    $baseSlug = Str::slug($name);
    $slug = $baseSlug;
    $i = 2;
    while (
        Department::withTrashed()
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
            $departmentDetails = Department::where('uuid', $uuid)->first();

            if (!$departmentDetails) {
                return redirect()->back()->with('error', 'Department not found.');
            }
            $validatedStatus = $request->status ?? $status;
            if (!in_array($validatedStatus, [0, 1])) {
                return redirect()->back()->with('error', 'Invalid status value.');
            }
            $departmentDetails->status = $validatedStatus;
            $departmentDetails->save();
            return redirect()->back()->with('success', 'Department status updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong while updating the status.');
        }
    }

    /**
     * Soft delete the specified member.
     *
     * @param int $id The ID of the member to delete.
     * @return RedirectResponse Redirects back with a success message.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If the member is not found.
     */
    public function destroy($id)
    {
        $member = Department::where('uuid',$id)->first();
        $member->delete();

        return redirect()->back()->with('success', 'Department deleted successfully!');
    }
}
