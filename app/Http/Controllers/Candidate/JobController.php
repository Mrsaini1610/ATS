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
        // 1. JobPost Model se query start ki
        $query = JobPost::where('status', 'active');

        // 2. Search Query
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('company', 'like', '%' . $request->search . '%')
                  ->orWhere('skills', 'like', '%' . $request->search . '%');
            });
        }

        // 3. Location Filter
        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // 4. Salary Filter
        if ($request->filled('salary') && $request->salary != 'Any Salary') {
            $query->where('salary', 'like', '%' . $request->salary . '%');
        }

        // 5. Category Filter
        if ($request->filled('category') && $request->category != 'Recommended Jobs') {
            if (is_numeric($request->category)) {
                $query->where('category_id', $request->category);
            } else {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->category . '%');
                });
            }
        }

        // 6. Skill Filter
        if ($request->filled('skill')) {
            $query->where('skills', 'like', '%' . $request->skill . '%');
        }

        // 7. Job Type & Experience Filters
        if ($request->filled('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->filled('experience')) {
            $query->where('experience', $request->experience);
        }

        // Fetch Active Jobs with Application Status logic
        $jobs = $query->latest()->get()->map(function ($job) {
            $application = null;

            if (Auth::check()) {
                $application = JobApplication::where('job_id', $job->id)
                    ->where('candidate_id', Auth::id())
                    ->latest()
                    ->first();
            }

            $canApply = true;
            $reapplyAt = null;
            $status = null;

            if ($application) {
                $status = strtolower($application->status);

                switch ($status) {
                    case 'pending':
                    case 'applied':
                    case 'selected':
                    case 'cancelled':
                        $canApply = false;
                        break;

                    case 'rejected':
                        $reapplyAt = Carbon::parse($application->updated_at)->addDays(60);

                        if (now()->lt($reapplyAt)) {
                            $canApply = false;
                        } else {
                            $canApply = true;
                        }
                        break;
                }
            }

            return [
                ...$job->toArray(),
                'can_apply' => $canApply,
                'application_status' => $status,
                'reapply_at' => $reapplyAt?->toISOString(),
            ];
        });

        // 8. Unique Categories extract karna jin par active Job Posts hain (Only id & name)
        $categories = Category::whereIn('id', function ($q) {
            $q->select('category_id')
              ->from('job_posts')
              ->where('status', 'active')
              ->whereNotNull('category_id');
        })
        ->select('id', 'name')
        ->get();

        return Inertia::render('Candidate/JobSearch', [
            'jobs' => $jobs,

            'auth' => [
                'user' => Auth::user(),
            ],

            'filters' => $request->only(
                'search',
                'location',
                'salary',
                'job_type',
                'experience',
                'category',
                'skill'
            ),

            'categories' => $categories,

            'locations' => JobPost::where('status', 'active')
                ->whereNotNull('location')
                ->distinct()
                ->pluck('location')
                ->values(),

            'jobTypes' => JobPost::where('status', 'active')
                ->whereNotNull('job_type')
                ->distinct()
                ->pluck('job_type')
                ->values(),

            'experiences' => JobPost::where('status', 'active')
                ->whereNotNull('experience')
                ->distinct()
                ->pluck('experience')
                ->values(),
        ]);
    }
}