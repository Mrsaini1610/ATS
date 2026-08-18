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
    public function searchJobs(Request $request)
    {
        $user = $request->user();

        // 1. Capture Filters & View Preference
        $search       = $request->query('search');
        $location     = $request->query('location');
        $categoryUuid = $request->query('category_uuid');
        $companyUuid  = $request->query('company_uuid');
        $jobType      = $request->query('job_type');
        $expMin       = $request->query('exp_min');
        $expMax       = $request->query('exp_max');
        $salaryMin    = $request->query('salary_min');
        $salaryMax    = $request->query('salary_max');

        $viewType     = $request->query('view_type', 'sections');
        $perPage      = $request->filled('per_page') ? (int) $request->query('per_page') : 15;

        // 2. Base Query Setup
        $baseQuery = JobPost::with([
            'company:id,uuid,name,logo,location',
            'category:id,uuid,name'
        ])->where('status', 'active');

        // Keyword Search
        if ($request->filled('search')) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('skills', 'LIKE', "%{$search}%")
                    ->orWhereHas('company', function ($comp) use ($search) {
                        $comp->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        // Location Filter
        if ($request->filled('location')) {
            $baseQuery->where('location', 'LIKE', "%{$location}%");
        }

        // Category Filter
        if ($request->filled('category_uuid')) {
            $baseQuery->whereHas('category', function ($q) use ($categoryUuid) {
                $q->where('uuid', $categoryUuid);
            });
        }

        // Company Filter
        if ($request->filled('company_uuid')) {
            $baseQuery->whereHas('company', function ($q) use ($companyUuid) {
                $q->where('uuid', $companyUuid);
            });
        }

        // Job Type Filter
        if ($request->filled('job_type')) {
            $baseQuery->where('job_type', $jobType);
        }

        // Experience Filter
        if ($request->filled('exp_min') && $request->filled('exp_max')) {
            $baseQuery->where(function ($q) use ($expMin, $expMax) {
                $q->whereBetween('experience', [$expMin, $expMax])
                    ->orWhere('experience', 'LIKE', "%{$expMin}%")
                    ->orWhere('experience', 'LIKE', "%{$expMax}%");
            });
        } elseif ($request->filled('exp_min')) {
            $baseQuery->where('experience', '>=', $expMin);
        } elseif ($request->filled('exp_max')) {
            $baseQuery->where('experience', '<=', $expMax);
        }

        // Salary Filter
        if ($request->filled('salary_min') && $request->filled('salary_max')) {
            $baseQuery->whereBetween('salary', [$salaryMin, $salaryMax]);
        } elseif ($request->filled('salary_min')) {
            $baseQuery->where('salary', '>=', $salaryMin);
        } elseif ($request->filled('salary_max')) {
            $baseQuery->where('salary', '<=', $salaryMax);
        }

        // Applied Jobs & Saved Jobs Array
        $appliedJobIds = [];
        $savedJobUuids = [];
        if ($user) {
            $appliedJobIds = JobApplication::where('candidate_id', $user->id)
                ->pluck('job_id')
                ->toArray();

            $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
                ->pluck('job_uuid')
                ->toArray();
        }

        // =========================================================================
        // CASE A: FLAT PAGINATED VIEW
        // =========================================================================
        if ($viewType === 'flat' || ($request->filled('per_page') && !$request->filled('view_type'))) {
            $jobs = (clone $baseQuery)->orderBy('id', 'desc')->paginate($perPage);

            $jobs->getCollection()->transform(function ($job) use ($appliedJobIds, $savedJobUuids) {
                $job->has_applied = in_array($job->id, $appliedJobIds);
                $job->is_saved    = in_array($job->uuid, $savedJobUuids);
                return $job;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Jobs fetched successfully',
                'data'    => $jobs
            ], 200);
        }

        // =========================================================================
        // CASE B: SECTIONED VIEW (Recommended, All, Categorized)
        // =========================================================================

        // 1. ALL JOBS
        $allJobs = (clone $baseQuery)->orderBy('id', 'desc')->get()->map(function ($job) use ($appliedJobIds, $savedJobUuids) {
            $job->has_applied = in_array($job->id, $appliedJobIds);
            $job->is_saved    = in_array($job->uuid, $savedJobUuids);
            return $job;
        });

        // 2. RECOMMENDED JOBS
        $recommendedJobs = collect();
        if ($user) {
            $userSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
            $userCity   = $user->city ?? null;
            $userExp    = $user->total_experience_years ?? null;

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

            $recommendedJobs = (clone $baseQuery)
                ->select('*')
                ->selectRaw("({$skillSql} + {$locationSql} + {$expSql}) as match_score")
                ->having('match_score', '>', 0)
                ->orderByDesc('match_score')
                ->orderByDesc('id')
                ->take(10)
                ->get()
                ->map(function ($job) use ($appliedJobIds, $savedJobUuids) {
                    $job->has_applied = in_array($job->id, $appliedJobIds);
                    $job->is_saved    = in_array($job->uuid, $savedJobUuids);
                    return $job;
                });
        }

        // 3. CATEGORIZED JOBS
        $categorizedJobs = Category::where('status', 'active')
            ->with(['jobPosts' => function ($q) {
                $q->where('status', 'active')
                    ->with('company:id,uuid,name,logo,location')
                    ->orderBy('id', 'desc');
            }])
            ->whereHas('jobPosts', function ($q) {
                $q->where('status', 'active');
            })
            ->get()
            ->map(function ($category) use ($appliedJobIds, $savedJobUuids) {
                $category->job_posts = $category->jobPosts->map(function ($job) use ($appliedJobIds, $savedJobUuids) {
                    $job->has_applied = in_array($job->id, $appliedJobIds);
                    $job->is_saved    = in_array($job->uuid, $savedJobUuids);
                    return $job;
                });
                unset($category->jobPosts);
                return $category;
            });

        return response()->json([
            'status'  => true,
            'message' => 'Jobs sections fetched successfully',
            'data'    => [
                'recommended_jobs' => $recommendedJobs,
                'all_jobs'         => $allJobs,
                'categorized_jobs' => $categorizedJobs
            ]
        ], 200);
    }

    /**
     * Get Jobs List (Tab-wise listing)
     */
    public function getJobs(Request $request)
    {
        $user = $request->user();
        $tab = $request->query('tab', 'recommended');
        $categoryUuid = $request->query('category_uuid');
        $search = $request->query('search');

        $query = JobPost::with(['company', 'category'])->where('status', 'active');

        if ($tab === 'recommended') {
            $userSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
            $userCity = $user->city;

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
        } elseif ($tab === 'category' && $categoryUuid) {
            $query->whereHas('category', function ($q) use ($categoryUuid) {
                $q->where('uuid', $categoryUuid);
            });
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%")
                    ->orWhereHas('company', function ($comp) use ($search) {
                        $comp->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        $appliedJobIds = JobApplication::where('candidate_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
            ->pluck('job_uuid')
            ->toArray();

        $perPage = $request->get('per_page', 10);
        $jobs = $query->orderBy('id', 'desc')->paginate($perPage);

        $jobs->getCollection()->transform(function ($job) use ($appliedJobIds, $savedJobUuids) {
            $job->has_applied = in_array($job->id, $appliedJobIds);
            $job->is_saved    = in_array($job->uuid, $savedJobUuids);
            return $job;
        });

        return response()->json([
            'status'     => true,
            'message'    => 'Jobs fetched successfully',
            'active_tab' => $tab,
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
