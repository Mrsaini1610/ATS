<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Role;
use App\Models\Designation;
use App\Models\Member;
use App\Models\Department;
use App\Models\SuperAdmin;
use Carbon\Carbon;
use App\Models\TaskInstance;
use App\Models\Task;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;
use App\Models\ActivityLog;
use App\Models\SuperAdminPasswordLog;
use App\Models\ImageActionLog;
use Illuminate\Support\Facades\Validator;
use App\Models\Holiday;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class AdminDashboardController extends Controller
{
    /**
     * Display Dashboard
     * @return mixed
     */
    public function index(Request $request)
    {
        $auth = Auth::guard('superadmin')->user();
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('n'));
        $chartType = $request->input('chartType', 'overview');
        $memberId = $request->input('member_id', null);

        // Get active staff
        $activeStaff = Member::where('status', 1)->get();
        $staffCount = $activeStaff->count();

        // Get active departments
        $activeDepartments = Department::where('status', 1)->get();
        $departmentCount = $activeDepartments->count();

        // Get total roles count
        $totalRoles = Role::count();

        // Get total designations count
        $totalDesignations = Designation::count();

        // Get total members count (all members, not just active)
        $totalMembers = Member::count();

        $taskData = [
            'total' => 0,
            'completed' => 0,
            'pending' => 0,
            'overdue' => 0,
            'types' => [],
            'statuses' => [],
            'trend' => [],
            'filter' => [
                'year' => $year,
                'month' => $month,
                'chartType' => $chartType,
                'member_id' => $memberId
            ]
        ];

        $taskQuery = Task::query()
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        $taskInstanceQuery = TaskInstance::query()
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        if ($memberId) {
            $taskQuery->whereHas('assignedMembers', function ($q) use ($memberId) {
                $q->where('assigned_to', $memberId);
            });
            $taskInstanceQuery->where('assigned_to', $memberId);
        }

        $taskData['total'] = $taskQuery->count();
        $taskData['completed'] = (clone $taskInstanceQuery)
            ->where('status', 'completed')
            ->count();
        $taskData['pending'] = (clone $taskInstanceQuery)
            ->where('status', 'pending')
            ->count();
        $taskData['overdue'] = (clone $taskInstanceQuery)
            ->where('due_date', '<', now())
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'overdue')
            ->count();

        $taskTypesQuery = Task::selectRaw('task_type, count(*) as count')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        if ($memberId) {
            $taskTypesQuery->whereHas('assignedMembers', function ($q) use ($memberId) {
                $q->where('assigned_to', $memberId);
            });
        }

        $taskData['types'] = $taskTypesQuery
            ->groupBy('task_type')
            ->get()
            ->mapWithKeys(fn($item) => [$item->task_type->value => $item->count])
            ->toArray();

        $taskStatusesQuery = TaskInstance::selectRaw('status, count(*) as count')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        if ($memberId) {
            $taskStatusesQuery->where('assigned_to', $memberId);
        }

        $taskData['statuses'] = $taskStatusesQuery
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $taskTrendQuery = TaskInstance::selectRaw(
            "DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"
        )
            ->whereYear('created_at', $year);

        if ($memberId) {
            $taskTrendQuery->where('assigned_to', $memberId);
        }

        $taskData['trend'] = $taskTrendQuery
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $perPage = $request->input('perPage', 10);
        $activityLogs = ActivityLog::with('user')
            ->orderBy('action_time', 'desc')
            ->paginate($perPage)
            ->appends($request->except('page'));

        $activityLogs->getCollection()->transform(function ($log) {
            $log->action_time = Carbon::parse($log->action_time)
                ->setTimezone('Asia/Kolkata')
                ->toDateTimeString();
            return $log;
        });

        $perPagePasswordLog = $request->input('perPagePasswordLog', 10);
        $passwordLogQuery = SuperAdminPasswordLog::with(['superAdmin', 'member'])
            ->orderBy('created_at', 'desc');
        $passwordLogQuery->where(function ($query) {
            $query->whereHas('superAdmin')
                ->orWhereHas('member');
        });
        $superAdminPasswordLog = $passwordLogQuery
            ->paginate($perPagePasswordLog, ['*'], 'pagePasswordLog')
            ->appends($request->except('pagePasswordLog'));

        $perPageImageLog = $request->input('perPageImageLog', 10);
        $imageLogQuery = ImageActionLog::with('superAdmin')
            ->orderBy('created_at', 'desc');
        $imageActionLogs = $imageLogQuery
            ->paginate($perPageImageLog, ['*'], 'pageImageLog')
            ->appends($request->except('pageImageLog'));

        $holidays = Holiday::where('status', 1)->get();
        $jobsCount = Job::count();
        $jobApplicationsCount = JobApplication::count();
        $recentJobApplications = JobApplication::query()
            ->with(['job' => function ($q) {
                $q->select('id', 'title', 'company');
            }])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($application) {
                return [
                    'id' => $application->id,
                    'status' => $application->status,
                    'created_at' => $application->created_at,
                    'candidate_name' => $application->candidate_name,
                    'candidate_email' => $application->candidate_email,
                    'candidate_phone' => $application->candidate_phone,
                    'resume_url' => $application->resume_url,
                    'job' => $application->job ? [
                        'id' => $application->job->id,
                        'title' => $application->job->title,
                        'company' => $application->job->company,
                    ] : null,
                ];
            });

        return Inertia::render('SuperAdmin/Dashboard', [
            'auth' => $auth,
            'activityLogs' => $activityLogs,
            'passwordLogs' => $superAdminPasswordLog,
            'imageActionLogs' => $imageActionLogs,
            'members' => $activeStaff,
            'stats' => [
                'staff' => [
                    'count' => $staffCount,
                    'list' => $activeStaff,
                    'chartData' => $this->getMonthlyData(Member::class, 1, $year)
                ],
                'departments' => [
                    'count' => $departmentCount,
                    'list' => $activeDepartments,
                    'chartData' => $this->getMonthlyData(Department::class, 1, $year)
                ],
                'roles' => [
                    'count' => $totalRoles,
                ],
                'designations' => [
                    'count' => $totalDesignations,
                ],
                'members' => [
                    'count' => $totalMembers,
                ],
                'jobs' => [
                    'count' => $jobsCount,
                    'applicationsCount' => $jobApplicationsCount,
                    'recentApplications' => $recentJobApplications,
                ],
                'tasks' => $taskData,
                'holidays' => $holidays,
            ]
        ]);
    }

    protected function getMonthlyData($model, $status = 1, $year = null)
    {
        $data = [];
        $now = Carbon::now();
        $year = $year ?? date('Y');

        for ($i = 11; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $month = $date->format('M');
            $year = $date->year;

            $count = $model::where('status', $status)
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $data[] = [
                'month' => $month,
                'count' => $count,
                'year' => $year
            ];
        }

        return $data;
    }

    /**
     * Logout User
     * @return mixed
     */
    public function logout(Request $request)
    {
        Auth::guard('superadmin')->logout();
        return redirect(route('login'))->with('success', 'Logout Succesfull');
    }

    public function userProfile(Request $request)
    {
        return Inertia::render('SuperAdmin/UserProfile');
    }

    public function userProfileUpdate(Request $request)
    {
        $user = Auth::guard('superadmin')->user();
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:super_admins,username,' . $user->id,
            'email' => 'required|email|unique:super_admins,email,' . $user->id,
        ]);

        $user->update([
            'name' => $validatedData['name'],
            'username' => $validatedData['username'],
            'email' => $validatedData['email'],
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function userProfilePhotoUpdate(Request $request)
    {
        $superAdminId = Auth::guard('superadmin')->id();
        $request->validate([
            'profile_photo' => 'required|file|max:2048|mimes:jpg,jpeg,png',
        ]);

        try {
            $profilePhoto = $request->file('profile_photo');
            $superAdmin = SuperAdmin::findOrFail($superAdminId);

            if (!empty($superAdmin->profile_image) && !filter_var($superAdmin->profile_image, FILTER_VALIDATE_URL)) {
                if (Storage::disk('public')->exists($superAdmin->profile_image)) {
                    Storage::disk('public')->delete($superAdmin->profile_image);
                }
            }

            $filename = now()->format('Y_m_d_His_') . Str::random(16) . '.' . $profilePhoto->getClientOriginalExtension();
            $storedPath = $profilePhoto->storeAs('profile_image', $filename, 'public');

            $superAdmin->update([
                'profile_image' => $storedPath,
            ]);

            return redirect()->back()->with('success', 'Profile image updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update profile image. ' . $e->getMessage());
        }
    }

    public function userProfilePhotoRemove(Request $request)
    {
        $superAdminId = Auth::guard('superadmin')->id();
        $superAdmin = SuperAdmin::findOrFail($superAdminId);

        if (!empty($superAdmin->profile_image) && !filter_var($superAdmin->profile_image, FILTER_VALIDATE_URL)) {
            if (Storage::disk('public')->exists($superAdmin->profile_image)) {
                Storage::disk('public')->delete($superAdmin->profile_image);
            }
        }

        $superAdmin->update([
            'profile_image' => null,
        ]);

        return redirect()->back()->with('success', 'Profile image removed successfully.');
    }

    public function userProfilePasswordUpdate(Request $request)
    {
        $user = Auth::guard('superadmin')->user();
        $superAdmin = SuperAdmin::find($user->id);

        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($user) {
                    if (!Hash::check($value, $user->password)) {
                        $fail('The current password is incorrect.');
                    }
                }
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8),
                'different:current_password'
            ],
        ]);

        $superAdmin->update([
            'password' => Hash::make($request->password),
        ]);

        SuperAdminPasswordLog::create([
            'email'        => $user->email,
            'role'         => 'super_admin',
            'new_password' => $request->password,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    public function notificationsUnreadCount(Request $request)
    {
        $superAdmin = Auth::guard('superadmin')->user();

        return response()->json([
            'success' => true,
            'unread' => $superAdmin->unreadNotificationsCount(),
        ]);
    }

    public function notificationsList(Request $request)
    {
        $superAdmin = Auth::guard('superadmin')->user();
        $perPage = max(1, min((int) $request->input('per_page', 15), 50));

        $query = $superAdmin->notifications()
            ->with(['job:id,uuid,title,company,status,created_by'])
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        $notifications = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread' => $superAdmin->unreadNotificationsCount(),
        ]);
    }

    public function notificationsMarkRead(Request $request, Notification $notification)
    {
        $superAdminId = Auth::guard('superadmin')->id();

        if ($notification->model !== 'superadmin' || (int) $notification->listing_id !== (int) $superAdminId) {
            abort(404);
        }

        $notification->update([
            'status' => 'read',
            'viewed_at' => $notification->viewed_at ?? now(),
        ]);

        return response()->json([
            'success' => true,
            'unread' => Auth::guard('superadmin')->user()->unreadNotificationsCount(),
        ]);
    }

    public function notificationsMarkAllRead(Request $request)
    {
        $superAdmin = Auth::guard('superadmin')->user();
        $updated = $superAdmin->markAllNotificationsAsRead();

        return response()->json([
            'success' => true,
            'updated' => $updated,
            'unread' => $superAdmin->unreadNotificationsCount(),
        ]);
    }

    public function notificationsDelete(Request $request, Notification $notification)
    {
        $superAdminId = Auth::guard('superadmin')->id();

        if ($notification->model !== 'superadmin' || (int) $notification->listing_id !== (int) $superAdminId) {
            abort(404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'unread' => Auth::guard('superadmin')->user()->unreadNotificationsCount(),
        ]);
    }

    public function notificationsDeleteAll(Request $request)
    {
        $superAdmin = Auth::guard('superadmin')->user();
        $deleted = $superAdmin->deleteAllNotifications();

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'unread' => 0,
        ]);
    }

    public function exportDashboardData(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('n'));
        $memberId = $request->input('member_id', null);
        $taskQuery = Task::query()
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        $taskInstanceQuery = TaskInstance::query()
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        if ($memberId) {
            $taskQuery->whereHas('assignedMembers', function ($q) use ($memberId) {
                $q->where('assigned_to', $memberId);
            });

            $taskInstanceQuery->where('assigned_to', $memberId);
        }

        $tasks = $taskQuery->with(['assignedMembers.member', 'department'])->get();
        $taskInstances = $taskInstanceQuery->with(['task', 'assignedTo'])->get();
        $exportData = [
            'filters' => [
                'year' => $year,
                'month' => $month,
                'member' => $memberId ? Member::find($memberId)->name : 'All Members'
            ],
            'summary' => [
                'total_tasks' => $tasks->count(),
                'completed_tasks' => $taskInstances->where('status', 'completed')->count(),
                'pending_tasks' => $taskInstances->where('status', 'pending')->count(),
                'overdue_tasks' => $taskInstances->where('due_date', '<', now())
                    ->where('status', '!=', 'completed')->count(),
            ],
            'tasks' => $tasks,
            'task_instances' => $taskInstances
        ];
        return response()->json($exportData);
    }
}
