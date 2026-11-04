<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Company;
use App\Models\Skill;
use App\Models\User;
use App\Services\PushNotificationService;
use App\Services\MailService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminJobController extends Controller
{
    private function getAssignableTeamMembers(?Admin $user)
    {
        if (! $user || $user->isTeamMember()) {
            return collect([]);
        }

        return Admin::whereIn('role', ['team_member', 'admin'])
            ->where('status', 1)
            ->select('id', 'uuid', 'name', 'email', 'phone', 'role')
            ->orderBy('name')
            ->get();
    }

    public function index(Request $request)
    {
        $user = auth('admin')->user();

        // 1. Auto-deactivate posts whose last apply date has passed
        JobPost::autoDeactivateExpiredPosts();

        $canViewAll = $user->isSuperAdmin() || in_array('view_all_jobs', $user->permissionList(), true);
        $scope = $request->query('scope', $canViewAll ? ($user->isSuperAdmin() ? 'all' : 'your') : 'your');
        if (! $canViewAll) {
            $scope = 'your';
        }

        $query = JobPost::with(['creator:id,name', 'assignedMember:id,name', 'category:id,name', 'companyRelation:uuid,name,location'])
            ->withCount('applications')
            ->latest();

        if ($scope === 'your') {
            if ($user->isAdmin()) {
                $clusterUserIds = Admin::where('created_by', $user->id)->pluck('id')->push($user->id)->all();
                $query->where(function ($q) use ($clusterUserIds, $user) {
                    $q->whereIn('created_by', $clusterUserIds)
                      ->orWhereIn('assigned_to', $clusterUserIds)
                      ->orWhere('assigned_to', $user->id);
                });
            } elseif ($user->isTeamMember()) {
                $query->where(function ($q) use ($user) {
                    $q->where('created_by', $user->id)
                      ->orWhere('assigned_to', $user->id);
                });
            } else {
                $query->where(function ($q) use ($user) {
                    $q->where('created_by', $user->id)
                      ->orWhere('assigned_to', $user->id);
                });
            }
        }

        // Preload candidate locations for 15 KM radius calculation
        $candidateLocations = \App\Models\User::select([
                'id', 'city', 'area',
                'latitude', 'longitude',
                'web_latitude', 'web_longitude',
                'app_latitude', 'app_longitude'
            ])
            ->get();

        $jobs = $query->get()->map(function ($job) use ($candidateLocations) {
            $salaryType = $job->salary_type ?: 'monthly';
            $unitLabel = match (strtolower((string) $salaryType)) {
                'monthly'    => 'month',
                'weekly'     => 'week',
                'quarterly'  => 'quarter',
                'halfyearly' => 'half-year',
                'yearly'     => 'year',
                default      => strtolower((string) $salaryType),
            };

            $salary = 'Not Disclosed';
            if ($job->min_salary && $job->max_salary) {
                $minFmt = number_format((float) $job->min_salary);
                $maxFmt = number_format((float) $job->max_salary);
                $salary = ($job->min_salary == $job->max_salary)
                    ? "₹{$minFmt} / {$unitLabel}"
                    : "₹{$minFmt} - ₹{$maxFmt} / {$unitLabel}";
            } elseif ($job->min_salary) {
                $minFmt = number_format((float) $job->min_salary);
                $salary = "₹{$minFmt}+ / {$unitLabel}";
            } elseif ($job->max_salary) {
                $maxFmt = number_format((float) $job->max_salary);
                $salary = "Up to ₹{$maxFmt} / {$unitLabel}";
            } elseif ($job->min_lpa && $job->max_lpa) {
                $salary = "₹{$job->min_lpa} - ₹{$job->max_lpa} LPA";
            } elseif ($job->min_lpa) {
                $salary = "₹{$job->min_lpa} LPA";
            }

            $jobLat = $job->latitude ? (float) $job->latitude : null;
            $jobLng = $job->longitude ? (float) $job->longitude : null;
            $nearbyCandidatesCount = 0;

            foreach ($candidateLocations as $cand) {
                $uLat = $cand->latitude ?? $cand->web_latitude ?? $cand->app_latitude;
                $uLng = $cand->longitude ?? $cand->web_longitude ?? $cand->app_longitude;

                if ($jobLat && $jobLng && $uLat && $uLng) {
                    $dist = self::calculateDistanceKm($jobLat, $jobLng, (float) $uLat, (float) $uLng);
                    if ($dist <= 15.0) {
                        $nearbyCandidatesCount++;
                        continue;
                    }
                }

                if (!empty($job->location) && !empty($cand->city)) {
                    $locLower = strtolower($job->location);
                    $cityLower = strtolower($cand->city);
                    $areaLower = strtolower((string) $cand->area);
                    if (str_contains($locLower, $cityLower) || str_contains($cityLower, $locLower) || (!empty($areaLower) && str_contains($locLower, $areaLower))) {
                        $nearbyCandidatesCount++;
                    }
                }
            }

            return [
                'id'                        => $job->id,
                'uuid'                      => $job->uuid,
                'title'                     => $job->title,
                'company'                   => $job->companyRelation?->name ?? $job->company ?? 'N/A',
                'company_about'             => $job->company_about ?? '',
                'company_size'              => $job->company_size ?? '',
                'company_address'           => $job->company_address ?? '',
                'location'                  => $job->location ?? 'Remote',
                'latitude'                  => $job->latitude,
                'longitude'                 => $job->longitude,
                'salary'                    => $salary,
                'min_salary'                => $job->min_salary,
                'max_salary'                => $job->max_salary,
                'salary_type'               => $salaryType,
                'bonus_offered'             => $job->bonus_offered ?? 'no',
                'shift_timing'              => $job->shift_timing,
                'working_days'              => $job->working_days,
                'interview_details'         => $job->interview_details,
                'status'                    => $job->status ?? 'pending',
                'work_mode'                 => $job->job_type,
                'type'                      => $job->job_type ?? 'Full Time',
                'exp'                       => $job->experience ?? 'Any',
                'experience'                => $job->experience ?? 'Any',
                'min_experience'            => $job->min_experience,
                'max_experience'            => $job->max_experience,
                'min_age'                   => $job->min_age,
                'max_age'                   => $job->max_age,
                'openings'                  => $job->openings ?? 1,
                'applicants'                => max((int) ($job->applications_count ?? 0), (int) ($job->applicants ?? 0)),
                'is_hot'                    => $job->badge === 'hot' || $job->badge === 'featured',
                'is_deleted'                => (bool) $job->is_deleted,
                'is_expired'                => (bool) ($job->is_deleted || ($job->last_date && \Carbon\Carbon::parse($job->last_date)->endOfDay()->isPast())),
                'deadline'                  => $job->last_date ? $job->last_date->format('d M Y') : null,
                'last_date'                 => $job->last_date ? $job->last_date->format('d M Y') : null,
                'posted_at'                 => $job->created_at ? $job->created_at->format('d M Y') : 'Recent',
                'posted_by'                 => $job->creator?->name ?? 'System',
                'category'                  => $job->category?->name ?? 'General',
                'desc'                      => $job->description ?? '',
                'description'               => $job->description ?? '',
                'remark'                    => $job->rejection_reason,
                'skills'                    => is_array($job->skills) ? $job->skills : (json_decode($job->skills, true) ?: []),
                'languages'                 => is_array($job->languages) ? $job->languages : (json_decode($job->languages, true) ?: []),
                'responsibilities'          => is_array($job->key_responsibilities) ? $job->key_responsibilities : [],
                'requirements'              => is_array($job->qualifications) ? $job->qualifications : (json_decode($job->qualifications, true) ?: []),
                'qualifications'            => is_array($job->qualifications) ? $job->qualifications : (json_decode($job->qualifications, true) ?: []),
                'benefits'                  => is_array($job->perks) ? $job->perks : [],
                'assets'                    => is_array($job->assets) ? $job->assets : (json_decode($job->assets, true) ?: []),
                'certifications'            => is_array($job->certifications) ? $job->certifications : (json_decode($job->certifications, true) ?: []),
                'preferred_industries'      => is_array($job->preferred_industries) ? $job->preferred_industries : (json_decode($job->preferred_industries, true) ?: []),
                'contact_person'            => $job->contact_person,
                'contact_phone'             => $job->contact_phone,
                'contact_email'             => $job->contact_email,
                'assigned_team_member_uuid' => $job->assignedMember ? (string) ($job->assignedMember->uuid ?? $job->assignedMember->id) : null,
                'assigned_team_member_id'   => $job->assigned_to,
                'assigned_team_member_name' => $job->assignedMember?->name,
                'nearby_candidates_count'   => $nearbyCandidatesCount,
            ];
        });

        $teamMembers = $this->getAssignableTeamMembers($user);

        return Inertia::render('Admin/Jobs', [
            'jobs'        => $jobs,
            'teamMembers' => $teamMembers,
            'canViewAll'  => $canViewAll,
            'scope'       => $scope,
        ]);
    }

    public function create()
    {
        $user = auth('admin')->user();

        $categories = Category::with('subcategories')
            ->where('status', 'active')
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'icon'          => $c->icon ?? '📁',
                'subcategories' => $c->subcategories->map(fn($s) => ['id' => $s->id, 'name' => $s->name])
            ]);

        $companies = Company::where('status', 'active')->select('uuid', 'name', 'location')->get();

        $skills = Skill::where('status', 1)->select('id', 'name')->get()->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'demand' => 'high'
        ]);

        $teamMembers = $this->getAssignableTeamMembers($user)->map(fn($m) => [
            'id' => $m->id,
            'uuid' => $m->uuid,
            'name' => $m->name,
            'email' => $m->email,
            'phone' => $m->phone,
            'role' => $m->role,
            'activeTask' => str_replace('_', ' ', ucwords($m->role, '_'))
        ]);

        return Inertia::render('Admin/CreateJob', [
            'categories'  => $categories,
            'companies'   => $companies,
            'skills'      => $skills,
            'teamMembers' => $teamMembers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'company_uuid' => 'required|exists:companies,uuid',
            'location'     => 'required|string|max:255',
            'desc'         => 'required|string',
            'salaryMin'    => 'required|numeric|min:0',
            'salaryMax'    => 'required|numeric|min:0|gte:salaryMin',
            'openings'     => 'nullable|integer|min:1',
        ]);

        $user = auth('admin')->user();
        $company = Company::where('uuid', $validated['company_uuid'])->first();

        // Assignee permission check
        $assignedTo = null;
        $requestedAssignee = $request->input('assignedToId') ?: ($request->input('assigned_to') ?: null);
        if (!empty($requestedAssignee)) {
            if ($user->isTeamMember()) {
                $assignedTo = null;
            } else {
                $targetMember = Admin::where(function ($q) use ($requestedAssignee) {
                    $q->where('id', $requestedAssignee)->orWhere('uuid', $requestedAssignee);
                })->where('status', 1)->first();
                $assignedTo = $targetMember?->id;
            }
        }

        // Process skills, allowing manually typed custom skills
        $rawSkills = $request->input('skills', []);
        $skills = [];
        if (is_array($rawSkills)) {
            foreach ($rawSkills as $sk) {
                $trimmed = trim((string) $sk);
                if ($trimmed !== '') {
                    $skills[] = $trimmed;
                    // Persist newly added custom skill to skills table
                    Skill::firstOrCreate(['name' => $trimmed], ['status' => 1]);
                }
            }
            $skills = array_values(array_unique($skills));
        }

        $job = JobPost::create([
            'title'                => $validated['title'],
            'company_uuid'         => $company->uuid,
            'company_id'           => $company->id ?? null,
            'company'              => $company->name,
            'company_about'        => $company->description ?? null,
            'company_size'         => $company->company_size ?? '1 - 10 employees',
            'company_address'      => $request->input('companyAddress', $validated['location']),
            'location'             => $validated['location'],
            'category_id'          => $request->input('categoryId') ?: null,
            'sub_category_id'      => $request->input('subCategoryId') ?: null,
            'description'          => $validated['desc'],
            'min_salary'           => max(0, (float) $validated['salaryMin']),
            'max_salary'           => max(0, (float) $validated['salaryMax']),
            'job_type'             => $request->input('type', 'Full Time'),
            'salary_type'          => $request->input('salaryType', 'monthly'),
            'bonus_offered'        => $request->input('bonusOffered', 'no'),
            'working_days'         => $request->input('workingDays', 'Mon - Sat'),
            'shift_timing'         => $request->input('shiftTiming', '9:30 AM - 6:30 PM'),
            'interview_details'    => $request->input('interviewDetails', ''),
            'experience'           => $request->input('exp', 'Any'),
            'min_experience'       => $request->filled('minExp') ? (float) $request->input('minExp') : null,
            'max_experience'       => $request->filled('maxExp') ? (float) $request->input('maxExp') : null,
            'min_age'              => $request->input('minAge') ? max(0, (int) $request->input('minAge')) : null,
            'max_age'              => $request->input('maxAge') ? max(0, (int) $request->input('maxAge')) : null,
            'openings'             => max(1, (int) ($validated['openings'] ?? $request->input('openings', 1))),
            'last_date'            => $request->input('lastDate') ?: null,
            'badge'                => $request->input('isHot') ? 'hot' : 'standard',
            'skills'               => $skills,
            'languages'            => $request->input('languages', []),
            'qualifications'       => $request->input('qualifications', []),
            'assets'               => $request->input('assets', []),
            'certifications'       => $request->input('certifications', []),
            'preferred_industries' => $request->input('preferredIndustry', []),
            'contact_person'       => $request->input('contactPersonName'),
            'contact_phone'        => $request->input('contactPhone'),
            'contact_email'        => $request->input('contactEmail'),
            'assigned_to'          => $assignedTo,
            'status'               => $request->input('is_draft') ? 'deactivated' : 'pending',
            'created_by'           => auth('admin')->id(),
        ]);

        // Send Email & Notifications to Super Admin, Creator Admin, Assigned Member, and Matching Candidates
        try {
            MailService::sendNewJobCreated($job);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending new job created email/notifications: ' . $e->getMessage());
        }

        return redirect()->route('admin.jobs.index')->with('success', 'Job post successfully created.');
    }

    public function updateStatus(Request $request, $uuid)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'remark' => 'nullable|string|max:1000',
        ]);

        $user = auth('admin')->user();
        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        // Assigned member has auto rights to update status, as does Super Admin or authorized staff
        $canModerate = $user->isSuperAdmin()
            || ($job->assigned_to && $job->assigned_to == $user->id)
            || in_array('approve_jobs', $user->permissionList(), true)
            || in_array('reject_jobs', $user->permissionList(), true)
            || in_array('hold_jobs', $user->permissionList(), true)
            || in_array('deactivate_jobs', $user->permissionList(), true);

        if (! $canModerate) {
            abort(403, 'Unauthorized: You do not have permission to moderate this job.');
        }

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'rejected' || $validated['status'] === 'hold') {
            $updateData['rejection_reason'] = $validated['remark'] ?? $job->rejection_reason;
        } elseif ($validated['status'] === 'approved' || $validated['status'] === 'active') {
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = auth('admin')->id();

            // Trigger push notifications to matching candidates in the same city
            try {
                if (!empty($job->location)) {
                    $candidates = User::whereNotNull('city')
                        ->where('city', 'LIKE', '%' . $job->location . '%')
                        ->take(25)
                        ->get();

                    foreach ($candidates as $cand) {
                        PushNotificationService::notifyJobMatch($cand, $job);
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Failed sending job match push notifications: ' . $e->getMessage());
            }
        }

        $oldStatus = $job->status;
        $job->update($updateData);

        // Notify Super Admin, Creator, and Assignee regarding status change
        try {
            MailService::sendJobStatusUpdated($job, $oldStatus, $validated['status'], $validated['remark'] ?? null);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending job status update email/notifications: ' . $e->getMessage());
        }

        // Audit Trail Log
        AuditLogService::log(
            'job_status_updated',
            "Job '{$job->title}' status changed from {$oldStatus} to {$validated['status']}",
            ['old_status' => $oldStatus, 'new_status' => $validated['status'], 'remark' => $validated['remark'] ?? null],
            'jobs',
            $job
        );

        return redirect()->back()->with('success', "Job status changed to {$validated['status']}.");
    }

    public function assignTeam(Request $request, $uuid)
    {
        $user = auth('admin')->user();
        if ($user->isTeamMember()) {
            abort(403, 'Team members are not allowed to assign posts.');
        }

        $validated = $request->validate([
            'team_member_uuid' => 'nullable',
        ]);

        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        $adminId = null;
        if (!empty($validated['team_member_uuid'])) {
            $admin = Admin::where('uuid', $validated['team_member_uuid'])
                ->orWhere('id', $validated['team_member_uuid'])
                ->first();

            if ($user->isAdmin() && $admin) {
                if ($admin->created_by !== $user->id || $admin->role !== 'team_member') {
                    abort(403, 'You can only assign to your own team members.');
                }
            }
            $adminId = $admin?->id;
        }

        $job->update(['assigned_to' => $adminId]);

        if ($adminId) {
            try {
                MailService::notifyAdmin($adminId, "Job Assigned: {$job->title}", "You have been assigned to manage '{$job->title}'.", ['job_id' => $job->id]);
                MailService::notifySuperAdmin("Job Assigned to Team Member", "Job '{$job->title}' assigned to team member ID {$adminId}.", ['job_id' => $job->id]);
            } catch (\Throwable $e) {}
        }

        return redirect()->back()->with('success', $adminId ? 'Team member assigned successfully.' : 'Assignment removed.');
    }

    /**
     * Get nearby candidates within radius (default 15 KM) of a job post
     */
    public function nearbyCandidates(Request $request, $uuid)
    {
        $job = JobPost::where('uuid', $uuid)->orWhere('id', $uuid)->firstOrFail();

        $jobLat = $job->latitude ? (float) $job->latitude : null;
        $jobLng = $job->longitude ? (float) $job->longitude : null;

        // Auto-geocode job post location if coordinates are not saved
        if ((empty($jobLat) || empty($jobLng)) && !empty($job->location)) {
            try {
                $geocoding = app(\App\Services\GeocodingService::class);
                $addressToGeocode = $job->company_address ?: $job->location;
                $geo = $geocoding->geocode($addressToGeocode);
                if ($geo && !empty($geo['latitude']) && !empty($geo['longitude'])) {
                    $jobLat = (float) $geo['latitude'];
                    $jobLng = (float) $geo['longitude'];
                    $job->update([
                        'latitude'  => $jobLat,
                        'longitude' => $jobLng,
                    ]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Geocoding failed for job {$job->id}: " . $e->getMessage());
            }
        }

        $radiusKm = (float) $request->input('radius', 15);
        $platformFilter = strtolower((string) $request->input('platform', 'all'));

        // Fetch users
        $users = \App\Models\User::select([
            'id', 'uuid', 'full_name', 'username', 'email', 'phone', 'city', 'area',
            'latitude', 'longitude', 'web_latitude', 'web_longitude', 'app_latitude', 'app_longitude',
            'web_last_active', 'app_last_active', 'registered_from', 'skills', 'total_experience_years',
            'job_title', 'is_online', 'created_at'
        ])->get();

        $appliedCandidateUuids = \App\Models\JobApplication::where(function ($q) use ($job) {
                $q->where('job_uuid', $job->uuid)->orWhere('job_id', $job->id);
            })
            ->pluck('candidate_uuid')
            ->filter()
            ->toArray();

        $appliedCandidateIds = \App\Models\JobApplication::where(function ($q) use ($job) {
                $q->where('job_uuid', $job->uuid)->orWhere('job_id', $job->id);
            })
            ->pluck('candidate_id')
            ->filter()
            ->toArray();

        $nearbyCandidates = [];

        foreach ($users as $user) {
            $uLat = $user->latitude ?? $user->web_latitude ?? $user->app_latitude;
            $uLng = $user->longitude ?? $user->web_longitude ?? $user->app_longitude;

            $distance = null;
            $isWithinRadius = false;

            if ($jobLat && $jobLng && $uLat && $uLng) {
                $distance = $this->calculateDistanceKm($jobLat, $jobLng, (float) $uLat, (float) $uLng);
                if ($distance <= $radiusKm) {
                    $isWithinRadius = true;
                }
            } elseif (!empty($job->location) && !empty($user->city)) {
                // If coordinates missing, match by city/area
                $locLower = strtolower($job->location);
                $cityLower = strtolower($user->city);
                $areaLower = strtolower((string) $user->area);

                if (str_contains($locLower, $cityLower) || str_contains($cityLower, $locLower) || (!empty($areaLower) && str_contains($locLower, $areaLower))) {
                    $isWithinRadius = true;
                    $distance = null;
                }
            }

            if ($isWithinRadius) {
                // Determine platform
                $hasWeb = !empty($user->web_last_active) || ($user->registered_from ?? 'web') === 'web';
                $hasApp = !empty($user->app_last_active) || ($user->registered_from ?? null) === 'app';
                if (!empty($user->web_last_active) && !empty($user->app_last_active)) {
                    $candPlatform = 'both';
                } elseif (!empty($user->app_last_active) || ($user->registered_from ?? null) === 'app') {
                    $candPlatform = 'app';
                } else {
                    $candPlatform = 'web';
                }

                if ($platformFilter !== 'all' && $candPlatform !== $platformFilter) {
                    continue;
                }

                $nearbyCandidates[] = [
                    'id'             => $user->id,
                    'uuid'           => $user->uuid,
                    'name'           => $user->full_name ?: ($user->username ?: 'Candidate'),
                    'phone'          => $user->phone ?: '—',
                    'email'          => $user->email ?: '—',
                    'city'           => $user->city ?: '—',
                    'area'           => $user->area ?: '—',
                    'jobTitle'       => $user->job_title ?: 'Candidate',
                    'experience'     => $user->total_experience_years ? "{$user->total_experience_years} Years" : 'Fresher',
                    'skills'         => is_array($user->skills) ? $user->skills : (json_decode($user->skills, true) ?: []),
                    'distance'       => $distance !== null ? round($distance, 1) : null,
                    'distance_text'  => $distance !== null ? round($distance, 1) . ' km away' : 'City Match',
                    'platform'       => $candPlatform,
                    'registeredFrom' => $user->registered_from ?? 'web',
                    'is_applied'     => in_array($user->id, $appliedCandidateIds, true) || in_array($user->uuid, $appliedCandidateUuids, true),
                    'registeredAt'   => $user->created_at ? $user->created_at->format('d M Y') : '—',
                ];
            }
        }

        // Sort by distance (closest first, nulls at end)
        usort($nearbyCandidates, function ($a, $b) {
            if ($a['distance'] === null && $b['distance'] === null) return 0;
            if ($a['distance'] === null) return 1;
            if ($b['distance'] === null) return -1;
            return $a['distance'] <=> $b['distance'];
        });

        return response()->json([
            'success'    => true,
            'job'        => [
                'id'        => $job->id,
                'uuid'      => $job->uuid,
                'title'     => $job->title,
                'company'   => $job->companyRelation?->name ?? $job->company ?? 'N/A',
                'location'  => $job->location,
                'latitude'  => $jobLat,
                'longitude' => $jobLng,
                'radius'    => $radiusKm,
            ],
            'total'      => count($nearbyCandidates),
            'candidates' => $nearbyCandidates,
        ]);
    }

    /**
     * Haversine formula distance calculation in KM
     */
    public static function calculateDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
