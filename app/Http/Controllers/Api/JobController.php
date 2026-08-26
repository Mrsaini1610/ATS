<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\Category;
use App\Models\Company;
use App\Models\SavedJob;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class JobController extends Controller
{
    
    public function getHomeData(Request $request)
{
    $user = $request->user();

    // 1. Fetch Selected Active Resume (fallback to latest)
    $activeResume = $user ? ($user->defaultResume ?? $user->resumes()->latest()->first()) : null;

    // 2. ALL CITIES LOCATIONS (Updated: Fetching all cities from 'cities' table)
    $jobLocations = DB::table('cities')
        ->select('uuid', 'name', 'latitude', 'longitude')
        ->orderBy('name', 'asc')
        ->get();

    // 3. RECOMMENDED JOBS (Weighted Scoring with Active Resume)
    $userSkills  = is_array($user?->skills) ? $user->skills : json_decode($user?->skills ?? '[]', true);
    $userCity    = $user?->city ?? null;
    $userExp     = $user?->total_experience_years ?? null;
    $userAge     = !empty($user?->dob) ? Carbon::parse($user->dob)->age : null;
    $resumeTitle = $activeResume ? strtolower(trim($activeResume->title)) : null;

    // Resume Title / Skill Match (Highest Priority +6)
    $resumeSql = "0";
    if (!empty($resumeTitle)) {
        $escapedTitle = addslashes($resumeTitle);
        $resumeSql = "CASE WHEN LOWER(title) LIKE '%{$escapedTitle}%' OR LOWER(skills) LIKE '%{$escapedTitle}%' THEN 6 ELSE 0 END";
    }

    $skillSql = "0";
    if (!empty($userSkills) && is_array($userSkills)) {
        $skillCases = [];
        foreach ($userSkills as $skill) {
            $escapedSkill = addslashes(strtolower($skill));
            $skillCases[] = "CASE WHEN LOWER(skills) LIKE '%{$escapedSkill}%' THEN 3 ELSE 0 END";
        }
        if (!empty($skillCases)) {
            $skillSql = "(" . implode(" + ", $skillCases) . ")";
        }
    }

    $locationSql = "0";
    if (!empty($userCity)) {
        $escapedCity = addslashes(strtolower($userCity));
        $locationSql = "CASE WHEN LOWER(location) LIKE '%{$escapedCity}%' THEN 5 ELSE 0 END";
    }

    $expSql = "0";
    if (!empty($userExp)) {
        $escapedExp = addslashes((string)$userExp);
        $expSql = "CASE WHEN experience LIKE '%{$escapedExp}%' THEN 2 ELSE 0 END";
    }

    $ageSql = "0";
    if (!is_null($userAge)) {
        $ageSql = "CASE WHEN (min_age IS NULL OR min_age <= {$userAge}) AND (max_age IS NULL OR max_age >= {$userAge}) THEN 2 ELSE 0 END";
    }

    $recommendedJobs = JobPost::with(['company', 'category'])
        ->where('status', 'active')
        ->select('*')
        ->selectRaw("({$resumeSql} + {$skillSql} + {$locationSql} + {$expSql} + {$ageSql}) as match_score")
        ->orderByDesc('match_score')
        ->orderByDesc('id')
        ->get();

    // 4. CATEGORIES WITH JOB COUNT
    $categories = Category::where('status', 'active')
        ->withCount(['jobPosts' => function ($query) {
            $query->where('status', 'active');
        }])
        ->orderBy('job_posts_count', 'desc')
        ->get();

    // 5. TOP COMPANIES
    $topCompanies = Company::withCount(['jobPosts' => function ($query) {
            $query->where('status', 'active');
        }])
        ->having('job_posts_count', '>', 0)
        ->orderBy('job_posts_count', 'desc')
        ->take(10)
        ->get();

    // 6. TRENDING SKILLS
    $trendingSkills = JobPost::where('status', 'active')
        ->whereNotNull('skills')
        ->get()
        ->pluck('skills')
        ->flatten()
        ->filter()
        ->countBy()
        ->sortDesc()
        ->take(10)
        ->keys()
        ->values();

    return response()->json([
        'status'        => true,
        'message'       => 'Home data fetched successfully',
        'active_resume' => $activeResume,
        'data'          => [
            'locations'        => $jobLocations,
            'recommended_jobs' => $recommendedJobs,
            'categories'       => $categories,
            'top_companies'    => $topCompanies,
            'trending_skills'  => $trendingSkills
        ],
    ], 200);
}

    /**
     * Search & Filter Jobs (Supports both Sectioned View and Paginated View)
     */
    public function filterJobs(Request $request)
    {
        $user = $request->user();

        // 1. Capture Inputs
        $search       = $request->input('search');
        $location     = $request->input('location');
        $categoryUuid = $request->input('category_uuid');
        $jobType      = $request->input('job_type');
        $experience   = $request->input('experience');
        $salary       = $request->input('salary');

        // 2. Base Query Setup
        $query = JobPost::with([
            'company:id,uuid,name,logo,location',
            'category:id,uuid,name'
        ])->where('status', 'active');

        // 3. Keyword Search (Title, Skills, Description, Company)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('skills', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('company', function ($comp) use ($search) {
                      $comp->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // 4. Location Filter
        if ($request->filled('location')) {
            $query->where('location', 'LIKE', "%{$location}%");
        }

        // 5. Category Filter
        if ($request->filled('category_uuid')) {
            $query->whereHas('category', function ($q) use ($categoryUuid) {
                $q->where('uuid', $categoryUuid);
            });
        }

        // 6. Job Type Filter
        if ($request->filled('job_type')) {
            $query->where('job_type', $jobType);
        }

        // 7. Experience Filter
        if ($request->filled('experience')) {
            $expInput = trim($request->input('experience'));

            if (strpos($expInput, '-') !== false) {
                $parts = explode('-', $expInput);
                $reqMinExp = (float) preg_replace('/[^0-9.]/', '', $parts[0] ?? 0);
                $reqMaxExp = (float) preg_replace('/[^0-9.]/', '', $parts[1] ?? 0);

                $query->where(function ($q) use ($reqMinExp, $reqMaxExp) {
                    $q->whereRaw("CAST(SUBSTRING_INDEX(experience, '-', 1) AS DECIMAL(10,2)) <= ?", [$reqMaxExp])
                      ->whereRaw("CAST(SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(experience, '-', -1)), ' ', 1) AS DECIMAL(10,2)) >= ?", [$reqMinExp]);
                });
            } else {
                $valExp = (float) preg_replace('/[^0-9.]/', '', $expInput);
                if ($valExp >= 0) {
                    $query->where(function ($q) use ($valExp) {
                        $q->whereRaw("CAST(SUBSTRING_INDEX(experience, '-', 1) AS DECIMAL(10,2)) <= ?", [$valExp])
                          ->whereRaw("CAST(SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(experience, '-', -1)), ' ', 1) AS DECIMAL(10,2)) >= ?", [$valExp]);
                    });
                }
            }
        }

        // 8. Salary Range Match
        if ($request->filled('salary')) {
            $salaryInput = trim($request->input('salary'));

            if (strpos($salaryInput, '-') !== false) {
                $parts = explode('-', $salaryInput);
                $reqMin = (float) preg_replace('/[^0-9.]/', '', $parts[0] ?? 0);
                $reqMax = (float) preg_replace('/[^0-9.]/', '', $parts[1] ?? 0);

                $query->where(function ($q) use ($reqMin, $reqMax) {
                    if ($reqMin > 0) {
                        $q->whereRaw("CAST(min_lpa AS DECIMAL(10,2)) >= ?", [$reqMin]);
                    }
                    if ($reqMax > 0) {
                        $q->whereRaw("CAST(max_lpa AS DECIMAL(10,2)) <= ?", [$reqMax]);
                    }
                });
            } else {
                $val = (float) preg_replace('/[^0-9.]/', '', $salaryInput);
                if ($val > 0) {
                    $query->where(function ($q) use ($val) {
                        $q->whereRaw("CAST(min_lpa AS DECIMAL(10,2)) <= ?", [$val])
                          ->whereRaw("CAST(max_lpa AS DECIMAL(10,2)) >= ?", [$val]);
                    });
                }
            }
        }

        // 9. Fetch Saved & Applied Status for Current User
        $savedJobUuids = [];
        $userApplications = collect();

        if ($user) {
            $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
                ->pluck('job_uuid')
                ->toArray();

            $userApplications = JobApplication::where('candidate_id', $user->id)
                ->latest()
                ->get()
                ->groupBy('job_id');
        }

        // 10. Fetch Results
        $jobs = $query->latest()->get()->map(function ($job) use ($userApplications, $savedJobUuids) {
            $applications = $userApplications->get($job->id);
            $latestApplication = $applications ? $applications->first() : null;

            $canApply = true;
            $reapplyAt = null;
            $status = null;

            if ($latestApplication) {
                $status = strtolower($latestApplication->status);

                switch ($status) {
                    case 'pending':
                    case 'applied':
                    case 'selected':
                    case 'cancelled':
                        $canApply = false;
                        break;

                    case 'rejected':
                        $reapplyAt = Carbon::parse($latestApplication->updated_at)->addDays(60);
                        $canApply  = now()->gte($reapplyAt);
                        break;
                }
            }

            $jobArray = $job->toArray();
            $jobArray['has_applied']        = !is_null($latestApplication);
            $jobArray['is_saved']          = in_array($job->uuid, $savedJobUuids);
            $jobArray['can_apply']         = $canApply;
            $jobArray['application_status'] = $status;
            $jobArray['reapply_at']         = $reapplyAt?->toISOString();

            return $jobArray;
        });

        // 11. Final Response
        return response()->json([
            'status'     => true,
            'message'    => 'Jobs searched successfully',
            'total_jobs' => $jobs->count(),
            'data'       => $jobs
        ], 200);
    }

    /**
     * Get Jobs List (Matched against Active Default Resume & User Profile)
     */
    public function getJobs(Request $request)
    {
        $user = $request->user();
        $tab  = $request->query('tab', 'recommended');

        $query = JobPost::with(['company', 'category'])->where('status', 'active');

        if ($user) {
            $activeResume = $user->defaultResume ?? $user->resumes()->latest()->first();
            $userSkills   = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
            $userCity     = $user->city;
            $resumeTitle  = $activeResume?->title;

            if (!empty($userSkills) || !empty($userCity) || !empty($resumeTitle)) {
                $query->where(function ($q) use ($userSkills, $userCity, $resumeTitle) {
                    if (!empty($resumeTitle)) {
                        $q->orWhere('title', 'LIKE', '%' . $resumeTitle . '%')
                          ->orWhere('skills', 'LIKE', '%' . $resumeTitle . '%');
                    }
                    if (!empty($userSkills)) {
                        foreach ($userSkills as $skill) {
                            $q->orWhereJsonContains('skills', $skill)
                              ->orWhere('skills', 'LIKE', '%' . $skill . '%')
                              ->orWhere('title', 'LIKE', '%' . $skill . '%');
                        }
                    }
                    if (!empty($userCity)) {
                        $q->orWhere('location', 'LIKE', '%' . $userCity . '%');
                    }
                });
            }
        }

        $savedJobUuids = [];
        $userApplications = collect();

        if ($user) {
            $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
                ->pluck('job_uuid')
                ->toArray();

            $userApplications = JobApplication::where('candidate_id', $user->id)
                ->latest()
                ->get()
                ->groupBy('job_id');
        }

        $jobs = $query->latest()->get()->map(function ($job) use ($userApplications, $savedJobUuids) {
            $applications = $userApplications->get($job->id);
            $latestApplication = $applications ? $applications->first() : null;

            $canApply = true;
            $reapplyAt = null;
            $status = null;

            if ($latestApplication) {
                $status = strtolower($latestApplication->status);

                switch ($status) {
                    case 'pending':
                    case 'applied':
                    case 'selected':
                    case 'cancelled':
                        $canApply = false;
                        break;

                    case 'rejected':
                        $reapplyAt = Carbon::parse($latestApplication->updated_at)->addDays(60);
                        $canApply  = now()->gte($reapplyAt);
                        break;
                }
            }

            $jobArray = $job->toArray();
            $jobArray['has_applied']        = !is_null($latestApplication);
            $jobArray['is_saved']          = in_array($job->uuid, $savedJobUuids);
            $jobArray['can_apply']         = $canApply;
            $jobArray['application_status'] = $status;
            $jobArray['reapply_at']         = $reapplyAt?->toISOString();

            return $jobArray;
        });

        $metaFilters = [
            'categories'  => Category::whereIn('id', function ($q) {
                $q->select('category_id')
                  ->from('job_posts')
                  ->where('status', 'active')
                  ->whereNotNull('category_id');
            })->select('id', 'name', 'uuid')->get(),

            'locations'   => JobPost::where('status', 'active')
                ->whereNotNull('location')
                ->distinct()
                ->pluck('location')
                ->values(),

            'job_types'   => JobPost::where('status', 'active')
                ->whereNotNull('job_type')
                ->distinct()
                ->pluck('job_type')
                ->values(),

            'experiences' => JobPost::where('status', 'active')
                ->whereNotNull('experience')
                ->distinct()
                ->pluck('experience')
                ->values(),
        ];

        return response()->json([
            'status'     => true,
            'message'    => 'Recommended jobs fetched successfully',
            'active_tab' => $tab,
            'filters'    => $metaFilters,
            'data'       => $jobs
        ], 200);
    }

    /**
     * Get Single Job Detail by UUID
     */
    public function getJobDetail(Request $request, $uuid)
    {
        $user = $request->user();

        $job = JobPost::with(['company', 'category', 'subCategory'])
            ->where('uuid', $uuid)
            ->first();

        if (!$job) {
            return response()->json([
                'status'  => false,
                'message' => 'Job not found.'
            ], 404);
        }

        $application = JobApplication::where('candidate_id', $user->id)
            ->where('job_id', $job->id)
            ->first();

        $isSaved = SavedJob::where('user_uuid', $user->uuid)
            ->where('job_uuid', $job->uuid)
            ->exists();

        $job->has_applied         = !is_null($application);
        $job->is_saved            = $isSaved;
        $job->application_details = $application;

        return response()->json([
            'status'  => true,
            'message' => 'Job detail fetched successfully',
            'data'    => $job
        ], 200);
    }

    /**
     * Apply for a Job (Direct resume_url or active default resume fallback)
     */
    public function applyJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_uuid'       => 'required|exists:job_posts,uuid',
            'candidate_uuid' => 'nullable|exists:users,uuid',
            'resume_url'     => 'nullable|string',
            'cover_letter'   => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user() ?? User::where('uuid', $request->candidate_uuid)->first();
        $job  = JobPost::where('uuid', $request->job_uuid)->first();

        if (!$user || !$job) {
            return response()->json([
                'status'  => false,
                'message' => 'User or Job not found.'
            ], 404);
        }

        // Resume URL pick: passed in body OR fallback to user's active/default resume
        $resumeUrl = $request->resume_url;
        if (empty($resumeUrl)) {
            $defaultResume = $user->defaultResume ?? $user->resumes()->latest()->first();
            $resumeUrl = $defaultResume?->file_path;
        }

        if (empty($resumeUrl)) {
            return response()->json([
                'status'  => false,
                'message' => 'Please provide a resume or set an active default resume first.'
            ], 400);
        }

        // Duplicate Application Check
        $alreadyApplied = JobApplication::where('candidate_id', $user->id)
            ->where('job_id', $job->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'status'  => false,
                'message' => 'You have already applied for this job.'
            ], 400);
        }

        try {
            $application = JobApplication::create([
                'candidate_id'         => $user->id,
                'job_id'               => $job->id,
                'resume_url'           => $resumeUrl,
                'cover_letter'         => $request->cover_letter,
                'candidate_name'       => $user->full_name ?? $user->username,
                'candidate_email'      => $user->email,
                'candidate_phone'      => $user->phone,
                'candidate_skills'     => $user->skills,
                'candidate_experience' => $user->total_experience_years,
                'status'               => 'applied'
            ]);

            $job->increment('applicants');

            $responseData = $application->toArray();
            $responseData['candidate_uuid'] = $user->uuid;
            $responseData['job_uuid']       = $job->uuid;

            unset($responseData['candidate_id'], $responseData['job_id']);

            return response()->json([
                'status'      => true,
                'message'     => 'Application submitted successfully',
                'application' => $responseData
            ], 201);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save ya Unsave Job (Toggle)
     */
    public function toggleSaveJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_uuid' => 'required|string|exists:job_posts,uuid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $jobUuid = $request->job_uuid;

        $savedJob = SavedJob::where('user_uuid', $user->uuid)
            ->where('job_uuid', $jobUuid)
            ->first();

        if ($savedJob) {
            $savedJob->delete();

            return response()->json([
                'status'   => true,
                'is_saved' => false,
                'message'  => 'Job removed from saved list successfully.'
            ], 200);
        }

        SavedJob::create([
            'user_uuid' => $user->uuid,
            'job_uuid'  => $jobUuid,
        ]);

        return response()->json([
            'status'   => true,
            'is_saved' => true,
            'message'  => 'Job saved successfully.'
        ], 201);
    }

    /**
     * Saved Jobs ki list fetch karna
     */
    public function getSavedJobs(Request $request)
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);

        $savedJobs = SavedJob::where('user_uuid', $user->uuid)
            ->latest()
            ->paginate($perPage);

        $jobUuids = $savedJobs->pluck('job_uuid')->toArray();
        $jobPosts = JobPost::with(['company:id,uuid,name,logo,location', 'category:id,uuid,name'])
            ->whereIn('uuid', $jobUuids)
            ->get()
            ->keyBy('uuid');

        $appliedJobIds = JobApplication::where('candidate_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        $savedJobs->getCollection()->transform(function ($saved) use ($jobPosts, $appliedJobIds) {
            $job = $jobPosts->get($saved->job_uuid);
            if ($job) {
                $job->has_applied = in_array($job->id, $appliedJobIds);
                $job->is_saved    = true;
            }
            $saved->job = $job;
            return $saved;
        });

        return response()->json([
            'status'  => true,
            'message' => 'Saved jobs retrieved successfully.',
            'data'    => $savedJobs
        ], 200);
    }

    /**
     * Get All Applied Jobs with summary counts and categorized list (Using UUIDs)
     */
    public function getAppliedJobs(Request $request)
    {
        $user = $request->user();
        $tab = strtolower($request->input('tab', 'all'));

        $baseQuery = JobApplication::with([
            'candidate:id,uuid',
            'jobPost' => function ($q) {
                $q->with([
                    'company:id,uuid,name,logo,location',
                    'category:id,uuid,name'
                ]);
            }
        ])->where('candidate_id', $user->id);

        $allApplications = (clone $baseQuery)->latest()->get();

        $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
            ->pluck('job_uuid')
            ->toArray();

        $counts = [
            'total_applied' => $allApplications->count(),
            'under_review'  => $allApplications->whereIn('status', ['applied', 'pending', 'under_review'])->count(),
            'shortlisted'   => $allApplications->whereIn('status', ['shortlisted', 'interview'])->count(),
            'selected'      => $allApplications->where('status', 'selected')->count(),
            'rejected'      => $allApplications->where('status', 'rejected')->count(),
        ];

        $formattedApplications = $allApplications->map(function ($app) use ($user, $savedJobUuids) {
            $job = $app->jobPost;
            $reapplyAt = null;
            $canApply = false;

            if (strtolower($app->status) === 'rejected') {
                $reapplyAt = Carbon::parse($app->updated_at)->addDays(60);
                $canApply = now()->gte($reapplyAt);
            }

            $candidateUuid = $app->candidate?->uuid ?? $user->uuid;
            $jobUuid = $job?->uuid ?? null;

            $appData = $app->toArray();
            $appData['candidate_uuid'] = $candidateUuid;
            $appData['job_uuid']       = $jobUuid;

            unset(
                $appData['id'],
                $appData['candidate_id'],
                $appData['job_id'],
                $appData['candidate'],
                $appData['job_post']
            );

            if ($job) {
                $jobData = $job->toArray();
                $jobData['is_saved']           = in_array($job->uuid, $savedJobUuids);
                $jobData['has_applied']        = true;
                $jobData['application_status'] = $app->status;
                $jobData['reapply_at']         = $reapplyAt?->toISOString();
                $jobData['can_apply']          = $canApply;

                unset(
                    $jobData['id'],
                    $jobData['company_id'],
                    $jobData['category_id'],
                    $jobData['sub_category_id']
                );

                if (isset($jobData['company']['id'])) {
                    unset($jobData['company']['id']);
                }

                if (isset($jobData['category']['id'])) {
                    unset($jobData['category']['id']);
                }

                $appData['job_details'] = $jobData;
            } else {
                $appData['job_details'] = null;
            }

            return $appData;
        });

        if ($tab !== 'all') {
            $filteredData = $formattedApplications->filter(function ($item) use ($tab) {
                $status = strtolower($item['status'] ?? '');
                if ($tab === 'under_review') return in_array($status, ['applied', 'pending', 'under_review']);
                if ($tab === 'shortlisted')  return in_array($status, ['shortlisted', 'interview']);
                if ($tab === 'selected')     return $status === 'selected';
                if ($tab === 'rejected')     return $status === 'rejected';
                return true;
            })->values();

            return response()->json([
                'status'     => true,
                'message'    => 'Applied jobs fetched successfully',
                'active_tab' => $tab,
                'counts'     => $counts,
                'data'       => $filteredData,
            ], 200);
        }

        $categorized = [
            'all'          => $formattedApplications->values(),
            'under_review' => $formattedApplications->whereIn('status', ['applied', 'pending', 'under_review'])->values(),
            'shortlisted'  => $formattedApplications->whereIn('status', ['shortlisted', 'interview'])->values(),
            'selected'     => $formattedApplications->where('status', 'selected')->values(),
            'rejected'     => $formattedApplications->where('status', 'rejected')->values(),
        ];

        return response()->json([
            'status'     => true,
            'message'    => 'Applied jobs fetched successfully',
            'active_tab' => $tab,
            'counts'     => $counts,
            'data'       => $categorized,
        ], 200);
    }
}
