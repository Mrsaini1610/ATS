<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JobPost;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class PageController extends Controller
{
   public function getCategories()
{
    // 1. Category Query
    $categoryQuery = Category::query();

    // Check agar 'categories' table me status column hai tabhi condition lagayein
    if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'status')) {
        $categoryQuery->where('categories.status', 1);
    }

    $categories = $categoryQuery
        ->withCount(['jobPosts' => function ($q) {
            // Explicitly table prefix job_posts.status use karein
            $q->where('job_posts.status', 'active');
        }])
        ->orderBy('categories.name', 'asc')
        ->get()
        ->map(function ($item) {
            return [
                'id'    => $item->id,
                'name'  => $item->name,
                'slug'  => $item->slug,
                'jobs'  => $item->job_posts_count,

                // UI Defaults
                'icon'   => '💼',
                'iconBg' => 'bg-blue-100',
                'color'  => 'bg-blue-50 border-blue-200',
                'trend'  => '+0%',

                // Related Job Titles
                'subcategories' => $item->jobPosts()
                    ->where('job_posts.status', 'active')
                    ->pluck('title')
                    ->take(6)
                    ->values(),
            ];
        });

    // 2. Top Skills
    $topSkills = JobPost::where('status', 'active')
        ->whereNotNull('skills')
        ->pluck('skills')
        ->flatten()
        ->filter()
        ->unique()
        ->take(12)
        ->values();

    return Inertia::render('Candidate/Categories', [
        'categories' => $categories,
        'topSkills'  => $topSkills,
    ]);
}

    public function getServices()
    {
        return Inertia::render('Candidate/Services', []);
    }

    public function getCompany($company)
    {
        // JobPost Model & Category Relationship
        $jobs = JobPost::where('company', $company)
            ->where('status', 'active')
            ->with('category')
            ->get();

        if ($jobs->isEmpty()) {
            abort(404);
        }

        $first = $jobs->first();

        return Inertia::render('Candidate/Company', [
            'company' => [
                'name'       => $first->company,
                'logo'       => $first->company_image,
                'industry'   => $first->category?->name ?? 'General',
                'hq'         => $first->company_address,
                'phone'      => $first->contact_phone,
                'email'      => $first->contact_email,
                'website'    => '',
                'tagline'    => $first->company_about ?? '',
                'size'       => $first->company_size ?? 'Growing',
                'rating'     => '4.8',
                'bgGradient' => 'from-blue-600 to-indigo-700',
                // Model casts 'perks' as array, so direct access is safe
                'perks'      => $first->perks ?? [],
                'jobs'       => $jobs,
            ]
        ]);
    }

    public function companies(Request $request)
    {
        $companies = JobPost::query()
            ->whereNotNull('company')
            ->where('company', '!=', '')
            ->where('status', 'active')
            ->select([
                'company',
                DB::raw('COUNT(*) as jobs_count'),
                DB::raw('MAX(company_image) as company_image'),
            ])
            ->groupBy('company')
            ->orderBy('company')
            ->get();

        return Inertia::render('Public/Companies', [
            'companies' => $companies,
        ]);
    }

    public function about(Request $request)
    {
        return Inertia::render('Candidate/About');
    }

    public function contact(Request $request)
    {
        return Inertia::render('Candidate/Contact');
    }

    public function apps()
    {
        return Inertia::render('Candidate/MobileApp', []);
    }
}