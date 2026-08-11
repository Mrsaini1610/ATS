<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JobPost;
use App\Models\Member;
use App\Models\Category;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // 1. Stats Data (Dynamic)
        $stats = [
            'activeJobs'  => JobPost::where('status', 'active')->count(),
            'companies'   => JobPost::distinct('company')->whereNotNull('company')->where('company', '!=', '')->count('company') ?: 0,
            'jobSeekers'  => Member::where('status', 1)->count(),
            'successRate' => '94%',
        ];

        $user = Auth::guard('web')->user();

        // 2. Featured Jobs with Category & Creator Relationship
        $query = JobPost::with(['category', 'creator'])
            ->where('status', 'active');

        if ($user && !empty($user->job_title)) {
            $query->where(function ($q) use ($user) {
                $q->where('title', 'like', '%' . $user->job_title . '%')
                  ->orWhere('skills', 'like', '%' . $user->job_title . '%');
            });
        }

        $featuredJobs = $query->latest()->take(6)->get();
        $featuredJobs = $this->attachApplicationStatus($featuredJobs);

        // 3. Fully Dynamic Categories with Job Count
        $categoryQuery = Category::query();

        // Check if status column exists in categories table
        if (Schema::hasColumn('categories', 'status')) {
            $categoryQuery->where('categories.status', 1);
        }

        $categories = $categoryQuery
            ->withCount(['jobPosts' => function ($q) {
                // Table prefix 'job_posts.status' lagane se unknown column issue solve ho jata h
                $q->where('job_posts.status', 'active');
            }])
            ->orderByDesc('job_posts_count')
            ->take(8)
            ->get()
            ->map(function ($cat) {
                return [
                    'id'    => $cat->id,
                    'label' => $cat->name,
                    'count' => $cat->job_posts_count ?? 0,
                    'icon'  => '💼',
                    // 'to'    => route('job-search', ['category_id' => $cat->id]),
                ];
            });

        // 4. Dynamic Top Companies Hiring
        $topCompanies = JobPost::select('company', DB::raw('count(*) as jobs_count'))
            ->where('status', 'active')
            ->whereNotNull('company')
            ->where('company', '!=', '')
            ->groupBy('company')
            ->orderByDesc('jobs_count')
            ->take(6)
            ->get()
            ->map(function ($comp) {
                return [
                    'name'     => $comp->company,
                    'industry' => 'Corporate & Services',
                    'logo'     => strtoupper(substr($comp->company, 0, 2)),
                    'color'    => 'bg-blue-600',
                    'jobs'     => $comp->jobs_count
                ];
            });

        return Inertia::render('Candidate/Home', [
            'stats'        => $stats,
            'jobs'         => $featuredJobs,
            'categories'   => $categories,
            'topCompanies' => $topCompanies,
        ]);
    }

    private function attachApplicationStatus($jobs)
    {
        if (!Auth::guard('web')->check()) {
            return $jobs->transform(function ($job) {
                $job->application_status = null;
                $job->can_apply = true;
                $job->reapply_at = null;
                return $job;
            });
        }

        $applications = JobApplication::where('candidate_id', Auth::guard('web')->id())
            ->get()
            ->keyBy('job_id');

        return $jobs->transform(function ($job) use ($applications) {
            $application = $applications[$job->id] ?? null;

            $job->application_status = null;
            $job->can_apply = true;
            $job->reapply_at = null;

            if ($application) {
                $status = strtolower($application->status);
                $job->application_status = $status;

                switch ($status) {
                    case 'pending':
                    case 'applied':
                    case 'selected':
                    case 'cancelled':
                        $job->can_apply = false;
                        break;

                    case 'rejected':
                        $reapplyAt = Carbon::parse($application->updated_at)->addDays(60);
                        if (now()->lt($reapplyAt)) {
                            $job->can_apply = false;
                            $job->reapply_at = $reapplyAt->toISOString();
                        }
                        break;
                }
            }

            return $job;
        });
    }
}