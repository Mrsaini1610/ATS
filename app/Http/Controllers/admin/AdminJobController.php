<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\Admin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminJobController extends Controller
{
    public function index()
    {
        $jobs = JobPost::with(['assignedMember:id,name', 'category:id,name'])
            ->latest()
            ->get()
            ->map(function ($job) {
                $salary = ($job->min_lpa && $job->max_lpa)
                    ? "₹{$job->min_lpa} - ₹{$job->max_lpa} LPA"
                    : ($job->min_lpa ? "₹{$job->min_lpa} LPA" : "Not Disclosed");

                return [
                    'id'                        => $job->id,
                    'uuid'                      => $job->uuid,
                    'title'                     => $job->title,
                    'company'                   => $job->company ?? 'N/A',
                    'location'                  => $job->location ?? 'Remote',
                    'salary'                    => $salary,
                    'status'                    => $job->status ?? 'pending',
                    'work_mode'                 => $job->job_type,
                    'type'                      => $job->job_type ?? 'Full Time',
                    'exp'                       => $job->experience ?? '0-1 yr',
                    'openings'                  => $job->openings ?? 1,
                    'applicants'                => $job->applicants ?? 0,
                    'is_hot'                    => $job->badge === 'hot' || $job->badge === 'featured',
                    'posted_at'                 => $job->created_at ? $job->created_at->format('d M Y') : 'Recent',
                    'category'                  => $job->category?->name ?? 'General',
                    'desc'                      => $job->description ?? '',
                    'remark'                    => $job->rejection_reason,
                    'skills'                    => is_array($job->skills) ? $job->skills : [],
                    'responsibilities'          => is_array($job->key_responsibilities) ? $job->key_responsibilities : [],
                    'requirements'              => is_array($job->qualifications) ? $job->qualifications : [],
                    'benefits'                  => is_array($job->perks) ? $job->perks : [],
                    'assigned_team_member_uuid' => $job->assignedMember ? (string) $job->assignedMember->id : null,
                    'assigned_team_member_name' => $job->assignedMember?->name,
                ];
            });

        $teamMembers = Admin::select('id', 'name', 'email', 'role')
            ->get()
            ->map(function ($tm) {
                return [
                    'id'          => $tm->id,
                    'uuid'        => (string) $tm->id,
                    'name'        => $tm->name,
                    'email'       => $tm->email,
                    'active_task' => str_replace('_', ' ', ucwords($tm->role, '_')),
                    'active'      => true,
                ];
            });

        return Inertia::render('Admin/Jobs', [
            'jobs'        => $jobs,
            'teamMembers' => $teamMembers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Jobs/Create');
    }

    public function updateStatus(Request $request, $uuid)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'remark' => 'nullable|string|max:1000',
        ]);

        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'rejected' || $validated['status'] === 'hold') {
            $updateData['rejection_reason'] = $validated['remark'] ?? $job->rejection_reason;
        } elseif ($validated['status'] === 'approved' || $validated['status'] === 'active') {
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = auth('admin')->id();
        }

        $job->update($updateData);

        return redirect()->back()->with('success', "Job status changed to {$validated['status']}.");
    }

    public function assignTeam(Request $request, $uuid)
    {
        $validated = $request->validate([
            'team_member_uuid' => 'nullable',
        ]);

        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        $adminId = null;
        if (!empty($validated['team_member_uuid'])) {
            $admin = Admin::where('id', $validated['team_member_uuid'])->first();
            $adminId = $admin?->id;
        }

        $job->update(['approved_by' => $adminId]);

        return redirect()->back()->with('success', $adminId ? 'Team member assigned successfully.' : 'Assignment removed.');
    }
}