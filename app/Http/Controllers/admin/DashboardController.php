<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\User;
use App\Models\Company;
use App\Models\Interview;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function superAdminDashboard(Request $request): Response
    {
        $admin = Auth::guard('admin')->user();

        // Platform-wide stats for Super Admin / Admin
        $stats = [
            'pendingJobs'         => JobPost::where('status', 'pending')->count(),
            'activeJobs'          => JobPost::whereIn('status', ['approved', 'active'])->count(),
            'totalUsers'          => User::count(),
            'totalCompanies'      => Company::count(),
            'totalApps'           => JobApplication::count(),
            'shortlisted'         => JobApplication::where('status', 'shortlisted')->count(),
            'scheduledInterviews' => Interview::where('status', 'scheduled')->count(),
            'pendingTasks'        => Task::whereIn('status', ['pending', 'running'])->count(),
            'hired'               => JobApplication::where('status', 'hired')->count(),
        ];

        $pendingJobsList = JobPost::where('status', 'pending')
            ->latest()
            ->take(5)
            ->get(['id', 'uuid', 'title', 'company', 'location']);

        $recentApplications = JobApplication::with(['jobPost'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($app) {
                return [
                    'id'       => $app->id,
                    'userName' => $app->candidate_name ?? 'Applicant',
                    'userCity' => 'India',
                    'jobTitle' => $app->jobPost->title ?? 'Position',
                    'company'  => $app->jobPost->company ?? 'Client',
                    'status'   => $app->status,
                ];
            });

        $tasks = Task::with(['member'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id'             => $t->id,
                    'title'          => $t->title,
                    'priority'       => $t->task_type === 'one_time' ? 'medium' : 'high',
                    'assignedToName' => $t->member->name ?? 'Unassigned',
                    'dueDate'        => $t->end_date ? $t->end_date->format('Y-m-d') : null,
                    'completedCount' => $t->status === 'completed' ? 1 : 0,
                    'targetCount'    => 1,
                    'status'         => match ($t->status) {
                        'running'   => 'in_progress',
                        'completed' => 'done',
                        'overdue'   => 'overdue',
                        default     => 'pending',
                    },
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats'              => $stats,
            'recentApplications' => $recentApplications,
            'pendingJobsList'    => $pendingJobsList,
            'tasks'              => $tasks,
        ]);
    }

    public function teamMemberDashboard(Request $request): Response
    {
        $admin = Auth::guard('admin')->user();

        // Filtered metrics specifically assigned to this team member
        $stats = [
            'pendingJobs'         => 0,
            'activeJobs'          => JobPost::whereIn('status', ['approved', 'active'])->count(),
            'totalUsers'          => 0,
            'totalCompanies'      => 0,
            'totalApps'           => JobApplication::where('assigned_calling_team_member_id', $admin->id)->count(),
            'shortlisted'         => JobApplication::where('assigned_calling_team_member_id', $admin->id)->where('status', 'shortlisted')->count(),
            'scheduledInterviews' => Interview::count(),
            'pendingTasks'        => Task::where('member_id', $admin->id)->whereIn('status', ['pending', 'running'])->count(),
            'hired'               => JobApplication::where('assigned_calling_team_member_id', $admin->id)->where('status', 'hired')->count(),
        ];

        $recentApplications = JobApplication::with(['jobPost'])
            ->where('assigned_calling_team_member_id', $admin->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($app) {
                return [
                    'id'       => $app->id,
                    'userName' => $app->candidate_name ?? 'Applicant',
                    'userCity' => 'India',
                    'jobTitle' => $app->jobPost->title ?? 'Position',
                    'company'  => $app->jobPost->company ?? 'Client',
                    'status'   => $app->status,
                ];
            });

        $tasks = Task::where('member_id', $admin->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id'             => $t->id,
                    'title'          => $t->title,
                    'priority'       => $t->task_type === 'one_time' ? 'medium' : 'high',
                    'assignedToName' => $t->member->name ?? 'Me',
                    'dueDate'        => $t->end_date ? $t->end_date->format('Y-m-d') : null,
                    'completedCount' => $t->status === 'completed' ? 1 : 0,
                    'targetCount'    => 1,
                    'status'         => match ($t->status) {
                        'running'   => 'in_progress',
                        'completed' => 'done',
                        'overdue'   => 'overdue',
                        default     => 'pending',
                    },
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats'              => $stats,
            'recentApplications' => $recentApplications,
            'pendingJobsList'    => [],
            'tasks'              => $tasks,
        ]);
    }
}