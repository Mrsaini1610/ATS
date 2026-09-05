<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    public function index(Request $request): Response
    {
        $interviews = Interview::query()
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
                    'scheduledAt'    => $iv->scheduled_at ? $iv->scheduled_at->format('d M Y') : null,
                    'date'           => $iv->interview_date ? $iv->interview_date->format('Y-m-d') : null,
                    'time'           => $iv->interview_time,
                    'mode'           => $iv->mode ?? 'phone',
                    'status'         => $iv->status ?? 'scheduled',
                    'interested'     => $iv->interested,
                    'remark'         => $iv->remark,
                ];
            });

        return Inertia::render('Admin/Interviews', [
            'interviews' => $interviews,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidateName'  => 'required|string|max:255',
            'candidatePhone' => 'nullable|string|max:50',
            'jobTitle'       => 'nullable|string|max:255',
            'company'        => 'nullable|string|max:255',
            'date'           => 'required|date',
            'time'           => 'required|string|max:20',
            'mode'           => 'required|in:phone,video,in_person',
            'applicationId'  => 'nullable|string|max:255',
        ]);

        Interview::create([
            'candidate_name'  => $validated['candidateName'],
            'candidate_phone' => $validated['candidatePhone'] ?? null,
            'job_title'       => $validated['jobTitle'] ?? null,
            'company'        => $validated['company'] ?? null,
            'interview_date'  => $validated['date'],
            'interview_time'  => $validated['time'],
            'mode'            => $validated['mode'],
            'application_id'  => $validated['applicationId'] ?? null,
            'scheduled_by'    => auth('admin')->user()->name ?? 'Admin',
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
