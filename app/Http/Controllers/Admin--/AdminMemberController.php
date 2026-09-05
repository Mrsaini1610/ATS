<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Department;
use App\Models\Member;
use App\Models\Role;
use App\Models\Task;
use App\Models\TaskInstance;
use App\Models\TaskActivityLog;
use App\Models\TaskAssignment;
use App\Models\Designation;
use App\Models\TaskComment;
use App\Models\WhatsappLog;
use App\Services\InteraktServices;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Carbon\Carbon;

use function App\createMessagePayload;

class AdminMemberController extends Controller
{

    public function dashboard(Request $request)
    {
        $authUser = Auth::guard('admin')->user();
        $requiredDepartments = $authUser->departments ?? [];
        $query = Member::where('id', '!=', $authUser->id)
            ->where('assigned_admin_id', $authUser->id)
            ->where('is_calling_team', false)
            ->whereJsonContains('roles', '3')
            ->whereJsonDoesntContain('roles', '1')
            ->whereJsonDoesntContain('roles', '2');
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($createdBy = $request->input('created_by')) {
            $query->where('created_by', $createdBy);
        }
        $perPage = $request->input('per_page', 10);
        $members = $query->paginate($perPage)->withQueryString();
        $members->getCollection()->transform(function ($member) {
            $member->departments_data = Department::whereIn('id', $member->departments ?? [])->get();
            $member->designations_data = Designation::whereIn('id', $member->designation ?? [])->get();
            return $member;
        });

        $departments = Department::whereIn('id', $requiredDepartments)
            ->where('status', 1)
            ->get(['id', 'name']);

        return Inertia::render('Admin/Member/List', [
            'filters' => $request->only(['search', 'status', 'created_by', 'per_page']),
            'members' => $members,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::guard('admin')->user();
        $allowedDepartmentIds = collect($authUser->departments ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values()
            ->all();

        if (empty($allowedDepartmentIds)) {
            return back()
                ->withErrors(['departments' => 'No department is assigned to your admin account.'])
                ->withInput();
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                Rule::unique('members')->whereNull('deleted_at'),
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('members')->whereNull('deleted_at'),
            ],
            'designations' => ['required', 'array', 'min:1'],
            'designations.*' => ['required', 'integer'],
            'gender' => ['nullable', 'in:male,female,other'],
            'dob' => ['nullable', 'date'],
            'password' => ['required', 'string', 'min:6', 'same:confirm_password'],
            'confirm_password' => ['required', 'string', 'min:6'],
            'status' => ['nullable', 'in:0,1'],
        ]);

        $designationCount = Designation::query()
            ->whereIn('id', $validated['designations'])
            ->whereIn('department_id', $allowedDepartmentIds)
            ->count();

        if ($designationCount !== count($validated['designations'])) {
            return back()
                ->withErrors(['designations' => 'Selected designations must belong to your assigned departments.'])
                ->withInput();
        }

        Member::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'departments' => $allowedDepartmentIds,
            'designation' => $validated['designations'],
            'roles' => ['3'],
            'is_calling_team' => false,
            'status' => (int) ($validated['status'] ?? 1),
            'password' => Hash::make($validated['password']),
            'gender' => $validated['gender'] ?? null,
            'dob' => $validated['dob'] ?? null,
            'created_by' => $authUser->id,
            'assigned_admin_id' => $authUser->id,
            'username' => $this->generateUsername($validated['name']),
            'slug' => Str::slug($validated['name'] . '-' . Str::random(4)),
        ]);

