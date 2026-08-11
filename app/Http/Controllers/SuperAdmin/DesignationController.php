<?php

namespace App\Http\Controllers\SuperAdmin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Department;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use App\Models\Role;
use App\Models\Designation;
use App\Models\SuperAdmin;
use App\Models\WhatsappLog;
use App\Services\InteraktServices;

use function App\createMessagePayload;

class DesignationController extends Controller
{
    /**
     * Display a listing of the designations with optional filters.
     *
     * @param Request $request The incoming request with optional query params: search, status, per_page.
     * @return Response Returns an Inertia response with paginated designations.
     */
    public function index(Request $request)
    {
        $designations = Designation::query()
            ->with(['creator', 'department'])
            ->when(
                $request->search,
                fn($q) => $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('slug', 'like', "%{$request->search}%")
            )
            ->when(
                $request->status,
                fn($q) => $q->where('status', $request->status == 'active' ? 1 : 0)
            )
            ->latest()
            ->paginate($request->per_page ?? 10);
        $designations->getCollection()->transform(function ($designation) {
            $members = Member::where('status', 1)
                ->whereJsonContains('designation', (string)$designation->id)
                ->get();
            $designation->member_count = $members->count();
            $designation->member_details = $members;

            return $designation;
        });
        $departments = Department::where('status', 1)->get(['id', 'name']);
        return Inertia::render('SuperAdmin/Designation/List', [
            'designations' => $designations,
            'departments' => $departments,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    /**
     * Store a newly created designation or update an existing one.
     *
     * @param Request $request The incoming request with designation data.
     * @return RedirectResponse Redirects back with success message or validation errors.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department_id' => ['required', 'exists:departments,id'],
            'status' => ['required', 'in:active,inactive'],
        ]);
        $name = rtrim($request->input('name'), " .");
        $isUpdate = $request->has('id') && $request->id;
        $existingDesignation = $isUpdate
            ? Designation::where('uuid', $request->id)->firstOrFail()
            : null;
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $i = 2;
        while (
            Designation::withTrashed()
            ->where('slug', $slug)
            ->when($isUpdate, fn($q) => $q->where('uuid', '!=', $existingDesignation->uuid))
            ->exists()
        ) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }
        $data = [
            'name' => $name,
            'status' => $request->status == 'active' ? 1 : 0,
            'department_id' => $request->department_id,
            'created_by' => auth('superadmin')->id(),
        ];
        if (!$isUpdate || $existingDesignation->name !== $name) {
            $data['slug'] = $slug;
        }
        if ($isUpdate) {
            $existingDesignation->update($data);
            $message = 'Designation updated successfully!';
        } else {
            Designation::create($data);
            $message = 'Designation created successfully!';
        }
        return redirect()->back()->with('success', $message);
    }

    /**
     * Soft delete the specified designation.
     *
     * @param string $id The UUID of the designation to delete.
     * @return RedirectResponse Redirects back with a success message.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If the designation is not found.
     */
    public function destroy($id)
    {
        $designation = Designation::where('uuid', $id)->firstOrFail();
        $designation->delete();

        return redirect()->back()->with('success', 'Designation deleted successfully!');
    }

    public function updateStatus(Request $request, $uuid, $status = 1)
    {
        try {
            $designationDetails = Designation::where('uuid', $uuid)->first();
            if (!$designationDetails) {
                return redirect()->back()->with('error', 'Designation not found.');
            }
            $validatedStatus = $request->status ?? $status;
            if (!in_array($validatedStatus, [0, 1])) {
                return redirect()->back()->with('error', 'Invalid status value.');
            }
            $designationDetails->status = $validatedStatus;
            $designationDetails->save();
            return redirect()->back()->with('success', 'Designation status updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong while updating the status.');
        }
    }

    public function members(Designation $designation)
    {
        $members = Member::where('status', 1)
            ->get();
        $allDesignationIds = collect();
        $members->each(function ($member) use ($allDesignationIds) {
            $designations = $member->designation ?? [];
            $allDesignationIds->push(...$designations);
        });
        $designationNames = Designation::whereIn('id', $allDesignationIds->unique())
            ->pluck('name', 'id')
            ->toArray();
        return response()->json([
            'members' => $members->map(function ($member) use ($designation, $designationNames) {
                $memberDesignations = $member->designation ?? [];
                $memberDesignationNames = array_intersect_key(
                    $designationNames,
                    array_flip($memberDesignations)
                );
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'profile_photo_url' => $member->profile_photo_url,
                    'designation' => $memberDesignations,
                    'designation_names' => $memberDesignationNames,
                    'is_assigned' => in_array($designation->id, $memberDesignations)
                ];
            })
        ]);
    }

    public function assignMembers(Designation $designation, Request $request)
    {
        // $request->validate([
        //     'member_ids' => 'required|array',
        //     'member_ids.*' => 'exists:members,id'
        // ]);

        $memberIds = $request->member_ids;
        $designationId = $designation->id;
        Member::where('status', 1)->chunk(100, function ($members) use ($designationId, $memberIds) {
            foreach ($members as $member) {
                $currentDesignations = array_map('strval', $member->designation ?? []);

                $designationIdStr = (string)$designationId;
                if (in_array($member->id, $memberIds)) {
                    if (!in_array($designationIdStr, $currentDesignations)) {
                        $currentDesignations[] = $designationIdStr;
                    }
                } else {
                    $currentDesignations = array_filter(
                        $currentDesignations,
                        fn($id) => $id !== $designationIdStr
                    );
                }

                $member->update(['designation' => array_values($currentDesignations)]);
                
                //Send Message
                $phoneNumber = $member->phone;
                $templateName = "designation_update_message";
                $languageCode = "en";
                $bodyParameters = [
                    $member->name ?? '--',
                    $member->designation_names ?? '--',
                ];
                $payload = createMessagePayload($phoneNumber, $templateName, $languageCode, null, $bodyParameters);
                $int = new InteraktServices();
                $resp = $int->sendMessage($payload);

                if($resp['status'] == true){
                    $status = 'success';
                }else{
                    $status = 'failed';
                }
                WhatsappLog::create([
                    'member_id' => $member->id,
                    'phone' => $phoneNumber,
                    'error' => $resp,
                    'error_message' => $resp['result']['message'],
                    'status' => $status
                ]);
            }
        });

        return response()->json(['message' => 'Members updated successfully']);
    }
}
