<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Admin;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $admin = auth('admin')->user();
        $canViewAll = $admin && ($admin->isSuperAdmin() || in_array('view_all_applications', $admin->permissionList(), true));
        $scope = $request->query('scope', $canViewAll ? 'all' : 'your');
        if (! $canViewAll) {
            $scope = 'your';
        }

        $query = JobApplication::query()
            ->with(['jobPost.companyRelation', 'assignedCallingMember', 'candidate.defaultResume'])
            ->latest();

        if ($request->filled('job_id')) {
            $query->where('job_id', $request->input('job_id'));
        }
        if ($request->filled('job_uuid')) {
            $query->whereHas('jobPost', fn($q) => $q->where('uuid', $request->input('job_uuid')));
        }

        if ($scope === 'your') {
            if ($admin->isAdmin()) {
                $teamMemberIds = Admin::where('created_by', $admin->id)->pluck('id')->toArray();
                $clusterIds = array_merge([$admin->id], $teamMemberIds);
                $clusterJobIds = \App\Models\JobPost::whereIn('created_by', $clusterIds)
                    ->orWhereIn('assigned_to', $clusterIds)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($clusterJobIds, $clusterIds, $admin) {
                    $q->whereIn('job_id', $clusterJobIds)
                      ->orWhereIn('assigned_calling_team_member_id', $clusterIds)
                      ->orWhere('assigned_calling_team_member_id', $admin->id);
                });
            } else {
                $myJobIds = \App\Models\JobPost::where('created_by', $admin->id)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($myJobIds, $admin) {
                    $q->whereIn('job_id', $myJobIds)
                      ->orWhere('assigned_calling_team_member_id', $admin->id);
                });
            }
        }

        $applications = $query->get()->map(function ($app) {
            $answers = is_array($app->answers) ? $app->answers : (json_decode($app->answers ?? '[]', true) ?: []);

            // Skills
            $skills = $app->candidate_skills;
            if (empty($skills) && !empty($answers['skills'])) {
                $skills = $answers['skills'];
            }
            if (is_string($skills)) {
                $decoded = json_decode($skills, true);
                $skills = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode(',', $skills)));
            }
            if (empty($skills) && !empty($app->candidate?->skills)) {
                $skills = $app->candidate->skills;
            }
            if (!is_array($skills)) {
                $skills = [];
            }

            // Experience
            $experience = $app->candidate_experience ?: ($answers['experience'] ?? ($app->candidate?->total_experience_years ?? null));

            // Salaries
            $currentSalary = $app->current_salary ?: ($answers['currentSalary'] ?? ($app->candidate?->current_ctc ?? null));
            $expectedSalary = $app->expected_salary ?: ($answers['expectedSalary'] ?? ($app->candidate?->expected_ctc ?? null));

            // Designation & Company
            $currentTitle = $answers['currentTitle'] ?? ($app->candidate?->job_title ?? null);
            $lastCompany = $app->last_company ?: ($answers['lastCompany'] ?? null);

            // Notice & Last Working Day
            $noticePeriod = $app->notice_period ?: ($answers['notice'] ?? ($app->candidate?->notice_period_days ? $app->candidate->notice_period_days . ' Days' : null));
            $lastWorkingDayRaw = $app->last_working_day ?: ($answers['lastWorkingDay'] ?? null);
            $lastWorkingDay = null;
            if ($lastWorkingDayRaw) {
                try {
                    $lastWorkingDay = \Carbon\Carbon::parse($lastWorkingDayRaw)->format('d M Y');
                } catch (\Throwable $e) {
                    $lastWorkingDay = $lastWorkingDayRaw;
                }
            }

            // Education
            $qualification = $answers['qualification'] ?? ($app->candidate?->education ?? null);
            $educationDegree = $answers['educationDegree'] ?? null;
            $educationInstitute = $answers['educationInstitute'] ?? null;

            // Cover letter / Statement
            $coverLetter = $app->cover_letter ?: ($answers['whyApply'] ?? null);

            // Portfolio & LinkedIn
            $portfolio = $answers['portfolio'] ?? ($app->candidate?->portfolio ?? null);
            $linkedin = $answers['linkedin'] ?? ($app->candidate?->linkedin ?? null);

            // Location
            $userCity = $app->city ?: ($answers['city'] ?? ($app->candidate?->city ?? 'India'));
            $userArea = $app->candidate?->area ?? null;
            $userState = $app->candidate?->state ?? null;

            // Resume URL
            $resumeUrl = $app->resume_url;
            if (!empty($resumeUrl)) {
                if (!str_starts_with($resumeUrl, 'http://') && !str_starts_with($resumeUrl, 'https://')) {
                    $cleanPath = ltrim($resumeUrl, '/');
                    if (str_starts_with($cleanPath, 'storage/')) {
                        $resumeUrl = asset($cleanPath);
                    } else {
                        $resumeUrl = asset('storage/' . $cleanPath);
                    }
                }
            } else {
                $resumeUrl = $app->candidate?->defaultResume?->file_url ?? ($app->candidate?->resumes?->first()?->file_url ?? null);
            }

            // Job post salary string
            $jobPost = $app->jobPost;
            $jobSalaryMin = $jobPost?->min_salary;
            $jobSalaryMax = $jobPost?->max_salary;
            $jobSalaryType = $jobPost?->salary_type ?? 'monthly';
            $jobSalaryText = null;
            if ($jobSalaryMin || $jobSalaryMax) {
                if ($jobSalaryMin && $jobSalaryMax) {
                    $jobSalaryText = '₹' . number_format($jobSalaryMin) . ' - ₹' . number_format($jobSalaryMax);
                } elseif ($jobSalaryMin) {
                    $jobSalaryText = 'From ₹' . number_format($jobSalaryMin);
                } else {
                    $jobSalaryText = 'Up to ₹' . number_format($jobSalaryMax);
                }
            }

            return [
                'id'                 => $app->id,
                'uuid'               => $app->uuid,
                'jobId'              => $app->job_id,
                'userName'           => $app->candidate_name ?? ($app->candidate->full_name ?? 'Applicant'),
                'userPhone'          => $app->candidate_phone ?? ($app->candidate->phone ?? '—'),
                'userEmail'          => $app->candidate_email ?? ($app->candidate->email ?? null),
                'userCity'           => $userCity,
                'userArea'           => $userArea,
                'userState'          => $userState,
                'userGender'         => $app->candidate?->gender ?? null,
                'userDob'            => $app->candidate?->dob ? $app->candidate->dob->format('d M Y') : null,
                'jobTitle'           => $jobPost->title ?? 'General Position',
                'company'            => $jobPost->company ?? ($jobPost->companyRelation->name ?? 'ATS Client'),
                'jobLocation'        => $jobPost->location ?? null,
                'jobType'            => $jobPost->job_type ?? null,
                'jobSalary'          => $jobSalaryText,
                'jobSalaryType'      => $jobSalaryType,
                'status'             => $app->status ?? 'applied',
                'appliedAt'          => $app->created_at ? $app->created_at->format('d M Y') : 'Recent',
                'assignedTo'         => $app->assigned_calling_team_member_id,
                'assignedToName'     => $app->assignedCallingMember->name ?? null,
                'remark'             => $app->admin_notes ?? $app->call_notes ?? null,
                'interviewDate'      => $app->interview_date_time ? $app->interview_date_time->format('d M Y, h:i A') : null,
                'interviewMode'      => $app->interview_mode,
                'interviewAddress'   => $app->interview_address,
                'interviewContact'   => $app->interview_contact_person,
                'resumeUrl'          => $resumeUrl,
                'currentTitle'       => $currentTitle,
                'experience'         => $experience,
                'currentSalary'      => $currentSalary,
                'expectedSalary'     => $expectedSalary,
                'lastCompany'        => $lastCompany,
                'noticePeriod'       => $noticePeriod,
                'lastWorkingDay'     => $lastWorkingDay,
                'skills'             => $skills,
                'qualification'      => $qualification,
                'educationDegree'    => $educationDegree,
                'educationInstitute' => $educationInstitute,
                'coverLetter'        => $coverLetter,
                'portfolio'          => $portfolio,
                'linkedin'           => $linkedin,
                'offerSalaryPackage' => $app->offer_salary_package,
                'offerJoiningDate'   => $app->offer_joining_date ? $app->offer_joining_date->format('d M Y') : null,
            ];
        });

        if ($admin->isSuperAdmin()) {
            $teamMembers = Admin::whereIn('role', ['team_member', 'admin'])
                ->where('status', 1)
                ->get(['id', 'name', 'role', 'phone', 'email']);
        } elseif ($admin->isAdmin()) {
            $teamMembers = Admin::whereIn('role', ['team_member', 'admin'])
                ->where('status', 1)
                ->get(['id', 'name', 'role', 'phone', 'email']);
        } else {
            $teamMembers = collect([]);
        }

        return Inertia::render('Admin/Applications', [
            'applications' => $applications,
            'teamMembers'  => $teamMembers,
            'canViewAll'   => $canViewAll,
            'scope'        => $scope,
            'filters'      => $request->only(['job_id', 'job_uuid', 'scope']),
        ]);
    }

    public function updateStatus(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|string|max:100',
        ]);

        $adminId = auth('admin')->id();

        // Check if admin ID exists in `members` table to satisfy the foreign key constraint
        $isValidMember = $adminId && DB::table('members')->where('id', $adminId)->exists();

        $application->status = $validated['status'];
        $application->reviewed_at = now();
        $application->reviewed_by = $isValidMember ? $adminId : null;
        $application->save();

        // Dispatch Email, In-App Notification & Push Notification to Candidate + Super Admin Alert
        try {
            MailService::sendApplicationStatusChanged($application, $validated['status'], $application->admin_notes);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending application status email/notifications: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', "Application status updated to {$validated['status']}.");
    }

    public function assign(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'team_member_id' => 'required|exists:admins,id',
        ]);

        $application->assigned_calling_team_member_id = $validated['team_member_id'];
        $application->assigned_to_calling_team_at = now();
        $application->save();

        // Notify assigned team member and Super Admin
        try {
            $assignee = Admin::find($validated['team_member_id']);
            $jobTitle = $application->jobPost?->title ?: 'the job position';
            MailService::notifyAdmin(
                $validated['team_member_id'],
                "Application Assigned: {$application->candidate_name}",
                "You have been assigned to handle the application of {$application->candidate_name} for '{$jobTitle}'.",
                ['application_id' => $application->id]
            );
            MailService::notifySuperAdmin(
                "Application Assigned to Team Member",
                "Application of {$application->candidate_name} for '{$jobTitle}' assigned to " . ($assignee?->name ?? "Member #{$validated['team_member_id']}"),
                ['application_id' => $application->id, 'assigned_to' => $validated['team_member_id']]
            );
        } catch (\Throwable $e) {}

        return redirect()->back()->with('success', 'Application successfully assigned to team member.');
    }

    public function updateRemark(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'remark' => 'required|string',
        ]);

        $application->admin_notes = $validated['remark'];
        $application->save();

        return redirect()->back()->with('success', 'Remark saved successfully.');
    }

    public function saveOfferDetails(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'salary'       => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
        ]);

        $application->offer_salary_package = $validated['salary'] ?? null;
        $application->offer_joining_date = $validated['joining_date'] ?? null;
        $application->offer_letter_triggered_at = now();
        $application->status = 'hired';
        $application->save();

        // Dispatch Offer Letter Email & Notifications to Candidate + Super Admin
        try {
            MailService::sendOfferLetter($application, [
                'salary'       => $validated['salary'] ?? null,
                'joining_date' => $validated['joining_date'] ?? null,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending offer letter email/notifications: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Offer details recorded.');
    }
}