        return redirect()->back()->with('success', 'Member created successfully!');
    }

    public function getByDepartments(Request $request)
    {
        $authUser = Auth::guard('admin')->user();
        $allowedDepartmentIds = collect($authUser->departments ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values()
            ->all();

        $departmentIds = collect($request->input('department_ids', []))
            ->flatten()
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => in_array($id, $allowedDepartmentIds, true))
            ->values()
            ->all();

        if (empty($departmentIds)) {
            $departmentIds = $allowedDepartmentIds;
        }

        if (empty($departmentIds)) {
            return response()->json([]);
        }

        $designations = Designation::query()
            ->whereIn('department_id', $departmentIds)
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'department_id']);

        return response()->json($designations);
    }

    public function updateStatus(Member $member, Request $request)
    {
        $request->validate([
            'status' => 'required|boolean',
        ]);
        abort_unless((int) $member->assigned_admin_id === (int) Auth::guard('admin')->id(), 403);
        try {
            $member->update(['status' => $request->status]);

            $phoneNumber = $member->phone;
            if ($phoneNumber) {
                $templateName = $member->status == 1 ? 'member_account_reactivated_message' : 'member_account_deactivated_message';
                $languageCode = "en";
                $bodyParameters = [
                    $member->name ?? '--'
                ];

                if ($member->status == 0) {
                    $payload = createMessagePayload($phoneNumber, $templateName, $languageCode, null, $bodyParameters);
                } else {
                    $buttonParameters = ["1" => ["/member/login"]];
                    $payload = createMessagePayload($phoneNumber, $templateName, $languageCode, null, $bodyParameters, $buttonParameters);
                }

                $int = new InteraktServices();
                $resp = $int->sendMessage($payload);

                if ($resp['status'] == true) {
                    $status = 'success';
                } else {
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

            return redirect()->back()->with('success', 'Member account status updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update member status!');
        }
    }

    public function memberDetails(Request $request, $uuid)
    {
        $member = Member::where('uuid', $uuid)
            ->where('assigned_admin_id', Auth::guard('admin')->id())
            ->whereJsonContains('roles', '3')
            ->firstOrFail();
        $tasks = $this->getMemberTasks($member, $request);
        $taskStats = $this->getTaskStats($member);
        $taskInstanceStats = $this->getTaskInstanceStats($member);
        $this->formatInstanceDates($tasks);
        return Inertia::render('Admin/Member/MemberDetails', [
            'member' => $member,
            'tasks' => array_merge($tasks->toArray(), $taskStats),
            'task_instances' => $taskInstanceStats,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }
    protected function getMemberTasks(Member $member, Request $request)
    {
        return Task::with([
            'creator',
            'assignedMembers' => function ($query) use ($member) {
                $query->withPivot(['uuid as task_assignment_uuid', 'assigned_by', 'start_date', 'end_date']);
            },
            'instances' => function ($query) use ($member) {
                $query->where('assigned_to', $member->id)
                    ->select(['uuid', 'task_id', 'due_date', 'status', 'completed_at']);
            }
        ])
            ->whereHas('assignedMembers', fn($q) => $q->where('assigned_to', $member->id))
            ->when($request->search, fn($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($request->status !== null, fn($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();
    }
    protected function getTaskStats(Member $member): array
    {
        return [
            'total' => Task::whereHas('assignedMembers', fn($q) => $q->where('assigned_to', $member->id))->count(),
            'closed' => Task::whereHas('assignedMembers', fn($q) => $q->where('assigned_to', $member->id))
                ->where('status', 'closed')->count(),
            'running' => Task::whereHas('assignedMembers', fn($q) => $q->where('assigned_to', $member->id))
                ->where('status', 'running')->count(),
            'pending' => Task::whereHas('assignedMembers', fn($q) => $q->where('assigned_to', $member->id))
                ->where('status', 'pending')->count(),
            'completed' => Task::whereHas('assignedMembers', fn($q) => $q->where('assigned_to', $member->id))
                ->where('status', 'completed')->count(),
        ];
    }
    protected function getTaskInstanceStats(Member $member): array
    {
        $baseQuery = TaskInstance::where('assigned_to', $member->id);
        return [
            'total_instances' => $baseQuery->count(),
            'pending_instances' => $baseQuery->clone()->where('status', 'pending')->count(),
            'in_progress_instances' => $baseQuery->clone()->where('status', 'in_progress')->count(),
            'completed_instances' => $baseQuery->clone()->where('status', 'completed')->count(),
            'overdue_instances' => $baseQuery->clone()
                ->where('due_date', '<', now())
                ->where('status', '!=', 'completed')
                ->count(),
        ];
    }
    protected function formatInstanceDates($tasks)
    {
        $tasks->getCollection()->transform(function ($task) {
            if ($task->instances) {
                $task->instances->transform(function ($instance) {
                    $instance->due_date = $instance->due_date
                        ? Carbon::parse($instance->due_date)->format('Y-m-d H:i')
                        : null;
                    $instance->completed_at = $instance->completed_at
                        ? Carbon::parse($instance->completed_at)->format('Y-m-d H:i')
                        : null;
                    return $instance;
                });
            }
            return $task;
        });
    }

    protected function generateUsername(string $name): string
    {
        $cleanName = Str::lower(preg_replace('/[^a-z0-9]/', '', $name));
        $base = $cleanName ?: 'member';
        $counter = 0;

        do {
            $username = $base . ($counter > 0 ? $counter : '');
            $exists = Member::where('username', $username)
                ->whereNull('deleted_at')
                ->exists();
            $counter++;
        } while ($exists);

        return $username;
    }
}
