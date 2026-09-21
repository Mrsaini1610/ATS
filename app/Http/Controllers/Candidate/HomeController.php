<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JobPost;
use App\Models\Member;
use App\Models\Company;
use App\Models\Category;
use App\Models\Skill;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('web')->user();

        // 1. Stats Data (Dynamic)
        $stats = [
            'activeJobs'  => JobPost::whereIn('status', ['active', 'approved'])->count(),
            'companies'   => Company::where('status', 'active')->count() ?: (JobPost::distinct('company')->whereNotNull('company')->count('company') ?: 0),
            'jobSeekers'  => Member::where('status', 1)->count() ?: 1250,
            'successRate' => '95%',
        ];

        // 2. Recent Jobs (Latest active jobs)
        $recentJobsQuery = JobPost::with(['category'])
            ->whereIn('status', ['active', 'approved'])
            ->latest()
            ->take(6);

        $recentJobs = $this->attachApplicationStatus($recentJobsQuery->get());
        $recentJobs = $this->formatJobsData($recentJobs);

        // 3. Recommended Jobs for Logged-in Candidate (Profile Matching)
        $recommendedJobs = [];
        $isLoggedIn = !empty($user);

        if ($user) {
            $candidateTitle = strtolower(trim($user->latestExperience?->designation ?: ($user->category?->name ?: '')));
            $candidateSkills = is_array($user->skills) ? $user->skills : (json_decode($user->skills, true) ?: []);
            $candidateExp = (float) ($user->total_experience_years ?: 0);
            $candidateCity = strtolower(trim($user->city ?: ''));
            $candidateAddress = strtolower(trim($user->address ?: ''));

            $allActiveJobs = JobPost::with(['category'])
                ->whereIn('status', ['active', 'approved'])
                ->get();

            $scoredJobs = $allActiveJobs->map(function ($job) use ($user, $candidateTitle, $candidateSkills, $candidateExp, $candidateCity, $candidateAddress) {
                $score = 0;
                $matchReasons = [];

                // 3a. Skills Match (up to 35 points)
                $jobSkills = is_array($job->skills) ? $job->skills : (json_decode($job->skills, true) ?: []);
                if (!empty($candidateSkills) && !empty($jobSkills)) {
                    $matchingSkills = array_uintersect($candidateSkills, $jobSkills, 'strcasecmp');
                    $matchCount = count($matchingSkills);
                    if ($matchCount > 0) {
                        $ratio = min(1, $matchCount / max(1, count($jobSkills)));
                        $score += round($ratio * 35);
                        $matchReasons[] = $matchCount . ' Skill' . ($matchCount > 1 ? 's' : '') . ' Match';
                    }
                } else {
                    $score += 15;
                }

                // 3b. Title & Category Match (up to 30 points)
                if (!empty($candidateTitle)) {
                    if (stripos($job->title, $candidateTitle) !== false || stripos($candidateTitle, $job->title) !== false) {
                        $score += 30;
                        $matchReasons[] = 'Role Match';
                    } elseif ($user->category_id && $job->category_id == $user->category_id) {
                        $score += 25;
                        $matchReasons[] = 'Category Match';
                    }
                } elseif ($user->category_id && $job->category_id == $user->category_id) {
                    $score += 25;
                    $matchReasons[] = 'Category Match';
                } else {
                    $score += 15;
                }

                // 3c. Experience Match (up to 20 points)
                $expType = $job->experience;
                if ($expType === 'Fresher Only') {
                    if ($candidateExp <= 0.5) {
                        $score += 20;
                        $matchReasons[] = 'Fresher Suitable';
                    } else {
                        $score += 10;
                    }
                } elseif ($expType === 'Any') {
                    $score += 20;
                    $matchReasons[] = 'Any Experience';
                } else {
                    $minExp = (float) $job->min_experience;
                    $maxExp = (float) ($job->max_experience ?: 99);
                    if ($candidateExp >= $minExp && $candidateExp <= $maxExp) {
                        $score += 20;
                        $matchReasons[] = 'Exp: ' . $candidateExp . ' Yrs';
                    } elseif ($candidateExp >= max(0, $minExp - 1)) {
                        $score += 12;
                    } else {
                        $score += 5;
                    }
                }

                // 3d. Location / Area Match (up to 15 points)
                $jobLoc = strtolower(trim($job->location ?: ''));
                if (!empty($candidateCity) && (stripos($jobLoc, $candidateCity) !== false || stripos($candidateCity, $jobLoc) !== false)) {
                    $score += 15;
                    $matchReasons[] = ucfirst($candidateCity) . ' Location';
                } elseif (!empty($candidateAddress) && stripos($jobLoc, $candidateAddress) !== false) {
                    $score += 15;
                    $matchReasons[] = 'Area Match';
                } else {
                    $score += 5;
                }

                $finalPercent = min(98, max(55, $score));
                $job->match_percent = $finalPercent;
                $job->match_reasons = !empty($matchReasons) ? $matchReasons : ['Profile Suitable'];

                return $job;
            });

            $recommendedJobs = $scoredJobs->sortByDesc('match_percent')->take(6)->values();
            $recommendedJobs = $this->attachApplicationStatus($recommendedJobs);
            $recommendedJobs = $this->formatJobsData($recommendedJobs);
        }

        // 4. Dynamic Categories with Job Count and Subcategories
        $categoryQuery = Category::query();
        if (Schema::hasColumn('categories', 'status')) {
            $categoryQuery->whereIn('categories.status', ['active', '1', 1]);
        }

        $categories = $categoryQuery
            ->withCount(['jobPosts' => function ($q) {
                $q->whereIn('job_posts.status', ['active', 'approved']);
            }])
            ->with(['subcategories' => function ($q) {
                if (Schema::hasColumn('subcategories', 'status')) {
                    $q->whereIn('status', ['active', '1', 1]);
                }
                $q->take(4);
            }])
            ->orderByDesc('job_posts_count')
            ->take(8)
            ->get()
            ->map(function ($cat) {
                return [
                    'id'            => $cat->id,
                    'uuid'          => $cat->uuid,
                    'label'         => $cat->name,
                    'count'         => $cat->job_posts_count ?? 0,
                    'icon'          => $cat->icon ?: '💼',
                    'subcategories' => $cat->subcategories->pluck('name')->toArray(),
                ];
            });

        // 5. Dynamic Top Companies List
        $topCompanies = Company::where('status', 'active')
            ->take(8)
            ->get()
            ->map(function ($comp) {
                $jobsCount = JobPost::where('company_uuid', $comp->uuid)
                    ->orWhere('company', $comp->name)
                    ->whereIn('status', ['active', 'approved'])
                    ->count();

                return [
                    'uuid'     => $comp->uuid,
                    'name'     => $comp->name,
                    'slug'     => $comp->slug,
                    'logo'     => $comp->logo,
                    'industry' => $comp->company_size ?: 'Corporate Services',
                    'location' => $comp->location ?: $comp->address ?: 'India',
                    'jobs'     => $jobsCount,
                ];
            });

        // If companies table has few records, merge with distinct job companies
        if ($topCompanies->count() < 4) {
            $existingNames = $topCompanies->pluck('name')->toArray();
            $jobCompanies = JobPost::select('company', DB::raw('count(*) as jobs_count'))
                ->whereIn('status', ['active', 'approved'])
                ->whereNotNull('company')
                ->where('company', '!=', '')
                ->whereNotIn('company', $existingNames)
                ->groupBy('company')
                ->orderByDesc('jobs_count')
                ->take(8 - $topCompanies->count())
                ->get()
                ->map(function ($jc) {
                    return [
                        'uuid'     => null,
                        'name'     => $jc->company,
                        'slug'     => strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $jc->company)),
                        'logo'     => strtoupper(substr($jc->company, 0, 2)),
                        'industry' => 'Hiring Partner',
                        'location' => 'Multiple Locations',
                        'jobs'     => $jc->jobs_count,
                    ];
                });

            $topCompanies = $topCompanies->concat($jobCompanies)->values();
        }

        // 6. Top Trending Skills
        $trendingSkills = Skill::where('status', 1)
            ->orderByRaw("CASE WHEN demand = 'high' THEN 1 WHEN demand = 'medium' THEN 2 ELSE 3 END")
            ->take(12)
            ->get()
            ->map(function ($s) {
                return [
                    'id'       => $s->id,
                    'name'     => $s->name,
                    'category' => $s->category,
                    'demand'   => $s->demand ?: 'high',
                ];
            });

        // 7. Testimonials
        $testimonials = [
            [
                'name'    => 'Pooja Sharma',
                'role'    => 'Telecalling Specialist at TeleConnect',
                'avatar'  => 'PS',
                'comment' => 'Applied to 3 verified jobs in Jaipur and got placed within 4 days with a great salary hike!',
                'rating'  => 5,
            ],
            [
                'name'    => 'Aman Verma',
                'role'    => 'Frontend Developer at WebCraft',
                'avatar'  => 'AV',
                'comment' => 'The direct company matching and interview scheduling made my job hunt seamless and transparent.',
                'rating'  => 5,
            ],
            [
                'name'    => 'Ritu Singhania',
                'role'    => 'HR Executive at ProStaff',
                'avatar'  => 'RS',
                'comment' => 'WorkIndia ATS platform gives genuine job openings with direct recruiter contact numbers.',
                'rating'  => 5,
            ],
        ];

        return Inertia::render('Candidate/Home', [
            'stats'           => $stats,
            'recentJobs'      => $recentJobs,
            'recommendedJobs' => $recommendedJobs,
            'isLoggedIn'      => $isLoggedIn,
            'candidateProfile'=> $isLoggedIn ? [
                'name'        => $user->full_name ?: $user->username,
                'city'        => $user->city,
                'skills'      => is_array($user->skills) ? $user->skills : (json_decode($user->skills, true) ?: []),
                'experience'  => $user->total_experience_years,
            ] : null,
            'categories'      => $categories,
            'topCompanies'    => $topCompanies,
            'trendingSkills'  => $trendingSkills,
            'testimonials'    => $testimonials,
        ]);
    }

    private function formatJobsData($jobs)
    {
        return $jobs->map(function ($job) {
            $salaryText = 'Competitive';
            if ($job->min_salary && $job->max_salary) {
                $salaryText = '₹' . number_format($job->min_salary) . ' - ₹' . number_format($job->max_salary);
            } elseif ($job->min_salary) {
                $salaryText = '₹' . number_format($job->min_salary) . '+';
            }

            return [
                'id'                 => $job->id,
                'uuid'               => $job->uuid,
                'title'              => $job->title,
                'company'            => $job->company,
                'company_image'      => $job->company_image,
                'location'           => $job->location ?: 'Remote / India',
                'salary'             => $salaryText,
                'salary_type'        => $job->salary_type ?: 'monthly',
                'job_type'           => $job->job_type ?: 'Full Time',
                'experience'         => $job->experience ?: 'Any',
                'skills'             => is_array($job->skills) ? $job->skills : (json_decode($job->skills, true) ?: []),
                'category_name'      => $job->category?->name ?: 'General',
                'category_icon'      => $job->category?->icon ?: '💼',
                'badge'              => $job->badge,
                'openings'           => $job->openings ?: 1,
                'created_at_human'   => $job->created_at ? $job->created_at->diffForHumans() : 'Recently',
                'match_percent'      => $job->match_percent ?? null,
                'match_reasons'      => $job->match_reasons ?? [],
                'can_apply'          => $job->can_apply ?? true,
                'application_status' => $job->application_status ?? null,
            ];
        });
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