<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Admin;
use App\Models\JobPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $admin = auth('admin')->user();

        $canViewAll = $admin && ($admin->isSuperAdmin() || in_array('view_all_tasks', $admin->permissionList(), true));
        $scope = $request->query('scope', $canViewAll ? 'all' : 'your');
        if (! $canViewAll) {
            $scope = 'your';
        }

        $query = Task::query()
            ->with(['member', 'creator'])
            ->latest();

        if ($scope === 'your') {
            if ($admin->isAdmin()) {
                $teamMemberIds = Admin::where('created_by', $admin->id)->pluck('id')->toArray();
                $clusterIds = array_merge([$admin->id], $teamMemberIds);
                $query->where(function ($q) use ($clusterIds) {
                    $q->whereIn('member_id', $clusterIds)
                      ->orWhereIn('created_by', $clusterIds);
                });
            } else {
                $query->where(function ($q) use ($admin) {
                    $q->where('member_id', $admin->id)
                      ->orWhere('created_by', $admin->id);
                });
            }
        }

        $tasks = $query->get()->map(function ($t) {
            // Map table status to frontend visual status
            $mappedStatus = match ($t->status) {
                'running'   => 'in_progress',
                'completed' => 'done',
                'overdue'   => 'overdue',
                default     => 'pending',
            };

            return [
                'id'             => $t->id,
                'uuid'           => $t->uuid,
                'title'          => $t->title,
                'description'    => $t->description ?? '',
                'assignedTo'     => $t->member_id,
                'assignedToName' => $t->member->name ?? 'Staff Member',
                'assignedBy'     => $t->creator->name ?? 'Admin',
                'priority'       => in_array($t->task_type, ['high', 'medium', 'low']) ? $t->task_type : 'medium',
                'status'         => $mappedStatus,
                'dueDate'        => $t->end_date ? $t->end_date->format('Y-m-d') : null,
                'area'           => $t->specific_day ?? 'General',
                'targetCount'    => null,
                'completedCount' => $mappedStatus === 'done' ? 1 : 0,
                'createdAt'      => $t->created_at ? $t->created_at->format('d M Y') : 'Recent',
                'notes'          => $t->start_from ?? null,
            ];
        });

        // Team members for task assignment modal
        if ($admin->isSuperAdmin()) {
            $teamMembers = Admin::whereIn('role', ['team_member', 'admin'])
                ->where('status', 1)
                ->withCount('assignedTasks')
                ->orderBy('assigned_tasks_count', 'asc')
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'role', 'phone', 'email']);
        } elseif ($admin->isAdmin()) {
            $teamMembers = Admin::where(function ($q) use ($admin) {
                    $q->where('created_by', $admin->id)->orWhere('id', $admin->id);
                })
                ->where('status', 1)
                ->withCount('assignedTasks')
                ->orderBy('assigned_tasks_count', 'asc')
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'role', 'phone', 'email']);
        } else {
            $teamMembers = collect([]);
        }

        // Fetch unassigned job posts
        $unassignedQuery = JobPost::where(function ($q) {
                $q->whereNull('assigned_to')
                  ->orWhere('assigned_to', 0);
            })
            ->select('id', 'uuid', 'title', 'company', 'location')
            ->orderBy('created_at', 'desc');

        if ($admin->isAdmin()) {
            $teamMemberIds = Admin::where('created_by', $admin->id)->pluck('id')->toArray();
            $clusterIds = array_merge([$admin->id], $teamMemberIds);
            $unassignedQuery->whereIn('created_by', $clusterIds);
        } elseif ($admin->isTeamMember()) {
            $unassignedQuery->where('created_by', $admin->id);
        }

        $unassignedJobs = $unassignedQuery->get();

        // Distinct list of areas / cities from job posts
        $jobLocations = JobPost::whereNotNull('location')
            ->where('location', '!=', '')
            ->pluck('location')
            ->map(fn($loc) => trim($loc))
            ->filter()
            ->unique(fn($loc) => strtolower($loc))
            ->values();

        return Inertia::render('Admin/Tasks', [
            'tasks'          => $tasks,
            'teamMembers'    => $teamMembers,
            'unassignedJobs' => $unassignedJobs,
            'jobLocations'   => $jobLocations,
            'canViewAll'     => $canViewAll,
            'scope'          => $scope,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignedTo'  => 'required|exists:admins,id',
            'priority'    => 'required|in:high,medium,low',
            'dueDate'     => 'nullable|date',
            'area'        => 'nullable|string|max:255',
            'notes'       => 'nullable|string',
            'jobPostId'   => 'nullable|exists:job_posts,id',
        ]);

        Task::create([
            'title'        => $validated['title'],
            'description'  => $validated['description'] ?? null,
            'member_id'    => $validated['assignedTo'],
            'created_by'   => auth('admin')->id(),
            'start_date'   => now()->toDateString(),
            'end_date'     => $validated['dueDate'] ?? null,
            'specific_day' => $validated['area'] ?? null,
            'start_from'   => $validated['notes'] ?? null,
            'task_type'    => $validated['priority'], 
            'status'       => 'pending',
        ]);

        // If task was created for an unassigned job post, mark the job post as assigned to this member
        if (!empty($validated['jobPostId'])) {
            JobPost::where('id', $validated['jobPostId'])->update([
                'assigned_to' => $validated['assignedTo'],
            ]);
        }

        return redirect()->back()->with('success', 'Task successfully assigned to team member.');
    }
    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,done,overdue',
        ]);

        // Convert UI status back to DB status
        $dbStatus = match ($validated['status']) {
            'in_progress' => 'running',
            'done'        => 'completed',
            'overdue'     => 'overdue',
            default       => 'pending',
        };

        $task->status = $dbStatus;
        if ($dbStatus === 'completed') {
            $task->completed_at = now();
        }
        $task->save();

        return redirect()->back()->with('success', 'Task status updated.');
    }
}
