<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\JobApplication;
use App\Models\JobPost;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        // 1. JobPost Query with active/approved status
        $query = JobPost::with(['category'])
            ->whereIn('status', ['active', 'approved']);

        // 2. Search Query (Title, Company, Skills, Description, Category)
        if ($request->filled('search')) {
            $searchTerm = trim($request->search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('company', 'like', '%' . $searchTerm . '%')
                  ->orWhere('skills', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function ($catQ) use ($searchTerm) {
                      $catQ->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // 3. Location Filter
        if ($request->filled('location') && !in_array(strtolower($request->location), ['all', 'all cities', ''])) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // 4. Salary Filter (handles numeric ranges e.g. 25000 - 40000 or 50000+)
        if ($request->filled('salary') && !in_array(strtolower($request->salary), ['any salary', 'all', ''])) {
            preg_match_all('/\d+/', str_replace(',', '', $request->salary), $matches);
            if (!empty($matches[0])) {
                $min = (float) $matches[0][0];
                $max = isset($matches[0][1]) ? (float) $matches[0][1] : null;

                if ($max) {
                    $query->where(function ($q) use ($min, $max) {
                        $q->whereBetween('min_salary', [$min, $max])
                          ->orWhereBetween('max_salary', [$min, $max])
                          ->orWhere(function ($sub) use ($min, $max) {
                              $sub->where('min_salary', '<=', $min)
                                  ->where('max_salary', '>=', $max);
                          });
                    });
                } else {
                    $query->where('min_salary', '>=', $min);
                }
            }
        }

        // 5. Category Filter (by uuid, slug, name, or id)
        if ($request->filled('category') && !in_array(strtolower($request->category), ['all', 'recommended jobs', ''])) {
            $catVal = $request->category;
            $query->where(function ($q) use ($catVal) {
                $q->whereHas('category', function ($sub) use ($catVal) {
                    $sub->where('uuid', $catVal)
                        ->orWhere('slug', $catVal)
                        ->orWhere('name', 'like', '%' . $catVal . '%');
                });
                if (is_numeric($catVal)) {
                    $q->orWhere('category_id', $catVal);
                }
            });
        }

        // 5.1 Company Filter (by uuid or name)
        if ($request->filled('company')) {
            $compVal = $request->company;
            $query->where(function ($q) use ($compVal) {
                $q->where('company_uuid', $compVal)
                  ->orWhere('company', 'like', '%' . $compVal . '%');
            });
        }

        // 6. Skill Filter
        if ($request->filled('skill')) {
            $query->where('skills', 'like', '%' . $request->skill . '%');
        }

        // 7. Job Type & Experience Filters
        if ($request->filled('job_type') && !in_array(strtolower($request->job_type), ['all', 'all types', ''])) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->filled('experience') && !in_array(strtolower($request->experience), ['all', 'all levels', ''])) {
            $query->where('experience', $request->experience);
        }

        // 8. Auth Candidate Applications & Saved Jobs map
        $user = Auth::guard('web')->user() ?: Auth::user();
        $appliedJobIds = [];
        $appliedJobMap = [];
        if ($user) {
            $userApps = JobApplication::with('jobPost')->where('candidate_id', $user->id)->get();
            foreach ($userApps as $app) {
                $appliedJobMap[$app->job_id] = $app;
                if ($app->job_id) {
                    $appliedJobIds[] = (int) $app->job_id;
                    $appliedJobIds[] = (string) $app->job_id;
                }
                if ($app->jobPost?->uuid) {
                    $appliedJobMap[$app->jobPost->uuid] = $app;
                    $appliedJobIds[] = $app->jobPost->uuid;
                }
                if ($app->jobPost?->id) {
                    $appliedJobIds[] = (int) $app->jobPost->id;
                    $appliedJobIds[] = (string) $app->jobPost->id;
                }
            }
            $appliedJobIds = array_values(array_unique($appliedJobIds));
        }

        $savedJobUuids = $user
            ? \App\Models\SavedJob::where('user_uuid', $user->uuid)->pluck('job_uuid')->toArray()
            : [];

        // 9. Fetch and format jobs data with UUID support
        $jobs = $query->latest()->get()->map(function ($job) use ($appliedJobMap, $appliedJobIds) {
            $application = $appliedJobMap[$job->id] ?? $appliedJobMap[$job->uuid] ?? null;
            $isApplied = !empty($application) || in_array($job->id, $appliedJobIds) || in_array($job->uuid, $appliedJobIds);

            $canApply = true;
            $reapplyAt = null;
            $status = $application ? strtolower($application->status ?: 'applied') : null;

            if ($isApplied) {
                if (in_array($status, ['rejected', 'calling_rejected', 'not_selected'])) {
                    $reapplyAt = Carbon::parse($application->updated_at ?? now())->addDays(60);
                    if (now()->lt($reapplyAt)) {
                        $canApply = false;
                    } else {
                        $canApply = true;
                    }
                } else {
                    $canApply = false;
                }
            }

            $salaryText = 'Competitive';
            if ($job->min_salary && $job->max_salary) {
                $salaryText = '₹' . number_format($job->min_salary) . ' - ₹' . number_format($job->max_salary);
            } elseif ($job->min_salary) {
                $salaryText = '₹' . number_format($job->min_salary) . '+';
            }

            $skills = is_array($job->skills) ? $job->skills : (json_decode($job->skills, true) ?: []);
            if (empty($skills) && is_string($job->skills)) {
                $skills = array_filter(array_map('trim', explode(',', $job->skills)));
            }

            return [
                ...$job->toArray(),
                'id'                 => $job->uuid ?: $job->id,
                'uuid'               => $job->uuid,
                'company_uuid'       => $job->company_uuid,
                'salary'             => $salaryText,
                'skills'             => array_values($skills),
                'category_uuid'      => $job->category?->uuid,
                'category_name'      => $job->category?->name ?: 'General',
                'category_icon'      => $job->category?->icon ?: '💼',
                'is_applied'         => $isApplied,
                'can_apply'          => $canApply,
                'application_status' => $status,
                'reapply_at'         => $reapplyAt?->toISOString(),
                'created_at_human'   => $job->created_at ? $job->created_at->diffForHumans() : 'Recently',
            ];
        });

        // 10. Only categories that have active/approved job posts created
        $categories = Category::whereIn('id', function ($q) {
            $q->select('category_id')
              ->from('job_posts')
              ->whereIn('status', ['active', 'approved'])
              ->whereNotNull('category_id');
        })
        ->withCount(['jobPosts' => function ($q) {
            $q->whereIn('job_posts.status', ['active', 'approved']);
        }])
        ->orderByDesc('job_posts_count')
        ->get()
        ->map(function ($cat) {
            return [
                'id'    => $cat->uuid ?: $cat->id,
                'uuid'  => $cat->uuid,
                'name'  => $cat->name,
                'slug'  => $cat->slug,
                'icon'  => $cat->icon ?: '💼',
                'count' => $cat->job_posts_count,
            ];
        });

        // 11. Distinct Filter Options from active jobs
        $locations = JobPost::whereIn('status', ['active', 'approved'])
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->pluck('location')
            ->values();

        $jobTypes = JobPost::whereIn('status', ['active', 'approved'])
            ->whereNotNull('job_type')
            ->where('job_type', '!=', '')
            ->distinct()
            ->pluck('job_type')
            ->values();

        $experiences = JobPost::whereIn('status', ['active', 'approved'])
            ->whereNotNull('experience')
            ->where('experience', '!=', '')
            ->distinct()
            ->pluck('experience')
            ->values();

        return Inertia::render('Candidate/JobListings', [
            'jobs'        => $jobs,
            'categories'  => $categories,
            'locations'   => $locations,
            'jobTypes'    => $jobTypes,
            'experiences' => $experiences,
            'savedJobs'   => $savedJobUuids,
            'appliedJobs' => $appliedJobIds,
            'filters'     => $request->only(
                'search',
                'location',
                'salary',
                'job_type',
                'experience',
                'category',
                'company',
                'skill'
            ),
            'auth' => [
                'user' => $user,
            ],
        ]);
    }
}