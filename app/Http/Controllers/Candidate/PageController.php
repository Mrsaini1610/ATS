<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JobPost;
use App\Models\Category;
use App\Models\Company;
use Illuminate\Support\Facades\DB;

class PageController extends Controller
{
   public function getCategories()
{
    // 1. Category Query
    $categoryQuery = Category::query();

    // Check agar 'categories' table me status column hai tabhi condition lagayein
    if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'status')) {
        $categoryQuery->whereIn('categories.status', ['active', '1', 1]);
    }

    $categories = $categoryQuery
        ->withCount(['jobPosts' => function ($q) {
            // Explicitly table prefix job_posts.status use karein
            $q->whereIn('job_posts.status', ['active', 'approved']);
        }])
        ->orderBy('categories.name', 'asc')
        ->get()
        ->map(function ($item) {
            return [
                'id'    => $item->id,
                'uuid'  => $item->uuid,
                'name'  => $item->name,
                'slug'  => $item->slug,
                'jobs'  => $item->job_posts_count,

                // UI Defaults
                'icon'   => $item->icon ?: '💼',
                'iconBg' => 'bg-blue-100',
                'color'  => 'bg-blue-50 border-blue-200',
                'trend'  => '+0%',

                // Related Job Titles
                'subcategories' => $item->jobPosts()
                    ->whereIn('job_posts.status', ['active', 'approved'])
                    ->pluck('title')
                    ->take(6)
                    ->values(),
            ];
        });

    // 2. Top Skills
    $topSkills = JobPost::whereIn('status', ['active', 'approved'])
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
        // Check by name or uuid
        $companyModel = Company::where('uuid', $company)->orWhere('name', $company)->first();

        $jobs = JobPost::where(function ($q) use ($company, $companyModel) {
                $q->where('company', $company);
                if ($companyModel) {
                    $q->orWhere('company_uuid', $companyModel->uuid)
                      ->orWhere('company', $companyModel->name);
                }
            })
            ->whereIn('status', ['active', 'approved'])
            ->with('category')
            ->get();

        $first = $jobs->first();
        $compName = $companyModel ? $companyModel->name : ($first ? $first->company : $company);
        $compLogo = $companyModel ? $companyModel->logo : ($first ? $first->company_image : null);

        return Inertia::render('Candidate/Companies', [
            'company' => [
                'name'       => $compName,
                'logo'       => $compLogo,
                'industry'   => $companyModel?->company_size ?: ($first?->category?->name ?? 'Corporate Services'),
                'hq'         => $companyModel?->location ?: ($first?->company_address ?: 'India'),
                'phone'      => $first?->contact_phone ?: '',
                'email'      => $first?->contact_email ?: '',
                'website'    => $companyModel?->website ?: '',
                'tagline'    => $companyModel?->description ?: ($first?->company_about ?: 'Verified Employer on ATS WorkIndia'),
                'size'       => $companyModel?->company_size ?: ($first?->company_size ?: 'Growing'),
                'rating'     => '4.8',
                'bgGradient' => 'from-blue-600 to-indigo-700',
                'perks'      => $first?->perks ?? ['Health Insurance', 'Performance Bonus', 'Flexible Hours'],
                'jobs'       => $jobs,
            ]
        ]);
    }

    public function companies(Request $request)
    {
        $companies = Company::where('status', 'active')
            ->get()
            ->map(function ($comp) {
                $jobsCount = JobPost::where('company_uuid', $comp->uuid)
                    ->orWhere('company', $comp->name)
                    ->whereIn('status', ['active', 'approved'])
                    ->count();

                return [
                    'uuid'          => $comp->uuid,
                    'name'          => $comp->name,
                    'logo'          => $comp->logo,
                    'company_image' => $comp->logo,
                    'location'      => $comp->location ?: $comp->address ?: 'India',
                    'industry'      => $comp->company_size ?: 'Corporate Services',
                    'jobs_count'    => $jobsCount,
                ];
            });

        if ($companies->isEmpty()) {
            $companies = JobPost::query()
                ->whereNotNull('company')
                ->where('company', '!=', '')
                ->whereIn('status', ['active', 'approved'])
                ->select([
                    'company as name',
                    DB::raw('COUNT(*) as jobs_count'),
                    DB::raw('MAX(company_image) as company_image'),
                    DB::raw('MAX(location) as location'),
                ])
                ->groupBy('company')
                ->orderBy('company')
                ->get();
        }

        return Inertia::render('Candidate/CompaniesList', [
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