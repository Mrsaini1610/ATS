<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\UserResume;
use App\Models\Category; // <--- Added Category Model Import
use App\Models\Company;  // <--- Added Company Model Import
use App\Models\Subcategory; // <--- Added Subcategory Model Import
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
    
    // User ke Latest Experience se Designation nikalna
    $latestExp = $user->latestExperience;
    $userDesignation = $latestExp ? $latestExp->designation : null;

    // 1. ALL JOBS LOCATIONS
    $jobLocations = JobPost::where('status', 'active')
        ->whereNotNull('location')
        ->distinct()
        ->pluck('location');

    // 2. ADVANCED RECOMMENDED JOBS ALGORITHM
    $recommendedJobs = JobPost::with(['company', 'category', 'subCategory'])
        ->where('status', 'active')
        ->where(function ($q) use ($user, $userDesignation) {
            $userSkills = $user->skills ?? [];
            $userCategory = $user->category_id ?? null;
            $userCity = $user->city ?? null;
            $userExpYears = $user->total_experience_years ?? null;

            // Match Category & Subcategory
            if (!empty($userCategory)) {
                $q->orWhere('category_id', $userCategory);
            }

            // Match Location (City)
            if (!empty($userCity)) {
                $q->orWhere('location', 'LIKE', '%' . $userCity . '%');
            }

            // Match Designation (Title & Description)
            if (!empty($userDesignation)) {
                $q->orWhere('title', 'LIKE', '%' . $userDesignation . '%')
                  ->orWhere('description', 'LIKE', '%' . $userDesignation . '%');
            }

            // Match Experience Years
            if (!empty($userExpYears)) {
                $q->orWhere('experience', 'LIKE', '%' . $userExpYears . '%');
            }

            // Match Skills
            if (!empty($userSkills)) {
                foreach ($userSkills as $skill) {
                    $q->orWhereJsonContains('skills', $skill)
                      ->orWhere('skills', 'LIKE', '%' . $skill . '%')
                      ->orWhere('title', 'LIKE', '%' . $skill . '%');
                }
            }
        })
        ->orderBy('id', 'desc')
        ->take(6)
        ->get();

    // Fallback: Default Latest Jobs if no recommendation match
    if ($recommendedJobs->isEmpty()) {
        $recommendedJobs = JobPost::with(['company', 'category', 'subCategory'])
            ->where('status', 'active')
            ->orderBy('id', 'desc')
            ->take(6)
            ->get();
    }

    // 3. BROWSE BY CATEGORY WITH SUBCATEGORIES
    $categories = Category::with(['subcategories'])
        ->withCount(['jobPosts' => function ($query) {
            $query->where('status', 'active');
        }])
        ->orderBy('job_posts_count', 'desc')
        ->get();

    // 4. TOP COMPANIES HIRING
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
        ]
    ], 200);
}
    public function getJobs(Request $request)
    {
        $user = $request->user();
        $tab = $request->query('tab', 'recommended'); // default: recommended
        $categoryId = $request->query('category_id');
        $search = $request->query('search');

        $query = JobPost::query()->where('status', 'active');

        // 1. Filter: Tab-wise filtering
        if ($tab === 'recommended') {
            // User ke skills aur city ke according recommended jobs filter karein
            $userSkills = $user->skills ?? [];
            $userCity = $user->city;

            $query->where(function ($q) use ($userSkills, $userCity) {
                // Check matching skills in JSON column
                if (!empty($userSkills)) {
                    foreach ($userSkills as $skill) {
                        $q->orWhereJsonContains('skills', $skill)
                          ->orWhere('skills', 'LIKE', '%' . $skill . '%')
                          ->orWhere('title', 'LIKE', '%' . $skill . '%');
                    }
                }

                // Check city match
                if (!empty($userCity)) {
                    $q->orWhere('location', 'LIKE', '%' . $userCity . '%');
                }
            });
        } elseif ($tab === 'category') {
            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }
        }
        // Agar $tab === 'all' hai toh saari active jobs aayengi

        // 2. Filter: Search Query (Optional)
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('company', 'LIKE', "%{$search}%")
                  ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        // 3. User ne already kin jobs par apply kiya hai wo track karein
        $appliedJobIds = JobApplication::where('candidate_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        $jobs = $query->orderBy('id', 'desc')->paginate(10);

        // Har job ke sath 'has_applied' flag attach karein
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

        // 1. Verify Resume ownership
        $resume = UserResume::where('id', $request->resume_id)->where('user_id', $user->id)->first();
        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthorized access to the specified resume.'
            ], 403);
        }

        // 2. Duplicate Check
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

            // Increment applicants counter on job
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