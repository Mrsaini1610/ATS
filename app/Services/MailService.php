<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\AdminNotification;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class MailService
{
    /**
     * Send a raw HTML email safely with try-catch.
     */
    public static function sendRawHtml(
        string|array $to,
        string $subject,
        string $htmlBody,
        ?string $recipientName = null
    ): bool {
        if (empty($to)) {
            return false;
        }

        try {
            Mail::html($htmlBody, function ($message) use ($to, $subject, $recipientName) {
                if (is_array($to)) {
                    $message->to($to);
                } else {
                    $message->to($to, $recipientName);
                }
                $message->subject($subject);
            });

            Log::info("MailService: Raw HTML email sent to " . (is_array($to) ? json_encode($to) : $to) . " | Subject: {$subject}");
            return true;
        } catch (Throwable $e) {
            Log::error("MailService: Failed sending raw HTML email to " . (is_array($to) ? json_encode($to) : $to) . " | Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a Blade view email safely with try-catch.
     */
    public static function sendViewEmail(
        string|array $to,
        string $subject,
        string $view,
        array $viewData = [],
        ?string $recipientName = null
    ): bool {
        if (empty($to)) {
            return false;
        }

        try {
            Mail::send($view, $viewData, function ($message) use ($to, $subject, $recipientName) {
                if (is_array($to)) {
                    $message->to($to);
                } else {
                    $message->to($to, $recipientName);
                }
                $message->subject($subject);
            });

            Log::info("MailService: View email [{$view}] sent to " . (is_array($to) ? json_encode($to) : $to) . " | Subject: {$subject}");
            return true;
        } catch (Throwable $e) {
            Log::error("MailService: Failed sending view email [{$view}] to " . (is_array($to) ? json_encode($to) : $to) . " | Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all active Super Admins.
     */
    public static function getSuperAdmins()
    {
        $admins = Admin::where('role', 'super_admin')->where('status', 1)->get();
        if ($admins->isEmpty()) {
            $fallback = Admin::find(6);
            if ($fallback) {
                return collect([$fallback]);
            }
        }
        return $admins;
    }

    /**
     * Super Admin Always Notified Helper (Email + In-App AdminNotification).
     * Super admin ko kuch bhi ho email or notification humesha ho.
     */
    public static function notifySuperAdmin(
        string $subject,
        string $message,
        array $details = [],
        ?string $actionUrl = null
    ): void {
        $superAdmins = self::getSuperAdmins();

        foreach ($superAdmins as $superAdmin) {
            // 1. In-App AdminNotification record
            try {
                AdminNotification::create([
                    'admin_id' => $superAdmin->id,
                    'type'     => $details['type'] ?? 'system_alert',
                    'title'    => $subject,
                    'body'     => $message,
                    'data'     => array_merge($details, ['action_url' => $actionUrl]),
                ]);
            } catch (Throwable $e) {
                Log::warning("MailService: Failed to create AdminNotification for Super Admin #{$superAdmin->id}: " . $e->getMessage());
            }

            // 2. High-Priority Alert Email to Super Admin
            if (!empty($superAdmin->email)) {
                self::sendViewEmail(
                    $superAdmin->email,
                    "[Super Admin Alert] " . $subject,
                    'emails.super_admin_alert',
                    [
                        'subject'      => $subject,
                        'alertTitle'   => $subject,
                        'alertMessage' => $message,
                        'details'      => $details,
                        'actionUrl'    => $actionUrl ?: url('/admin'),
                    ],
                    $superAdmin->name
                );
            }
        }
    }

    /**
     * Notify an individual Admin / Team Member (Email + In-App AdminNotification).
     */
    public static function notifyAdmin(
        Admin|int $adminOrId,
        string $subject,
        string $message,
        array $details = [],
        bool $sendEmail = true,
        ?string $actionUrl = null
    ): void {
        $admin = $adminOrId instanceof Admin ? $adminOrId : Admin::find($adminOrId);
        if (!$admin) {
            return;
        }

        // 1. In-App Admin Notification
        try {
            AdminNotification::create([
                'admin_id' => $admin->id,
                'type'     => $details['type'] ?? 'admin_notification',
                'title'    => $subject,
                'body'     => $message,
                'data'     => array_merge($details, ['action_url' => $actionUrl]),
            ]);
        } catch (Throwable $e) {
            Log::warning("MailService: Failed creating AdminNotification for Admin #{$admin->id}: " . $e->getMessage());
        }

        // 2. Email Notification
        if ($sendEmail && !empty($admin->email)) {
            self::sendViewEmail(
                $admin->email,
                $subject,
                'emails.super_admin_alert',
                [
                    'subject'      => $subject,
                    'alertTitle'   => $subject,
                    'alertMessage' => $message,
                    'details'      => $details,
                    'actionUrl'    => $actionUrl ?: url('/admin'),
                ],
                $admin->name
            );
        }
    }

    /**
     * TRIGGER 1: Candidate Registration / Profile Complete Welcome Email + Super Admin Alert.
     */
    public static function sendWelcomeCandidate(User $user): void
    {
        // Avoid sending duplicate welcome emails to the same candidate
        $alreadySent = UserNotification::where('user_id', $user->id)
            ->where('type', 'welcome')
            ->exists();

        if ($alreadySent) {
            return;
        }

        $candidateName = $user->full_name ?: $user->name ?: 'Candidate';

        // 1. In-App UserNotification & Push Notification
        try {
            PushNotificationService::sendToUser(
                $user,
                "Welcome to " . config('app.name', 'ATS') . "! 🚀",
                "Your profile is set up. Explore verified job openings and apply with 1 tap.",
                ['type' => 'welcome', 'user_id' => $user->id],
                'welcome',
                '/job-search'
            );
        } catch (Throwable $e) {
            Log::warning("MailService: Push/In-app failed for candidate welcome: " . $e->getMessage());
        }

        // 2. Candidate Welcome Email
        if (!empty($user->email)) {
            self::sendViewEmail(
                $user->email,
                "Welcome to " . config('app.name', 'ATS') . " - Let's Find Your Dream Job! 🎉",
                'emails.candidate_welcome',
                [
                    'user'      => $user,
                    'actionUrl' => url('/job-search'),
                ],
                $candidateName
            );
        }

        // 3. Super Admin Always Notified
        self::notifySuperAdmin(
            "New Candidate Registered: {$candidateName}",
            "Candidate {$candidateName} has registered and completed their profile on the platform.",
            [
                'type'           => 'candidate_registered',
                'candidate_name' => $candidateName,
                'email'          => $user->email ?? 'N/A',
                'phone'          => $user->phone ?? 'N/A',
                'city'           => $user->city ?? 'N/A',
                'job_title'      => $user->job_title ?? 'N/A',
            ],
            url('/admin/users')
        );

        // 4. Active Admins Notified
        try {
            $admins = Admin::where('role', 'admin')->where('status', 1)->get();
            foreach ($admins as $admin) {
                self::notifyAdmin(
                    $admin,
                    "New Candidate Registered: {$candidateName}",
                    "Candidate {$candidateName} registered ({$user->city}).",
                    [
                        'type'           => 'candidate_registered',
                        'candidate_id'   => $user->id,
                        'candidate_name' => $candidateName,
                    ],
                    true,
                    url('/admin/users')
                );
            }
        } catch (Throwable $e) {
            Log::warning("MailService: Failed notifying admins of candidate registration: " . $e->getMessage());
        }
    }

    /**
     * TRIGGER 2: New Job Post Created.
     * Notifies: Super Admin, Creator Admin, Assigned Team Member, and Candidates.
     */
    public static function sendNewJobCreated(JobPost $job): void
    {
        $job->loadMissing(['creator', 'assignedMember', 'companyRelation']);
        $companyName = $job->companyRelation?->name ?? $job->company ?? 'ATS Partner';

        // 1. Super Admin Always Notified
        self::notifySuperAdmin(
            "New Job Created: {$job->title} at {$companyName}",
            "A new job opening '{$job->title}' has been posted by " . ($job->creator?->name ?? 'Admin') . ".",
            [
                'type'        => 'job_created',
                'job_id'      => $job->id,
                'job_title'   => $job->title,
                'company'     => $companyName,
                'location'    => $job->location ?? 'N/A',
                'openings'    => $job->openings ?? 1,
                'posted_by'   => $job->creator?->name ?? 'Admin',
                'assigned_to' => $job->assignedMember?->name ?? 'Unassigned',
                'status'      => $job->status ?? 'pending',
            ],
            url('/admin/jobs')
        );

        // 2. Creator Admin (if not Super Admin)
        if ($job->creator && !$job->creator->isSuperAdmin() && !empty($job->creator->email)) {
            self::sendViewEmail(
                $job->creator->email,
                "Job Post Created Successfully: {$job->title}",
                'emails.new_job_posted',
                [
                    'job'               => $job,
                    'recipientName'     => $job->creator->name,
                    'headerSubtitle'    => 'Job Created Successfully',
                    'messageIntro'      => "Your job post for '{$job->title}' has been saved and is now being processed.",
                    'actionUrl'         => url('/admin/jobs'),
                ],
                $job->creator->name
            );

            try {
                AdminNotification::create([
                    'admin_id' => $job->creator->id,
                    'type'     => 'job_created',
                    'title'    => "Job Created: {$job->title}",
                    'body'     => "Your job posting for {$job->title} at {$companyName} was created successfully.",
                    'data'     => ['job_id' => $job->id, 'uuid' => $job->uuid],
                ]);
            } catch (Throwable $e) {}
        }

        // 3. Assigned Team Member (`assigned_to`)
        if ($job->assignedMember && !empty($job->assignedMember->email)) {
            self::sendViewEmail(
                $job->assignedMember->email,
                "New Job Assigned to You: {$job->title} at {$companyName}",
                'emails.new_job_posted',
                [
                    'job'            => $job,
                    'recipientName'  => $job->assignedMember->name,
                    'headerSubtitle' => 'Job Assigned to Your Queue',
                    'messageIntro'   => "You have been assigned as the coordinator for '{$job->title}' at {$companyName}.",
                    'actionUrl'      => url('/admin/jobs'),
                ],
                $job->assignedMember->name
            );

            try {
                AdminNotification::create([
                    'admin_id' => $job->assignedMember->id,
                    'type'     => 'job_assigned',
                    'title'    => "Job Assigned: {$job->title}",
                    'body'     => "You have been assigned to handle {$job->title} at {$companyName}.",
                    'data'     => ['job_id' => $job->id, 'uuid' => $job->uuid],
                ]);
            } catch (Throwable $e) {}
        }

        // 4. Candidate Notification (Matching candidates or recent active users)
        try {
            $matchingUsers = User::query()
                ->where('is_open_to_work', true)
                ->orWhere(function ($q) use ($job) {
                    if (!empty($job->location)) {
                        $q->where('city', 'LIKE', '%' . $job->location . '%');
                    }
                })
                ->latest()
                ->limit(20)
                ->get();

            foreach ($matchingUsers as $cand) {
                PushNotificationService::notifyJobMatch($cand, $job);
            }
        } catch (Throwable $e) {
            Log::warning("MailService: Candidate job match broadcast error: " . $e->getMessage());
        }
    }

    /**
     * TRIGGER 3: Job Applied.
     * Notifies: Candidate (Email + Push + In-app), Creator Admin, Assigned Admin, and Super Admin.
     */
    public static function sendJobApplied(JobApplication $application): void
    {
        $application->loadMissing(['candidate', 'jobPost.creator', 'jobPost.assignedMember']);

        $candidate = $application->candidate ?? ($application->candidate_uuid ? User::where('uuid', $application->candidate_uuid)->first() : User::find($application->candidate_id));
        $job       = $application->jobPost ?? JobPost::find($application->job_id);

        $candidateName  = $application->candidate_name ?: ($candidate?->full_name ?: ($candidate?->name ?: 'Candidate'));
        $candidateEmail = $application->candidate_email ?: $candidate?->email;
        $candidatePhone = $application->candidate_phone ?: $candidate?->phone;
        $jobTitle       = $job?->title ?: 'Position';
        $companyName    = $job?->company ?: ($job?->companyRelation?->name ?? 'ATS Partner');

        // 1. Candidate Notification: Push & In-app
        try {
            PushNotificationService::notifyApplicationSubmitted($application);
        } catch (Throwable $e) {
            Log::warning("MailService: Push failed on application submit: " . $e->getMessage());
        }

        // 2. Candidate Confirmation Email
        if (!empty($candidateEmail)) {
            self::sendViewEmail(
                $candidateEmail,
                "Application Received: {$jobTitle} at {$companyName}",
                'emails.job_applied_candidate',
                [
                    'candidateName' => $candidateName,
                    'jobTitle'      => $jobTitle,
                    'companyName'   => $companyName,
                    'application'   => $application,
                    'actionUrl'     => url('/my-applications'),
                ],
                $candidateName
            );
        }

        // 3. Creator Admin
        $creator = $job?->creator;
        if ($creator && !$creator->isSuperAdmin()) {
            if (!empty($creator->email)) {
                self::sendViewEmail(
                    $creator->email,
                    "New Application: {$candidateName} applied for {$jobTitle}",
                    'emails.job_applied_admin',
                    [
                        'recipientName'       => $creator->name,
                        'roleContext'         => 'Job Poster Notification',
                        'candidateName'       => $candidateName,
                        'candidateEmail'      => $candidateEmail,
                        'candidatePhone'      => $candidatePhone,
                        'candidateExperience' => $application->candidate_experience,
                        'candidateCity'       => $application->city,
                        'candidateSkills'     => $application->candidate_skills,
                        'jobTitle'            => $jobTitle,
                        'companyName'         => $companyName,
                        'actionUrl'           => url('/admin/applications'),
                    ],
                    $creator->name
                );
            }

            try {
                AdminNotification::create([
                    'admin_id' => $creator->id,
                    'type'     => 'new_application',
                    'title'    => "New Applicant: {$candidateName}",
                    'body'     => "{$candidateName} applied for your posting '{$jobTitle}'.",
                    'data'     => ['application_id' => $application->id, 'job_id' => $application->job_id],
                ]);
            } catch (Throwable $e) {}
        }

        // 4. Assigned Team Member (`job->assigned_to` or calling member)
        $assignee = $job?->assignedMember ?? ($application->assignedCallingMember ?? null);
        if ($assignee && (!$creator || $assignee->id !== $creator->id) && !$assignee->isSuperAdmin()) {
            if (!empty($assignee->email)) {
                self::sendViewEmail(
                    $assignee->email,
                    "New Applicant in Queue: {$candidateName} for {$jobTitle}",
                    'emails.job_applied_admin',
                    [
                        'recipientName'       => $assignee->name,
                        'roleContext'         => 'Assigned Job Notification',
                        'candidateName'       => $candidateName,
                        'candidateEmail'      => $candidateEmail,
                        'candidatePhone'      => $candidatePhone,
                        'candidateExperience' => $application->candidate_experience,
                        'candidateCity'       => $application->city,
                        'candidateSkills'     => $application->candidate_skills,
                        'jobTitle'            => $jobTitle,
                        'companyName'         => $companyName,
                        'actionUrl'           => url('/admin/applications'),
                    ],
                    $assignee->name
                );
            }

            try {
                AdminNotification::create([
                    'admin_id' => $assignee->id,
                    'type'     => 'new_application_assigned',
                    'title'    => "New Assigned Application: {$candidateName}",
                    'body'     => "{$candidateName} applied for assigned job '{$jobTitle}'.",
                    'data'     => ['application_id' => $application->id, 'job_id' => $application->job_id],
                ]);
            } catch (Throwable $e) {}
        }

        // 5. Super Admin ALWAYS Notified (Email + In-App)
        self::notifySuperAdmin(
            "New Job Application: {$candidateName} applied for {$jobTitle}",
            "{$candidateName} ({$candidateEmail}, {$candidatePhone}) submitted an application for {$jobTitle} at {$companyName}.",
            [
                'type'           => 'new_application',
                'application_id' => $application->id,
                'job_id'         => $application->job_id,
                'candidate_name' => $candidateName,
                'candidate_email'=> $candidateEmail,
                'job_title'      => $jobTitle,
                'company'        => $companyName,
                'status'         => $application->status,
            ],
            url('/admin/applications')
        );
    }

    /**
     * TRIGGER 4: Application Status Changed (Shortlisted, Under Review, Hired, Rejected, etc.).
     * Notifies: Candidate (ALWAYS) + Super Admin, Admin, and Assigned Member (EXCLUDING the one performing the update).
     */
    public static function sendApplicationStatusChanged(
        JobApplication $application,
        string $newStatus,
        ?string $comments = null,
        $actorAdminOrId = null
    ): void {
        $application->loadMissing(['candidate', 'jobPost.creator', 'jobPost.assignedMember', 'assignedCallingMember']);

        $candidate = $application->candidate ?? ($application->candidate_uuid ? User::where('uuid', $application->candidate_uuid)->first() : User::find($application->candidate_id));
        $job       = $application->jobPost ?? JobPost::find($application->job_id);

        $candidateName  = $application->candidate_name ?: ($candidate?->full_name ?: ($candidate?->name ?: 'Candidate'));
        $candidateEmail = $application->candidate_email ?: $candidate?->email;
        $jobTitle       = $job?->title ?: 'Position';
        $companyName    = $job?->company ?: ($job?->companyRelation?->name ?? 'ATS Partner');

        // Determine who performed the update so they are excluded
        $actorId = $actorAdminOrId instanceof Admin ? $actorAdminOrId->id : ($actorAdminOrId ?? auth('admin')->id());
        $actor = $actorId ? Admin::find($actorId) : null;
        $actorIsSuperAdmin = $actor ? $actor->isSuperAdmin() : false;

        // 1. Candidate Push Notification & In-App Notification (ALWAYS)
        try {
            PushNotificationService::notifyApplicationStatusChange($application, $newStatus);
        } catch (Throwable $e) {
            Log::warning("MailService: Push failed on status update: " . $e->getMessage());
        }

        // 2. Candidate Status Email (ALWAYS)
        if (!empty($candidateEmail)) {
            self::sendViewEmail(
                $candidateEmail,
                "Application Status Update: {$jobTitle} - " . ucwords(str_replace('_', ' ', $newStatus)),
                'emails.application_status_changed',
                [
                    'candidateName' => $candidateName,
                    'jobTitle'      => $jobTitle,
                    'companyName'   => $companyName,
                    'newStatus'     => $newStatus,
                    'comments'      => $comments,
                    'actionUrl'     => url('/my-applications'),
                ],
                $candidateName
            );
        }

        // 3. Super Admin Notified (ONLY if Super Admin did NOT perform this update)
        if (!$actorIsSuperAdmin) {
            self::notifySuperAdmin(
                "Status Update: {$candidateName} -> " . ucwords(str_replace('_', ' ', $newStatus)),
                "Application of {$candidateName} for {$jobTitle} at {$companyName} updated to '{$newStatus}'." . ($comments ? " Notes: {$comments}" : ""),
                [
                    'type'           => 'application_status_update',
                    'application_id' => $application->id,
                    'job_id'         => $application->job_id,
                    'candidate_name' => $candidateName,
                    'job_title'      => $jobTitle,
                    'new_status'     => $newStatus,
                    'reviewer_id'    => $actorId ?? 'System',
                ],
                url('/admin/applications')
            );
        }

        // 4. Creator Admin Notified (ONLY if Creator Admin did NOT perform this update and is not Super Admin)
        $creator = $job?->creator;
        if ($creator && !$creator->isSuperAdmin() && (!$actorId || $creator->id != $actorId)) {
            self::notifyAdmin(
                $creator,
                "Application Status: {$candidateName} -> " . ucwords(str_replace('_', ' ', $newStatus)),
                "{$candidateName}'s application for {$jobTitle} is now " . ucwords(str_replace('_', ' ', $newStatus)) . ($comments ? " Notes: {$comments}" : ""),
                [
                    'type'           => 'application_status_update',
                    'application_id' => $application->id,
                    'job_id'         => $application->job_id,
                    'status'         => $newStatus,
                ],
                true,
                url('/admin/applications')
            );
        }

        // 5. Assigned Team Member Notified (ONLY if Assigned Member did NOT perform this update and is distinct)
        $assignee = $application->assignedCallingMember ?? $job?->assignedMember;
        if ($assignee && !$assignee->isSuperAdmin() && (!$actorId || $assignee->id != $actorId) && (!$creator || $assignee->id != $creator->id)) {
            self::notifyAdmin(
                $assignee,
                "Assigned Applicant Status: {$candidateName} -> " . ucwords(str_replace('_', ' ', $newStatus)),
                "Assigned candidate {$candidateName}'s application for {$jobTitle} was updated to " . ucwords(str_replace('_', ' ', $newStatus)) . ($comments ? " Notes: {$comments}" : ""),
                [
                    'type'           => 'application_status_update',
                    'application_id' => $application->id,
                    'job_id'         => $application->job_id,
                    'status'         => $newStatus,
                ],
                true,
                url('/admin/applications')
            );
        }
    }

    /**
     * TRIGGER 5: Interview Scheduled / Updated.
     * Notifies: Candidate (Email + In-app + Push), Interviewer / Assignee, and Super Admin.
     */
    public static function sendInterviewScheduled(
        $interviewOrApplication,
        array $details = []
    ): void {
        $candidateName       = 'Candidate';
        $candidateEmail      = null;
        $candidatePhone      = null;
        $candidateUser       = null;
        $jobTitle            = 'Interview';
        $companyName         = 'ATS Partner';
        $interviewDateTime   = now()->format('d M Y, h:i A');
        $interviewMode       = 'phone';
        $interviewer         = 'ATS Recruiter';
        $meetingLink         = null;
        $interviewAddress    = null;
        $round               = 'HR Screening';
        $contactPerson       = null;
        $instructions        = null;
        $applicationId       = null;

        if ($interviewOrApplication instanceof Interview) {
            $candidateName     = $interviewOrApplication->candidate_name;
            $candidatePhone    = $interviewOrApplication->candidate_phone;
            $jobTitle          = $interviewOrApplication->job_title ?: 'Position';
            $companyName       = $interviewOrApplication->company ?: 'ATS Partner';
            $interviewDateTime = ($interviewOrApplication->interview_date ? $interviewOrApplication->interview_date->format('d M Y') : date('d M Y')) . ' at ' . ($interviewOrApplication->interview_time ?: 'Scheduled Time');
            $interviewMode     = $interviewOrApplication->mode ?: 'phone';
            $interviewer       = $interviewOrApplication->interviewer ?: 'Recruiter';
            $meetingLink       = $interviewOrApplication->meeting_link;
            $round             = $interviewOrApplication->round ?: 'HR Round';
            $applicationId     = $interviewOrApplication->application_id;

            if ($applicationId) {
                $app = JobApplication::find($applicationId);
                if ($app) {
                    $candidateEmail = $app->candidate_email ?: $app->candidate?->email;
                    $candidateUser  = $app->candidate;
                }
            }
            if (!$candidateEmail && $candidatePhone) {
                $candidateUser = User::where('phone', $candidatePhone)->first();
                $candidateEmail = $candidateUser?->email;
            }
        } elseif ($interviewOrApplication instanceof JobApplication) {
            $app = $interviewOrApplication;
            $candidateName     = $app->candidate_name ?: ($app->candidate?->full_name ?: 'Candidate');
            $candidateEmail    = $app->candidate_email ?: $app->candidate?->email;
            $candidatePhone    = $app->candidate_phone ?: $app->candidate?->phone;
            $candidateUser     = $app->candidate;
            $jobTitle          = $app->jobPost?->title ?: 'Position';
            $companyName       = $app->jobPost?->company ?: 'ATS Partner';
            $interviewDateTime = !empty($details['interview_date_time']) ? date('d M Y, h:i A', strtotime($details['interview_date_time'])) : now()->format('d M Y, h:i A');
            $interviewMode     = $details['interview_mode'] ?? ($app->interview_mode ?: 'online');
            $interviewAddress  = $details['interview_address'] ?? $app->interview_address;
            $instructions      = $details['interview_instructions'] ?? $app->interview_instructions;
            $contactPerson     = $details['interview_contact_person'] ?? $app->interview_contact_person;
            $applicationId     = $app->id;
        }

        // 1. Candidate Push & In-app Notification
        if ($candidateUser) {
            try {
                PushNotificationService::sendToUser(
                    $candidateUser,
                    "Interview Scheduled: {$jobTitle} 📅",
                    "Your interview with {$companyName} is confirmed on {$interviewDateTime} ({$interviewMode}).",
                    [
                        'type'           => 'interview',
                        'application_id' => $applicationId,
                        'job_title'      => $jobTitle,
                        'company'        => $companyName,
                        'date_time'      => $interviewDateTime,
                    ],
                    'interview',
                    '/my-applications'
                );
            } catch (Throwable $e) {
                Log::warning("MailService: Interview push failed: " . $e->getMessage());
            }
        }

        // 2. Candidate Interview Schedule Email
        if (!empty($candidateEmail)) {
            self::sendViewEmail(
                $candidateEmail,
                "Interview Scheduled: {$jobTitle} with {$companyName} - {$interviewDateTime}",
                'emails.interview_scheduled',
                [
                    'candidateName'     => $candidateName,
                    'jobTitle'          => $jobTitle,
                    'companyName'       => $companyName,
                    'interviewDateTime' => $interviewDateTime,
                    'interviewMode'     => $interviewMode,
                    'interviewer'       => $interviewer,
                    'round'             => $round,
                    'meetingLink'       => $meetingLink,
                    'interviewAddress'  => $interviewAddress,
                    'contactPerson'     => $contactPerson,
                    'instructions'      => $instructions,
                    'actionUrl'         => url('/my-applications'),
                ],
                $candidateName
            );
        }

        // 3. Super Admin ALWAYS Notified
        self::notifySuperAdmin(
            "Interview Scheduled: {$candidateName} for {$jobTitle}",
            "Interview scheduled for {$candidateName} ({$candidatePhone}) on {$interviewDateTime} via {$interviewMode} for {$jobTitle} at {$companyName}.",
            [
                'type'               => 'interview_scheduled',
                'candidate_name'     => $candidateName,
                'candidate_phone'    => $candidatePhone,
                'job_title'          => $jobTitle,
                'company'            => $companyName,
                'interview_datetime' => $interviewDateTime,
                'interview_mode'     => $interviewMode,
                'interviewer'        => $interviewer,
            ],
            url('/admin/interviews')
        );

        // 4. Creator Admin Notification (if not Super Admin)
        $job = ($interviewOrApplication instanceof JobApplication)
            ? $interviewOrApplication->jobPost
            : ($applicationId ? JobApplication::find($applicationId)?->jobPost : null);

        if ($job && $job->creator && !$job->creator->isSuperAdmin()) {
            self::notifyAdmin(
                $job->creator,
                "Interview Scheduled: {$candidateName} for {$jobTitle}",
                "Interview scheduled with candidate {$candidateName} on {$interviewDateTime}.",
                ['interview_datetime' => $interviewDateTime, 'job_id' => $job->id],
                true,
                url('/admin/interviews')
            );
        }

        // 5. Assigned Interviewer Notification (The person conducting the interview)
        $interviewerAdmin = null;
        if (!empty($details['interviewer_id'])) {
            $interviewerAdmin = Admin::find($details['interviewer_id']);
        } elseif (!empty($interviewer) && $interviewer !== 'ATS Recruiter' && $interviewer !== 'Recruiter') {
            $interviewerAdmin = Admin::where('name', 'LIKE', '%' . $interviewer . '%')->first();
        }

        if ($interviewerAdmin && (!$job || !$job->creator || $interviewerAdmin->id !== $job->creator->id) && !$interviewerAdmin->isSuperAdmin()) {
            if (!empty($interviewerAdmin->email)) {
                self::sendViewEmail(
                    $interviewerAdmin->email,
                    "Interview Assignment: {$candidateName} for {$jobTitle} on {$interviewDateTime}",
                    'emails.interview_scheduled_interviewer',
                    [
                        'interviewerName'   => $interviewerAdmin->name,
                        'candidateName'     => $candidateName,
                        'candidatePhone'    => $candidatePhone,
                        'candidateEmail'    => $candidateEmail,
                        'jobTitle'          => $jobTitle,
                        'companyName'       => $companyName,
                        'interviewDateTime' => $interviewDateTime,
                        'interviewMode'     => $interviewMode,
                        'meetingLink'       => $meetingLink,
                        'interviewAddress'  => $interviewAddress,
                        'round'             => $round,
                        'instructions'      => $instructions,
                        'actionUrl'         => url('/admin/interviews'),
                    ],
                    $interviewerAdmin->name
                );
            }

            try {
                AdminNotification::create([
                    'admin_id' => $interviewerAdmin->id,
                    'type'     => 'interview_assigned',
                    'title'    => "Interview Assigned: {$candidateName}",
                    'body'     => "You are assigned to conduct {$candidateName}'s interview for {$jobTitle} on {$interviewDateTime}.",
                    'data'     => ['application_id' => $applicationId, 'candidate_name' => $candidateName],
                ]);
            } catch (Throwable $e) {}
        }
    }

    /**
     * TRIGGER 6: Interview Status Changed (Done, No-Show, Rescheduled, Cancelled).
     */
    public static function sendInterviewStatusUpdated(Interview $interview, string $newStatus): void
    {
        $statusLabel = ucfirst($newStatus);

        self::notifySuperAdmin(
            "Interview {$statusLabel}: {$interview->candidate_name}",
            "Interview with {$interview->candidate_name} ({$interview->job_title}) updated to '{$newStatus}'.",
            [
                'type'           => 'interview_status_update',
                'interview_id'   => $interview->id,
                'candidate_name' => $interview->candidate_name,
                'job_title'      => $interview->job_title,
                'new_status'     => $newStatus,
            ],
            url('/admin/interviews')
        );
    }

    /**
     * TRIGGER 7: Job Post Status Updated (Approved, Rejected, Hold, Deactivated).
     */
    public static function sendJobStatusUpdated(
        JobPost $job,
        string $oldStatus,
        string $newStatus,
        ?string $remark = null
    ): void {
        $job->loadMissing(['creator', 'assignedMember']);
        $companyName = $job->companyRelation?->name ?? $job->company ?? 'ATS Partner';
        $statusLabel = ucwords(str_replace('_', ' ', $newStatus));

        // 1. Super Admin Notified
        self::notifySuperAdmin(
            "Job Post Status: {$job->title} is now {$statusLabel}",
            "Job post '{$job->title}' at {$companyName} changed from {$oldStatus} to {$newStatus}." . ($remark ? " Remark: {$remark}" : ""),
            [
                'type'       => 'job_status_update',
                'job_id'     => $job->id,
                'job_title'  => $job->title,
                'company'    => $companyName,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'remark'     => $remark,
            ],
            url('/admin/jobs')
        );

        // 2. Creator Admin
        if ($job->creator && !$job->creator->isSuperAdmin()) {
            self::notifyAdmin(
                $job->creator,
                "Job Status Updated: {$job->title} is {$statusLabel}",
                "Your job post '{$job->title}' status was changed to {$statusLabel}." . ($remark ? " Note: {$remark}" : ""),
                ['job_id' => $job->id, 'status' => $newStatus],
                true,
                url('/admin/jobs')
            );
        }

        // 3. Assigned Member
        if ($job->assignedMember && (!$job->creator || $job->assignedMember->id !== $job->creator->id)) {
            self::notifyAdmin(
                $job->assignedMember,
                "Assigned Job Status Updated: {$job->title} is {$statusLabel}",
                "Job '{$job->title}' status was updated to {$statusLabel}.",
                ['job_id' => $job->id, 'status' => $newStatus],
                true,
                url('/admin/jobs')
            );
        }
    }

    /**
     * TRIGGER 8: Job Offer Letter / Selection Event.
     */
    public static function sendOfferLetter(JobApplication $application, array $offerDetails = []): void
    {
        $application->loadMissing(['candidate', 'jobPost.creator', 'jobPost.companyRelation']);

        $candidate = $application->candidate ?? ($application->candidate_uuid ? User::where('uuid', $application->candidate_uuid)->first() : User::find($application->candidate_id));
        $job       = $application->jobPost ?? JobPost::find($application->job_id);

        $candidateName  = $application->candidate_name ?: ($candidate?->full_name ?: ($candidate?->name ?: 'Candidate'));
        $candidateEmail = $application->candidate_email ?: $candidate?->email;
        $designation    = $offerDetails['designation'] ?? ($application->offer_designation ?: ($job?->title ?: 'Position'));
        $jobTitle       = $job?->title ?: $designation;
        $companyName    = $job?->company ?: ($job?->companyRelation?->name ?? 'ATS Partner');
        $package        = $offerDetails['salary'] ?? ($application->offer_salary_package ?: 'As discussed');
        $joiningDate    = !empty($offerDetails['joining_date'])
            ? date('d M Y', strtotime($offerDetails['joining_date']))
            : ($application->offer_joining_date ? date('d M Y', strtotime($application->offer_joining_date)) : 'To be confirmed');
        $workLocation   = $offerDetails['work_location'] ?? ($application->offer_work_location ?: ($job?->location ?: ($application->city ?: 'Office / On-site')));
        $facilities     = $offerDetails['facilities'] ?? ($application->offer_facilities ?: []);
        $terms          = $offerDetails['terms'] ?? ($application->offer_terms ?: null);

        // 1. Candidate Push & In-app
        if ($candidate) {
            try {
                PushNotificationService::sendToUser(
                    $candidate,
                    "Congratulations! Official Job Offer Letter 🏆",
                    "You have been offered the position of {$designation} at {$companyName} ({$package}). View your official offer letter!",
                    [
                        'type'           => 'offer_extended',
                        'application_id' => $application->id,
                        'designation'    => $designation,
                        'package'        => $package,
                        'joining_date'   => $joiningDate,
                    ],
                    'shortlisted',
                    '/my-applications'
                );
            } catch (Throwable $e) {
                Log::warning("MailService: Push failed on offer letter: " . $e->getMessage());
            }
        }

        // 2. Candidate Formal Offer Letter Email
        if (!empty($candidateEmail)) {
            self::sendViewEmail(
                $candidateEmail,
                "Official Job Offer: {$designation} at {$companyName} 🏆",
                'emails.offer_letter_candidate',
                [
                    'candidateName' => $candidateName,
                    'jobTitle'      => $jobTitle,
                    'designation'   => $designation,
                    'companyName'   => $companyName,
                    'salaryPackage' => $package,
                    'joiningDate'   => $joiningDate,
                    'workLocation'  => $workLocation,
                    'facilities'    => is_array($facilities) ? $facilities : (json_decode($facilities, true) ?: []),
                    'terms'         => $terms,
                    'actionUrl'     => url('/my-applications'),
                ],
                $candidateName
            );
        }

        // 3. Super Admin ALWAYS Notified
        self::notifySuperAdmin(
            "Candidate Offer Issued: {$candidateName} for {$designation}",
            "Formal offer letter sent to {$candidateName} ({$candidateEmail}) for {$designation} at {$companyName}. Package: {$package}, Joining: {$joiningDate}.",
            [
                'type'           => 'offer_extended',
                'application_id' => $application->id,
                'candidate_name' => $candidateName,
                'designation'    => $designation,
                'company'        => $companyName,
                'package'        => $package,
                'joining_date'   => $joiningDate,
                'work_location'  => $workLocation,
            ],
            url('/admin/applications')
        );

        // 4. Job Creator Admin Notified (if not Super Admin)
        $creator = $job?->creator;
        if ($creator && !$creator->isSuperAdmin()) {
            self::notifyAdmin(
                $creator,
                "Offer Letter Sent: {$candidateName} for {$designation}",
                "Formal offer letter has been released to {$candidateName} for {$designation} at {$companyName}.",
                [
                    'type'           => 'offer_extended',
                    'application_id' => $application->id,
                    'candidate_name' => $candidateName,
                    'designation'    => $designation,
                    'package'        => $package,
                    'joining_date'   => $joiningDate,
                ],
                true,
                url('/admin/applications')
            );
        }
    }

    /**
     * Staff / Team Member / Admin Created Credentials Email + Super Admin Alert.
     */
    public static function sendStaffCreated(Admin $staff, string $plainPassword, ?string $createdByName = null): void
    {
        if (empty($staff->email)) {
            return;
        }

        $loginUrl = url('/admin/login');
        $staffName = $staff->name ?: 'Team Member';
        $roleLabel = str_replace('_', ' ', ucwords($staff->role, '_'));

        // 1. Send Login Credentials to New Staff Member
        self::sendViewEmail(
            $staff->email,
            "Welcome to the ATS Team! Your Login Credentials 🚀",
            'emails.staff_created',
            [
                'staff'         => $staff,
                'staffName'     => $staffName,
                'plainPassword' => $plainPassword,
                'roleLabel'     => $roleLabel,
                'loginUrl'      => $loginUrl,
                'createdByName' => $createdByName ?: 'Administrator',
            ],
            $staffName
        );

        // 2. Super Admin ALWAYS Notified
        self::notifySuperAdmin(
            "New Staff Member Added: {$staffName} ({$roleLabel})",
            "Staff member {$staffName} was created by " . ($createdByName ?: 'Administrator') . " with role {$roleLabel} and email {$staff->email}.",
            [
                'type'       => 'staff_created',
                'staff_id'   => $staff->id,
                'staff_name' => $staffName,
                'role'       => $roleLabel,
                'email'      => $staff->email,
                'created_by' => $createdByName ?: 'Administrator',
            ],
            url('/admin/team')
        );
    }
}
