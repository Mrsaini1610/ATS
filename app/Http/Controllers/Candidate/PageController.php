<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JobPost;
use App\Models\Category;
use App\Models\Company;
use App\Models\ContactMessage;
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
        ->whereHas('jobPosts', function ($q) {
            $q->whereIn('job_posts.status', ['active', 'approved']);
        })
        ->withCount(['jobPosts' => function ($q) {
            // Explicitly table prefix job_posts.status use karein
            $q->whereIn('job_posts.status', ['active', 'approved']);
        }])
        ->orderByDesc('job_posts_count')
        ->orderBy('categories.name', 'asc')
        ->get()
        ->map(function ($item) {
            return [
                'id'    => $item->uuid ?: $item->id,
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
        // Check by uuid, slug or name
        $companyModel = Company::where('uuid', $company)->orWhere('name', $company)->first();

        $jobPosts = JobPost::where(function ($q) use ($company, $companyModel) {
                if ($companyModel) {
                    $q->where('company_uuid', $companyModel->uuid)
                      ->orWhere('company', $companyModel->name);
                } else {
                    $q->where('company', $company)
                      ->orWhere('company_uuid', $company);
                }
            })
            ->whereIn('status', ['active', 'approved'])
            ->with('category')
            ->latest()
            ->get();

        $firstJob = $jobPosts->first();

        if ($jobPosts->isEmpty()) {
            return redirect('/companies')->with('error', 'No active job openings available for this company.');
        }

        $jobs = $jobPosts->map(function ($j) {
            $salaryText = 'Competitive';
            if ($j->min_salary && $j->max_salary) {
                $salaryText = '₹' . number_format($j->min_salary) . ' - ₹' . number_format($j->max_salary);
            } elseif ($j->min_salary) {
                $salaryText = '₹' . number_format($j->min_salary) . '+';
            }
            return [
                'id'       => $j->uuid ?: $j->id,
                'uuid'     => $j->uuid,
                'title'    => $j->title,
                'company'  => $j->company,
                'loc'      => $j->location ?: 'Multiple',
                'salary'   => $salaryText,
                'type'     => $j->job_type ?: 'Full Time',
                'exp'      => $j->experience ?: 'Any Experience',
                'category' => $j->category?->name ?: 'General',
            ];
        });

        $compName = $companyModel ? $companyModel->name : ($firstJob ? $firstJob->company : $company);
        $compLogo = $companyModel ? $companyModel->logo : ($firstJob ? $firstJob->company_image : null);

        return Inertia::render('Candidate/Companies', [
            'company' => [
                'id'         => $companyModel?->uuid ?: ($firstJob?->company_uuid ?: $company),
                'uuid'       => $companyModel?->uuid ?: ($firstJob?->company_uuid ?: $company),
                'name'       => $compName,
                'logo'       => $compLogo,
                'industry'   => $companyModel?->company_size ?: ($firstJob?->category?->name ?? 'Corporate Services'),
                'hq'         => $companyModel?->location ?: ($firstJob?->company_address ?: 'India'),
                'phone'      => $firstJob?->contact_phone ?: '',
                'email'      => $firstJob?->contact_email ?: '',
                'website'    => $companyModel?->website ?: '',
                'tagline'    => $companyModel?->description ?: ($firstJob?->company_about ?: 'Verified Employer on ATS'),
                'size'       => $companyModel?->company_size ?: ($firstJob?->company_size ?: 'Growing'),
                'rating'     => '4.8',
                'bgGradient' => 'from-blue-600 via-indigo-600 to-purple-700',
                'perks'      => $firstJob?->perks ?? ['Health Insurance', 'Performance Bonus', 'Flexible Hours', 'Provident Fund (PF)'],
                'jobs'       => $jobs,
            ]
        ]);
    }

    public function companies(Request $request)
    {
        $companies = Company::where('status', 'active')
            ->get()
            ->map(function ($comp) {
                $jobsCount = JobPost::where(function ($q) use ($comp) {
                        $q->where('company_uuid', $comp->uuid)
                          ->orWhere('company', $comp->name);
                    })
                    ->whereIn('status', ['active', 'approved'])
                    ->count();

                $openRoles = JobPost::where(function ($q) use ($comp) {
                        $q->where('company_uuid', $comp->uuid)
                          ->orWhere('company', $comp->name);
                    })
                    ->whereIn('status', ['active', 'approved'])
                    ->pluck('title')
                    ->take(3)
                    ->toArray();

                return [
                    'id'            => $comp->uuid ?: $comp->id,
                    'uuid'          => $comp->uuid,
                    'name'          => $comp->name,
                    'logo'          => $comp->logo,
                    'company_image' => $comp->logo,
                    'location'      => $comp->location ?: $comp->address ?: 'India',
                    'industry'      => $comp->company_size ?: 'Corporate Services',
                    'jobs_count'    => $jobsCount,
                    'open_roles'    => $openRoles,
                ];
            })
            ->filter(function ($comp) {
                return $comp['jobs_count'] > 0;
            })
            ->values();

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
                    DB::raw('COALESCE(MAX(company_uuid), MAX(uuid)) as uuid'),
                ])
                ->groupBy('company')
                ->havingRaw('COUNT(*) > 0')
                ->orderBy('company')
                ->get()
                ->map(function ($item) {
                    $openRoles = JobPost::where('company', $item->name)
                        ->whereIn('status', ['active', 'approved'])
                        ->pluck('title')
                        ->take(3)
                        ->toArray();

                    return [
                        'id'            => $item->uuid,
                        'uuid'          => $item->uuid,
                        'name'          => $item->name,
                        'logo'          => $item->company_image,
                        'company_image' => $item->company_image,
                        'location'      => $item->location ?: 'India',
                        'industry'      => 'Corporate Services',
                        'jobs_count'    => (int) $item->jobs_count,
                        'open_roles'    => $openRoles,
                    ];
                })
                ->filter(function ($comp) {
                    return $comp['jobs_count'] > 0;
                })
                ->values();
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

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'] ?: 'General Inquiry',
            'message' => $validated['message'],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Thank you! Your message has been sent successfully. Our support team will get in touch with you soon.');
    }

    public function apps()
    {
        return Inertia::render('Candidate/MobileApp', []);
    }

    public function privacy()
    {
        return Inertia::render('Candidate/PrivacyPolicy');
    }

    public function terms()
    {
        return Inertia::render('Candidate/Terms');
    }

    public function faq()
    {
        return Inertia::render('Candidate/Faq');
    }

    public function cookies()
    {
        return Inertia::render('Candidate/Cookies');
    }
}