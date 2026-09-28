<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Admin;
use App\Models\JobPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    public function index(Request $request): Response
    {
        $admin = auth('admin')->user();
        $canViewAll = $admin && ($admin->isSuperAdmin() || in_array('view_all_interviews', $admin->permissionList(), true));
        $scope = $request->query('scope', $canViewAll ? 'all' : 'your');
        if (! $canViewAll) {
            $scope = 'your';
        }

        $query = Interview::query()
            ->with('application')
            ->latest('interview_date');

        if ($scope === 'your') {
            if ($admin->isAdmin()) {
                $teamMemberIds = Admin::where('created_by', $admin->id)->pluck('id')->toArray();
                $clusterIds = array_merge([$admin->id], $teamMemberIds);
                $clusterNames = Admin::whereIn('id', $clusterIds)->pluck('name')->toArray();
                $clusterJobIds = JobPost::whereIn('created_by', $clusterIds)
                    ->orWhereIn('assigned_to', $clusterIds)
                    ->pluck('id')
                    ->toArray();
                $clusterAppIds = \App\Models\JobApplication::whereIn('job_id', $clusterJobIds)
                    ->orWhereIn('assigned_calling_team_member_id', $clusterIds)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($clusterIds, $clusterNames, $clusterAppIds) {
                    $q->whereIn('scheduled_by', array_map('strval', $clusterIds))
                      ->orWhereIn('scheduled_by', $clusterNames)
                      ->orWhereIn('interviewer', $clusterNames)
                      ->orWhereIn('application_id', $clusterAppIds);
                });
            } else {
                $myJobIds = JobPost::where('created_by', $admin->id)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('id')
                    ->toArray();
                $myAppIds = \App\Models\JobApplication::whereIn('job_id', $myJobIds)
                    ->orWhere('assigned_calling_team_member_id', $admin->id)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($admin, $myAppIds) {
                    $q->where('scheduled_by', (string) $admin->id)
                      ->orWhere('scheduled_by', $admin->name)
                      ->orWhere('interviewer', $admin->name)
                      ->orWhereIn('application_id', $myAppIds);
                });
            }
        }

        $interviews = $query->get()
            ->map(function ($iv) {
                return [
                    'id'             => $iv->id,
                    'uuid'           => $iv->uuid,
                    'applicationId'  => $iv->application_id,
                    'candidateName'  => $iv->candidate_name,
                    'candidatePhone' => $iv->candidate_phone ?? '—',
                    'jobTitle'       => $iv->job_title ?? 'General Role',
                    'company'        => $iv->company ?? 'ATS Client',
                    'scheduledBy'    => $iv->scheduled_by ?? 'Admin',
                    'interviewer'    => $iv->interviewer ?? $iv->scheduled_by ?? 'Admin',
                    'round'          => $iv->round ?? 'HR Screening',
                    'meetingLink'    => $iv->meeting_link ?? '',
                    'scheduledAt'    => $iv->scheduled_at ? $iv->scheduled_at->format('d M Y') : null,
                    'date'           => $iv->interview_date ? $iv->interview_date->format('Y-m-d') : null,
                    'time'           => $iv->interview_time,
                    'mode'           => $iv->mode ?? 'phone',
                    'status'         => $iv->status ?? 'scheduled',
                    'interested'     => $iv->interested,
                    'remark'         => $iv->remark,
                ];
            });

        // Team members for scheduling interview
        if ($admin->isSuperAdmin()) {
            $teamMembers = Admin::where('status', 1)
                ->select('id', 'uuid', 'name', 'role', 'phone', 'email')
                ->orderBy('name')
                ->get();
            $jobs = JobPost::select('id', 'uuid', 'title', 'company', 'location')
                ->orderBy('title')
                ->get();
        } elseif ($admin->isAdmin()) {
            $teamMembers = Admin::where('created_by', $admin->id)
                ->where('role', 'team_member')
                ->where('status', 1)
                ->select('id', 'uuid', 'name', 'role', 'phone', 'email')
                ->orderBy('name')
                ->get();
            $teamMemberIds = Admin::where('created_by', $admin->id)->pluck('id')->toArray();
            $clusterIds = array_merge([$admin->id], $teamMemberIds);
            $jobs = JobPost::whereIn('created_by', $clusterIds)
                ->orWhereIn('assigned_to', $clusterIds)
                ->select('id', 'uuid', 'title', 'company', 'location')
                ->orderBy('title')
                ->get();
        } else {
            $teamMembers = collect([$admin]);
            $jobs = JobPost::where('created_by', $admin->id)
                ->orWhere('assigned_to', $admin->id)
                ->select('id', 'uuid', 'title', 'company', 'location')
                ->orderBy('title')
                ->get();
        }

        return Inertia::render('Admin/Interviews', [
            'interviews'  => $interviews,
            'teamMembers' => $teamMembers,
            'jobs'        => $jobs,
            'canViewAll'  => $canViewAll,
            'scope'       => $scope,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidateName'  => 'required|string|min:2|max:255',
            'candidatePhone' => ['required', 'regex:/^[6-9]\d{9}$/'],
            'jobTitle'       => 'nullable|string|max:255',
            'company'        => 'nullable|string|max:255',
            'date'           => 'required|date|after_or_equal:today',
            'time'           => 'required|string|max:20',
            'mode'           => 'required|in:phone,video,in_person',
            'interviewer'    => 'required|string|max:255',
            'round'          => 'nullable|string|max:100',
            'meetingLink'    => 'nullable|string|max:500',
            'applicationId'  => 'nullable|string|max:255',
        ], [
            'candidateName.required'  => 'Candidate name is required.',
            'candidateName.min'       => 'Candidate name must be at least 2 characters.',
            'candidatePhone.required' => 'Candidate 10-digit mobile number is required.',
            'candidatePhone.regex'    => 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
            'date.required'           => 'Interview date is required.',
            'date.after_or_equal'     => 'Interview date cannot be in the past.',
            'time.required'           => 'Interview time is required.',
            'mode.required'           => 'Please select interview mode.',
            'interviewer.required'    => 'Please specify who will conduct the interview.',
        ]);

        Interview::create([
            'candidate_name'  => $validated['candidateName'],
            'candidate_phone' => $validated['candidatePhone'],
            'job_title'       => $validated['jobTitle'] ?? null,
            'company'         => $validated['company'] ?? null,
            'interview_date'  => $validated['date'],
            'interview_time'  => $validated['time'],
            'mode'            => $validated['mode'],
            'scheduled_by'    => auth('admin')->user()->name ?? 'Admin',
            'interviewer'     => $validated['interviewer'],
            'round'           => $validated['round'] ?? 'HR Screening',
            'meeting_link'    => $validated['meetingLink'] ?? null,
            'application_id'  => $validated['applicationId'] ?? null,
            'status'          => 'scheduled',
        ]);

        return redirect()->back()->with('success', 'Interview scheduled successfully.');
    }

    public function updateStatus(Request $request, Interview $interview)
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,done,no_show,rescheduled,cancelled',
        ]);

        $interview->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Interview status updated.');
    }

    public function updateRemark(Request $request, Interview $interview)
    {
        $validated = $request->validate([
            'remark'     => 'nullable|string',
            'interested' => 'nullable|boolean',
        ]);

        $data = [];
        if ($request->has('remark')) {
            $data['remark'] = $validated['remark'];
        }
        if ($request->has('interested')) {
            $data['interested'] = $validated['interested'];
        }

        $interview->update($data);

        return redirect()->back()->with('success', 'Interview remark saved.');
    }
    
}
