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
        $interviews = Interview::query()
            ->with('application')
            ->latest('interview_date')
            ->get()
            ->map(function ($iv) {
                return [
                    'id'             => $iv->id,
                    'uuid'           => $iv->uuid,
                    'applicationId'  => $iv->application_id,
                    'candidateName'  => $iv->candidate_name,
                    'candidatePhone' => $iv->candidate_phone ?? '—',
                    'jobTitle'       => $iv->job_title ?? 'General Role',
                    'company'        => $iv->company ?? 'WorkIndia Client',
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

        $teamMembers = Admin::where('status', 1)
            ->select('id', 'uuid', 'name', 'role', 'phone', 'email')
            ->orderBy('name')
            ->get();

        $jobs = JobPost::select('id', 'uuid', 'title', 'company', 'location')
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/Interviews', [
            'interviews'  => $interviews,
            'teamMembers' => $teamMembers,
            'jobs'        => $jobs,
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
