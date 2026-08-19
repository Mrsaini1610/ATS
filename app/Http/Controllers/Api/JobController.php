<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\Category;
use App\Models\Company;
use App\Models\SavedJob;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class JobController extends Controller
{
    /**
     * Get Home Screen Data
     */
    public function getHomeData(Request $request)
    {
        $user = $request->user();

        // 1. UNIQUE LOCATIONS
        $jobLocations = JobPost::where('status', 'active')
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->pluck('location')
            ->values();

        // 2. RECOMMENDED JOBS (Weighted Scoring)
        $userSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
        $userCity   = $user->city ?? null;
        $userExp    = $user->total_experience_years ?? null;
        $userAge    = !empty($user->dob) ? Carbon::parse($user->dob)->age : null;

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
            ->selectRaw("({$skillSql} + {$locationSql} + {$expSql} + {$ageSql}) as match_score")
            ->orderByDesc('match_score')
            ->orderByDesc('id')
            ->get();

        // 3. CATEGORIES WITH JOB COUNT
        $categories = Category::where('status', 'active')
            ->withCount(['jobPosts' => function ($query) {
                $query->where('status', 'active');
            }])
            ->orderBy('job_posts_count', 'desc')
            ->get();

        // 4. TOP COMPANIES
        $topCompanies = Company::withCount(['jobPosts' => function ($query) {
                $query->where('status', 'active');
            }])
            ->having('job_posts_count', '>', 0)
            ->orderBy('job_posts_count', 'desc')
            ->take(10)
            ->get();

        // 5. TRENDING SKILLS
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
            'status'  => true,
            'message' => 'Home data fetched successfully',
            'data'    => [
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

    // Salary Inputs
    $minSalary    = $request->input('min_salary'); // e.g. 10 (10 LPA)
    $maxSalary    = $request->input('max_salary'); // e.g. 15 (15 LPA)
    $salaryType   = $request->input('salary_type'); // optional: yearly, monthly, weekly etc.

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
        $query->where('experience', 'LIKE', "%{$experience}%");
    }

    // 8. Specific Salary Type Filter (Optional)
    if ($request->filled('salary_type')) {
        $query->where('salary_type', $salaryType);
    }

    // 8.1 Normalized Salary SQL Expressions (All types converted to Annual LPA)
    $normalizedMinSql = "CASE
        WHEN salary_type = 'yearly' THEN min_lpa
        WHEN salary_type = 'halfyearly' THEN (min_lpa * 2)
        WHEN salary_type = 'quarterly' THEN (min_lpa * 4)
        WHEN salary_type = 'monthly' THEN (min_lpa * 12)
        WHEN salary_type = 'weekly' THEN (min_lpa * 52)
        ELSE min_lpa END";

    $normalizedMaxSql = "CASE
        WHEN salary_type = 'yearly' THEN max_lpa
        WHEN salary_type = 'halfyearly' THEN (max_lpa * 2)
        WHEN salary_type = 'quarterly' THEN (max_lpa * 4)
        WHEN salary_type = 'monthly' THEN (max_lpa * 12)
        WHEN salary_type = 'weekly' THEN (max_lpa * 52)
        ELSE max_lpa END";

    // Min Check: Job ka min package user ke min budget ke barabar ya bada hona chahiye (Min to Min)
    if ($request->filled('min_salary')) {
        $query->whereRaw("{$normalizedMinSql} >= ?", [(float) $minSalary]);
    }

    // Max Check: Job ka max package user ke max budget ke barabar ya chhota hona chahiye (Max to Max)
    if ($request->filled('max_salary')) {
        $query->whereRaw("{$normalizedMaxSql} <= ?", [(float) $maxSalary]);
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

    // 10. Fetch Results Without Pagination
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
     * Get Jobs List (Tab-wise listing)
     */
    // public function getJobs(Request $request)
    // {
    //     $user = $request->user();
    //     $tab = $request->query('tab', 'recommended');
    //     $categoryUuid = $request->query('category_uuid');
    //     $search = $request->query('search');

    //     $query = JobPost::with(['company', 'category'])->where('status', 'active');

    //     if ($tab === 'recommended') {
    //         $userSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
    //         $userCity = $user->city;

    //         $query->where(function ($q) use ($userSkills, $userCity) {
    //             if (!empty($userSkills)) {
    //                 foreach ($userSkills as $skill) {
    //                     $q->orWhereJsonContains('skills', $skill)
    //                         ->orWhere('skills', 'LIKE', '%' . $skill . '%')
    //                         ->orWhere('title', 'LIKE', '%' . $skill . '%');
    //                 }
    //             }
    //             if (!empty($userCity)) {
    //                 $q->orWhere('location', 'LIKE', '%' . $userCity . '%');
    //             }
    //         });
    //     } elseif ($tab === 'category' && $categoryUuid) {
    //         $query->whereHas('category', function ($q) use ($categoryUuid) {
    //             $q->where('uuid', $categoryUuid);
    //         });
    //     }

    //     if (!empty($search)) {
    //         $query->where(function ($q) use ($search) {
    //             $q->where('title', 'LIKE', "%{$search}%")
    //                 ->orWhere('location', 'LIKE', "%{$search}%")
    //                 ->orWhereHas('company', function ($comp) use ($search) {
    //                     $comp->where('name', 'LIKE', "%{$search}%");
    //                 });
    //         });
    //     }

    //     $appliedJobIds = JobApplication::where('candidate_id', $user->id)
    //         ->pluck('job_id')
    //         ->toArray();

    //     $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
    //         ->pluck('job_uuid')
    //         ->toArray();

    //     $perPage = $request->get('per_page', 10);
    //     $jobs = $query->orderBy('id', 'desc')->paginate($perPage);

    //     $jobs->getCollection()->transform(function ($job) use ($appliedJobIds, $savedJobUuids) {
    //         $job->has_applied = in_array($job->id, $appliedJobIds);
    //         $job->is_saved    = in_array($job->uuid, $savedJobUuids);
    //         return $job;
    //     });

    //     return response()->json([
    //         'status'     => true,
    //         'message'    => 'Jobs fetched successfully',
    //         'active_tab' => $tab,
    //         'data'       => $jobs
    //     ], 200);
    // }


    public function getJobs(Request $request)
    {
        $user = $request->user();
        $tab  = $request->query('tab', 'recommended');

        // 1. Base Query with Relations
        $query = JobPost::with(['company', 'category'])->where('status', 'active');

        // 2. Recommended Jobs Logic
        if ($user) {
            $userSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
            $userCity   = $user->city;

            if (!empty($userSkills) || !empty($userCity)) {
                $query->where(function ($q) use ($userSkills, $userCity) {
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

        // 3. Saved & Applied Jobs Data
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

        // 4. Fetch Jobs Data
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

        // 5. Fetch DB Categories
        $categoriesList = Category::whereIn('id', function ($q) {
            $q->select('category_id')
            ->from('job_posts')
            ->where('status', 'active')
            ->whereNotNull('category_id');
        })->select('id', 'name', 'uuid')->get();

        // // 6. Merge Default Categories ("Recommended Jobs" & "All Jobs")
        // $defaultCategories = collect([
        //     ['id' => 'recommended', 'name' => 'Recommended Jobs', 'uuid' => 'recommended'],
        //     ['id' => 'all',         'name' => 'All Jobs',         'uuid' => 'all'],
        // ]);

        // $categoriesList = $defaultCategories->concat($dbCategories);

        // 7. Filters Metadata for UI
        $metaFilters = [
            'categories'  => $categoriesList,

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

        // 8. Response
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
        $job->is_saved             = $isSaved;
        $job->application_details = $application;

        return response()->json([
            'status'  => true,
            'message' => 'Job detail fetched successfully',
            'data'    => $job
        ], 200);
    }

    /**
     * Apply for a Job (Using UUIDs)
     */
    public function applyJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_uuid'     => 'required|exists:job_posts,uuid',
            'resume_id'    => 'required|exists:user_resumes,id',
            'cover_letter' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $job = JobPost::where('uuid', $request->job_uuid)->first();

        if (!$job) {
            return response()->json([
                'status'  => false,
                'message' => 'Job not found.'
            ], 404);
        }

        // 1. Verify Resume ownership
        $resume = $user->resumes()
            ->where('id', $request->resume_id)
            ->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthorized access to the specified resume or resume not found.'
            ], 403);
        }

        // 2. Duplicate Application Check
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
                'resume_url'           => $resume->file_path,
                'cover_letter'         => $request->cover_letter,
                'candidate_name'       => $user->full_name ?? $user->username,
                'candidate_email'      => $user->email,
                'candidate_phone'      => $user->phone,
                'candidate_skills'     => $user->skills,
                'candidate_experience' => $user->total_experience_years,
                'status'               => 'applied'
            ]);

            // Increment applicants count
            $job->increment('applicants');

            return response()->json([
                'status'      => true,
                'message'     => 'Application submitted successfully',
                'application' => $application
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

        // Fetch related jobs with company and category
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
}
