<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Admin;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $admin = auth('admin')->user();

        $query = Task::query()
            ->with(['member', 'creator'])
            ->latest();

        // team member only sees tasks assigned to them
        if ($admin && $admin->role === 'team_member') {
            $query->where('member_id', $admin->id);
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
                'priority'       => $t->task_type === 'one_time' ? 'medium' : 'high',
                'status'         => $mappedStatus,
                'dueDate'        => $t->end_date ? $t->end_date->format('Y-m-d') : null,
                'area'           => $t->specific_day ?? 'General',
                'targetCount'    => null,
                'completedCount' => $mappedStatus === 'done' ? 1 : 0,
                'createdAt'      => $t->created_at ? $t->created_at->format('d M Y') : 'Recent',
                'notes'          => $t->start_from ?? null,
            ];
        });

        $teamMembers = Admin::whereIn('role', ['team_member', 'admin'])
            ->where('status', 1)
            ->get(['id', 'name', 'role', 'phone', 'email']);

        return Inertia::render('Admin/Tasks', [
            'tasks'       => $tasks,
            'teamMembers' => $teamMembers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignedTo'  => 'required|exists:admins,id',
            'dueDate'     => 'nullable|date',
            'area'        => 'nullable|string|max:255',
            'notes'       => 'nullable|string',
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
            'task_type'    => 'one_time',
            'status'       => 'pending',
        ]);

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
