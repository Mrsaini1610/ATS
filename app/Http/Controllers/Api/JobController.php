<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\UserResume;
use App\Models\Category;
use App\Models\Company;
use App\Models\Subcategory;
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

    // 2. RECOMMENDED JOBS
    $userSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
    $userCity = $user->city ?? null;
    $userExp = $user->total_experience_years ?? null;
    $userAge = !empty($user->dob) ? \Carbon\Carbon::parse($user->dob)->age : null;

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
        ->take(6)
        ->get();

    // 3. CATEGORIES ONLY
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
     * Get Jobs List with Filtering & Pagination
     */
    public function getJobs(Request $request)
    {
        $user = $request->user();
        $tab = $request->query('tab', 'recommended');
        $categoryId = $request->query('category_id');
        $search = $request->query('search');

        $query = JobPost::query()->where('status', 'active');

        // 1. Tab-wise filtering
        if ($tab === 'recommended') {
            $userSkills = $user->skills ?? [];
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
        } elseif ($tab === 'category') {
            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }
        }

        // 2. Search Query (Optional)
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('company', 'LIKE', "%{$search}%")
                  ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        // 3. User applied jobs tracking
        $appliedJobIds = JobApplication::where('candidate_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        $jobs = $query->orderBy('id', 'desc')->paginate(10);

        $jobs->getCollection()->transform(function ($job) use ($appliedJobIds) {
            $job->has_applied = in_array($job->id, $appliedJobIds);
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
     * Get Single Job Detail
     */
    public function getJobDetail(Request $request, $id)
    {
        $user = $request->user();
        $job = JobPost::where('id', $id)->first();

        if (!$job) {
            return response()->json([
                'status'  => false,
                'message' => 'Job not found.'
            ], 404);
        }

        // Check if current user already applied
        $application = JobApplication::where('candidate_id', $user->id)
            ->where('job_id', $job->id)
            ->first();

        $job->has_applied = !is_null($application);
        $job->application_details = $application;

        return response()->json([
            'status'  => true,
            'message' => 'Job detail fetched successfully',
            'data'    => $job
        ], 200);
    }

    /**
     * Apply for a Job
     */
    public function applyJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id'       => 'required|exists:job_posts,id',
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

        // 1. Verify Resume ownership (Uses User relationship linked with user_uuid)
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
            ->where('job_id', $request->job_id)
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
                'job_id'               => $request->job_id,
                'resume_url'           => $resume->file_path,
                'cover_letter'         => $request->cover_letter,
                'candidate_name'       => $user->full_name ?? $user->username,
                'candidate_email'      => $user->email,
                'candidate_phone'      => $user->phone,
                'candidate_skills'     => $user->skills,
                'candidate_experience' => $user->total_experience_years,
                'status'               => 'applied'
            ]);

            // Increment applicants counter on job post
            JobPost::where('id', $request->job_id)->increment('applicants');

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
}
