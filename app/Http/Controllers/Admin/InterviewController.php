<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Admin;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\MailService;
use Carbon\Carbon;
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
                $clusterNames = Admin::whereIn('id', $clusterIds)->pluck('name')->filter()->toArray();
                $clusterJobIds = JobPost::whereIn('created_by', $clusterIds)
                    ->orWhereIn('assigned_to', $clusterIds)
                    ->pluck('id')
                    ->toArray();
                $clusterJobUuids = JobPost::whereIn('created_by', $clusterIds)
                    ->orWhereIn('assigned_to', $clusterIds)
                    ->pluck('uuid')
                    ->filter()
                    ->toArray();
                $clusterApps = JobApplication::whereIn('job_id', $clusterJobIds)
                    ->orWhereIn('job_uuid', $clusterJobUuids)
                    ->orWhereIn('assigned_calling_team_member_id', $clusterIds)
                    ->get(['id', 'uuid']);
                $clusterAppIds = $clusterApps->pluck('id')->toArray();
                $clusterAppUuids = $clusterApps->pluck('uuid')->filter()->toArray();

                $query->where(function ($q) use ($clusterIds, $clusterNames, $clusterAppIds, $clusterAppUuids, $clusterJobUuids) {
                    $q->whereIn('scheduled_by', array_map('strval', $clusterIds))
                      ->orWhereIn('scheduled_by', $clusterNames)
                      ->orWhereIn('application_id', $clusterAppIds)
                      ->orWhereIn('application_uuid', $clusterAppUuids)
                      ->orWhereIn('job_uuid', $clusterJobUuids);

                    foreach ($clusterNames as $name) {
                        $q->orWhere('interviewer', 'like', "%{$name}%")
                          ->orWhere('scheduled_by', 'like', "%{$name}%");
                    }
                });
            } else {
                $myJobIds = JobPost::where('created_by', $admin->id)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('id')
                    ->toArray();
                $myJobUuids = JobPost::where('created_by', $admin->id)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('uuid')
                    ->filter()
                    ->toArray();
                $myApps = JobApplication::whereIn('job_id', $myJobIds)
                    ->orWhereIn('job_uuid', $myJobUuids)
                    ->orWhere('assigned_calling_team_member_id', $admin->id)
                    ->get(['id', 'uuid']);
                $myAppIds = $myApps->pluck('id')->toArray();
                $myAppUuids = $myApps->pluck('uuid')->filter()->toArray();

                $query->where(function ($q) use ($admin, $myAppIds, $myAppUuids, $myJobUuids) {
                    $q->where('scheduled_by', (string) $admin->id)
                      ->orWhere('scheduled_by', 'like', "%{$admin->name}%")
                      ->orWhere('interviewer', 'like', "%{$admin->name}%")
                      ->orWhereIn('application_id', $myAppIds)
                      ->orWhereIn('application_uuid', $myAppUuids)
                      ->orWhereIn('job_uuid', $myJobUuids);
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

        // Team members & enriched jobs with address for scheduling interview
        $jobsQuery = JobPost::query()->with('companyRelation:uuid,name,address,location');

        if ($admin->isSuperAdmin()) {
            $teamMembers = Admin::where('status', 1)
                ->select('id', 'uuid', 'name', 'role', 'phone', 'email')
                ->orderBy('name')
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
            $jobsQuery->where(function ($q) use ($clusterIds) {
                $q->whereIn('created_by', $clusterIds)
                  ->orWhereIn('assigned_to', $clusterIds);
            });
        } else {
            $teamMembers = collect([$admin]);
            $jobsQuery->where(function ($q) use ($admin) {
                $q->where('created_by', $admin->id)
                  ->orWhere('assigned_to', $admin->id);
            });
        }

        $jobs = $jobsQuery->orderBy('title')->get()->map(function ($j) {
            return [
                'id'              => $j->id,
                'uuid'            => $j->uuid,
                'title'           => $j->title,
                'company'         => $j->company,
                'location'        => $j->location,
                'company_address' => $j->companyRelation?->address ?: $j->location ?: '',
            ];
        });

        // Registered candidates with applied jobs
        $candidates = \App\Models\User::query()
            ->select('id', 'uuid', 'full_name', 'phone', 'email', 'city', 'job_title')
            ->latest()
            ->take(300)
            ->get()
            ->map(function ($u) {
                $appJobIds = \App\Models\JobApplication::where(function ($q) use ($u) {
                    $q->where('candidate_uuid', $u->uuid)->orWhere('candidate_id', $u->id);
                })
                ->pluck('job_id')
                ->toArray();

                return [
                    'id'              => $u->id,
                    'uuid'            => $u->uuid,
                    'name'            => $u->full_name,
                    'phone'           => $u->phone,
                    'email'           => $u->email,
                    'city'            => $u->city,
                    'job_title'       => $u->job_title,
                    'applied_job_ids' => $appJobIds,
                ];
            });

        return Inertia::render('Admin/Interviews', [
            'interviews'  => $interviews,
            'teamMembers' => $teamMembers,
            'jobs'        => $jobs,
            'candidates'  => $candidates,
            'canViewAll'  => $canViewAll,
            'scope'       => $scope,
        ]);
    }

    public function searchCandidates(Request $request)
    {
        $q = trim($request->get('q', ''));
        $jobId = $request->get('job_id');

        $query = \App\Models\User::query()
            ->select('id', 'uuid', 'full_name', 'phone', 'email', 'city', 'job_title');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('full_name', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $candidates = $query->latest()->take(50)->get()->map(function ($u) use ($jobId) {
            $hasApplied = false;
            $applicationId = null;
            if ($jobId) {
                $app = \App\Models\JobApplication::where(function ($q) use ($u) {
                        $q->where('candidate_uuid', $u->uuid)->orWhere('candidate_id', $u->id);
                    })
                    ->where(function ($q) use ($jobId) {
                        $q->where('job_uuid', $jobId)->orWhere('job_id', $jobId);
                    })
                    ->first();
                if ($app) {
                    $hasApplied = true;
                    $applicationId = $app->uuid ?: $app->id;
                }
            }
            return [
                'id'             => $u->id,
                'uuid'           => $u->uuid,
                'name'           => $u->full_name,
                'phone'          => $u->phone,
                'email'          => $u->email,
                'city'           => $u->city,
                'has_applied'    => $hasApplied,
                'application_id' => $applicationId,
            ];
        });

        return response()->json(['candidates' => $candidates]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidateName'  => 'required|string|min:2|max:255',
            'candidatePhone' => ['required', 'regex:/^[6-9]\d{9}$/'],
            'candidateEmail' => 'nullable|email|max:255',
            'jobTitle'       => 'nullable|string|max:255',
            'company'        => 'nullable|string|max:255',
            'companyAddress' => 'nullable|string|max:1000',
            'date'           => 'required|date|after_or_equal:today',
            'time'           => 'required|string|max:20',
            'mode'           => 'required|in:phone,video,in_person',
            'interviewer'    => 'required|string|max:255',
            'round'          => 'nullable|string|max:100',
            'meetingLink'    => 'nullable|string|max:1000',
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

        $venueOrMeeting = $validated['meetingLink'] ?? null;
        if ($validated['mode'] === 'in_person' && empty($venueOrMeeting)) {
            $venueOrMeeting = $validated['companyAddress'] ?? 'Company Premises';
        }

        $app = null;
        if (!empty($validated['applicationId'])) {
            $app = JobApplication::where('uuid', $validated['applicationId'])
                ->orWhere('id', $validated['applicationId'])
                ->first();
        }

        $candidateUser = User::where('phone', $validated['candidatePhone'])
            ->orWhere('email', $validated['candidateEmail'] ?? null)
            ->first();

        if (!$app && $candidateUser) {
            $app = JobApplication::where(function ($q) use ($candidateUser) {
                    $q->where('candidate_uuid', $candidateUser->uuid)
                      ->orWhere('candidate_id', $candidateUser->id);
                })
                ->when(!empty($validated['jobTitle']), function ($q) use ($validated) {
                    $q->whereHas('jobPost', function ($jq) use ($validated) {
                        $jq->where('title', 'like', '%' . $validated['jobTitle'] . '%');
                    });
                })
                ->latest()
                ->first();
        }

        $interview = Interview::create([
            'candidate_uuid'   => $candidateUser?->uuid ?? $app?->candidate_uuid,
            'job_uuid'         => $app?->job_uuid,
            'application_uuid' => $app?->uuid,
            'application_id'   => $app?->id ?? (is_numeric($validated['applicationId'] ?? null) ? $validated['applicationId'] : null),
            'candidate_name'   => $validated['candidateName'],
            'candidate_phone'  => $validated['candidatePhone'],
            'job_title'        => $validated['jobTitle'] ?? ($app?->jobPost?->title),
            'company'          => $validated['company'] ?? ($app?->jobPost?->company),
            'interview_date'   => $validated['date'],
            'interview_time'   => $validated['time'],
            'mode'             => $validated['mode'],
            'scheduled_by'     => auth('admin')->user()->name ?? 'Admin',
            'interviewer'      => $validated['interviewer'],
            'round'            => $validated['round'] ?? 'HR Screening',
            'meeting_link'     => $venueOrMeeting,
            'status'           => 'scheduled',
        ]);

        // If an associated application exists, sync its status and interview details immediately
        if ($app) {
            $app->status = 'interview_scheduled';
            try {
                $app->interview_date_time = Carbon::parse($validated['date'] . ' ' . $validated['time']);
            } catch (\Throwable $e) {
                $app->interview_date_time = now();
            }
            $app->interview_mode = $validated['mode'];
            $app->interview_address = $venueOrMeeting;
            $app->interview_contact_person = $validated['interviewer'];
            $app->interview_confirmed_at = now();
            $app->reviewed_at = now();
            $app->save();
        }

        // 1. Dispatch MailService (Candidate + Interviewer + Admin)
        try {
            MailService::sendInterviewScheduled($interview, array_merge($validated, [
                'candidateEmail'   => $validated['candidateEmail'] ?? null,
                'interviewAddress' => $venueOrMeeting,
            ]));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending interview scheduled email/notifications: ' . $e->getMessage());
        }

        // 2. Build WhatsApp invite message and log
        $cleanPhone = preg_replace('/\D/', '', $validated['candidatePhone']);
        $venueText = $validated['mode'] === 'in_person'
            ? ("🏢 Venue / Address: " . ($venueOrMeeting ?: 'Company Office'))
            : ($validated['mode'] === 'video' ? ("🎥 Meeting Link: " . ($venueOrMeeting ?: 'Will be shared shortly')) : "📞 Mode: Phone Call");

        $waMsg = "Hello " . $validated['candidateName'] . ",\n\n"
            . "Your interview for *" . ($validated['jobTitle'] ?: 'the job role') . "* at *" . ($validated['company'] ?: 'ATS Client') . "* is confirmed!\n\n"
            . "📅 Date: " . $validated['date'] . "\n"
            . "⏰ Time: " . $validated['time'] . "\n"
            . "📌 Round: " . ($validated['round'] ?: 'HR Screening') . "\n"
            . $venueText . "\n"
            . "👤 Interviewer: " . $validated['interviewer'] . "\n\n"
            . "Please be prepared 10 minutes prior.\nBest regards,\nATS Hiring Team";

        $waUrl = "https://wa.me/91" . $cleanPhone . "?text=" . urlencode($waMsg);

        try {
            \App\Models\WhatsappLog::create([
                'phone'   => $cleanPhone,
                'message' => $waMsg,
                'status'  => 'sent',
            ]);
        } catch (\Throwable $e) {}

        return redirect()->back()->with([
            'success'      => 'Interview scheduled! Email sent to candidate & interviewer, WhatsApp invite generated.',
            'whatsapp_url' => $waUrl,
        ]);
    }

    public function updateStatus(Request $request, Interview $interview)
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,done,no_show,rescheduled,cancelled',
        ]);

        $interview->update(['status' => $validated['status']]);

        // Dispatch interview status update to Super Admin and candidate
        try {
            MailService::sendInterviewStatusUpdated($interview, $validated['status']);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending interview status update email/notifications: ' . $e->getMessage());
        }

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
