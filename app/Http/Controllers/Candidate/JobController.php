<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\SavedJob;
use App\Models\UserResume;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use App\Services\MailService;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        // 1. JobPost Query with active/approved status (excluding expired / is_deleted = 1)
        $query = JobPost::with(['category'])
            ->activeForCandidate();

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

        // 9. Fetch and format jobs data with sorting & UUID support
        $sort = strtolower((string) ($request->input('sort') ?? $request->query('sort') ?? 'latest'));
        if ($sort === 'popular' || $sort === 'most_applied') {
            $query->orderByDesc('applicants')->orderByDesc('id');
        } elseif ($sort === 'salary_high') {
            $query->orderByDesc('max_salary')->orderByDesc('id');
        } elseif ($sort === 'salary_low') {
            $query->orderBy('min_salary')->orderByDesc('id');
        } else {
            $query->latest('id');
        }

        $jobs = $query->get()->map(function ($job) use ($appliedJobMap, $appliedJobIds) {
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

            $salaryType = $job->salary_type ?: 'monthly';
            $unitLabel = match (strtolower((string) $salaryType)) {
                'monthly'    => 'month',
                'weekly'     => 'week',
                'quarterly'  => 'quarter',
                'halfyearly' => 'half-year',
                'yearly'     => 'year',
                default      => strtolower((string) $salaryType),
            };

            $salaryText = 'Competitive';
            if ($job->min_salary && $job->max_salary) {
                $minFmt = number_format((float) $job->min_salary);
                $maxFmt = number_format((float) $job->max_salary);
                $salaryText = ($job->min_salary == $job->max_salary)
                    ? "₹{$minFmt} / {$unitLabel}"
                    : "₹{$minFmt} - ₹{$maxFmt} / {$unitLabel}";
            } elseif ($job->min_salary) {
                $salaryText = "₹" . number_format((float) $job->min_salary) . "+ / {$unitLabel}";
            } elseif ($job->max_salary) {
                $salaryText = "Up to ₹" . number_format((float) $job->max_salary) . " / {$unitLabel}";
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
              ->where(function ($sub) {
                  $sub->where('is_deleted', 0)->orWhereNull('is_deleted');
              })
              ->where(function ($sub) {
                  $sub->whereNull('last_date')
                      ->orWhereDate('last_date', '>=', now()->toDateString());
              })
              ->whereNotNull('category_id');
        })
        ->withCount(['jobPosts' => function ($q) {
            $q->whereIn('job_posts.status', ['active', 'approved'])
              ->where(function ($sub) {
                  $sub->where('job_posts.is_deleted', 0)->orWhereNull('job_posts.is_deleted');
              })
              ->where(function ($sub) {
                  $sub->whereNull('job_posts.last_date')
                      ->orWhereDate('job_posts.last_date', '>=', now()->toDateString());
              });
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
        $locations = JobPost::activeForCandidate()
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->pluck('location')
            ->values();

        $jobTypes = JobPost::activeForCandidate()
            ->whereNotNull('job_type')
            ->where('job_type', '!=', '')
            ->distinct()
            ->pluck('job_type')
            ->values();

        $experiences = JobPost::activeForCandidate()
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

    public function apply($jobKey)
    {
        $job = JobPost::where('uuid', $jobKey)->first() ?: JobPost::find($jobKey);
        if (!$job) {
            return redirect()->route('job.listings');
        }

        if ($job->isExpired()) {
            return redirect()->route('job.listings')->with('error', 'This job posting has expired or is no longer available.');
        }

        $user = Auth::guard('web')->user();

        if ($user) {
            $alreadyApplied = JobApplication::where('candidate_id', $user->id)
                ->where('job_id', $job->id)
                ->exists();
            if ($alreadyApplied) {
                return redirect()->route('my-applications')->with('success', 'You have already applied for this job. You can track its live status below.');
            }

            $user->load([
                'resumes' => fn($q) => $q->where('is_delete', 0)->latest(),
                'defaultResume' => fn($q) => $q->where('is_delete', 0),
                'educations' => fn($q) => $q->where('is_delete', 0)->latest(),
            ]);
        }

        $qualifications = $job->qualifications;
        if (is_string($qualifications) && !empty($qualifications)) {
            $qualifications = str_contains($qualifications, "\n")
                ? array_filter(array_map('trim', explode("\n", $qualifications)))
                : array_filter(array_map('trim', explode(",", $qualifications)));
        }

        return Inertia::render('Candidate/JobApply', [
            'jobDataFromBackend' => [
                ...$job->toArray(),
                'id'           => $job->uuid,
                'uuid'         => $job->uuid,
                'requirements' => is_array($qualifications) ? array_values($qualifications) : [],
            ],
            'candidate' => $user,
            'loggedIn'  => (bool) $user,
        ]);
    }

    public function submitApplication(Request $request, $jobKey)
    {
        $job = JobPost::where('uuid', $jobKey)->first() ?: JobPost::find($jobKey);
        if (!$job || $job->isExpired()) {
            return back()->withErrors(['message' => 'This job posting has expired or is no longer available.']);
        }
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $resumeUrl = null;
        if ($request->hasFile('cvFile')) {
            $stored = $request->file('cvFile')->store('resumes', 'public');
            $resumeUrl = asset('storage/' . $stored);

            // Also save to user's resumes
            try {
                UserResume::create([
                    'user_uuid'  => $user->uuid,
                    'title'      => $request->file('cvFile')->getClientOriginalName(),
                    'file_path'  => 'storage/' . $stored,
                    'file_type'  => $request->file('cvFile')->getClientOriginalExtension(),
                    'is_default' => true,
                ]);
            } catch (\Throwable $e) {
                // Ignore resume table error
            }
        } elseif ($request->filled('selectedResumeId')) {
            $selectedResume = UserResume::where('user_uuid', $user->uuid)
                ->where(function ($q) use ($request) {
                    $q->where('id', $request->selectedResumeId)
                      ->orWhere('uuid', $request->selectedResumeId);
                })->first();

            if ($selectedResume && $selectedResume->file_path) {
                $fp = $selectedResume->file_path;
                if (str_starts_with($fp, 'http://') || str_starts_with($fp, 'https://')) {
                    $resumeUrl = $fp;
                } elseif (str_starts_with($fp, 'storage/')) {
                    $resumeUrl = asset($fp);
                } else {
                    $resumeUrl = asset('storage/' . $fp);
                }
            }
        } else {
            $defaultResume = $user->defaultResume ?? $user->resumes()->latest()->first();
            if ($defaultResume && $defaultResume->file_path) {
                $fp = $defaultResume->file_path;
                if (str_starts_with($fp, 'http://') || str_starts_with($fp, 'https://')) {
                    $resumeUrl = $fp;
                } elseif (str_starts_with($fp, 'storage/')) {
                    $resumeUrl = asset($fp);
                } else {
                    $resumeUrl = asset('storage/' . $fp);
                }
            }
        }

        // Parse Candidate Skills (array or string)
        $skillsInput = $request->input('skills');
        $candidateSkills = is_array($skillsInput)
            ? $skillsInput
            : (is_string($skillsInput) && !empty($skillsInput)
                ? array_filter(array_map('trim', explode(',', $skillsInput)))
                : ($user->skills ?? []));

        $appData = [
            'candidate_uuid'       => $user->uuid,
            'resume_url'           => $resumeUrl,
            'cover_letter'         => $request->input('coverLetter') ?: $request->input('whyApply'),
            'candidate_name'       => $request->input('fullName') ?: ($user->full_name ?? $user->name),
            'candidate_email'      => $request->input('email') ?: $user->email,
            'candidate_phone'      => $request->input('phone') ?: $user->phone,
            'candidate_skills'     => array_values($candidateSkills),
            'candidate_experience' => $request->input('experience') ?: $user->total_experience_years,
            'current_salary'       => $request->input('currentSalary'),
            'expected_salary'      => $request->input('expectedSalary'),
            'last_company'         => $request->input('lastCompany'),
            'notice_period'        => $request->input('notice'),
            'last_working_day'     => $request->input('lastWorkingDay') ?: null,
            'city'                 => $request->input('city'),
            'answers'              => [
                'currentTitle'        => $request->input('currentTitle'),
                'city'                => $request->input('city'),
                'experience'          => $request->input('experience'),
                'qualification'       => $request->input('qualification'),
                'educationDegree'     => $request->input('educationDegree'),
                'educationInstitute'  => $request->input('educationInstitute'),
                'skills'              => array_values($candidateSkills),
                'currentSalary'       => $request->input('currentSalary'),
                'expectedSalary'      => $request->input('expectedSalary'),
                'lastCompany'         => $request->input('lastCompany'),
                'notice'              => $request->input('notice'),
                'lastWorkingDay'      => $request->input('lastWorkingDay'),
                'selectedResumeId'    => $request->input('selectedResumeId'),
                'portfolio'           => $request->input('portfolio'),
                'linkedin'            => $request->input('linkedin'),
                'whyApply'            => $request->input('whyApply'),
            ],
            'status'               => 'applied'
        ];

        // Filter out fields that might not exist in the database table yet (e.g. if migrations are pending on live)
        try {
            $existingCols = Schema::getColumnListing('job_applications');
            if (!empty($existingCols)) {
                $appData = array_intersect_key($appData, array_flip($existingCols));
            }
        } catch (\Throwable $e) {
            // Fallback: ignore schema inspection failure
        }

        $application = JobApplication::updateOrCreate(
            [
                'candidate_id' => $user->id,
                'job_id'       => $job->id,
            ],
            $appData
        );

        if ($application->wasRecentlyCreated) {
            $job->increment('applicants');
        }

        // Update user profile with latest details
        try {
            $userUpdateData = array_filter([
                'full_name'              => $request->input('fullName'),
                'city'                   => $request->input('city'),
                'job_title'              => $request->input('currentTitle'),
                'total_experience_years' => $request->input('experience'),
                'current_ctc'            => $request->input('currentSalary'),
                'expected_ctc'           => $request->input('expectedSalary'),
                'notice_period_days'     => $request->input('notice'),
                'portfolio'              => $request->input('portfolio'),
                'linkedin'               => $request->input('linkedin'),
                'education'              => $request->input('educationDegree') ?: $request->input('qualification'),
            ]);
            if (!empty($candidateSkills)) {
                $userUpdateData['skills'] = array_values($candidateSkills);
            }
            $user->update($userUpdateData);
        } catch (\Throwable $e) {
            // Ignore user update error
        }

        // Trigger MailService: sends confirmation email to candidate, in-app + push,
        // and notifies Creator Admin, Assigned Team Member, and Super Admin via Email + In-App!
        try {
            MailService::sendJobApplied($application);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Web Candidate application email/notifications error: ' . $e->getMessage());
        }

        return redirect()->route('my-applications')->with('success', 'Your application has been submitted successfully.');
    }

    public function myApplications(Request $request)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $allApplications = JobApplication::where('candidate_id', $user->id)->get();
        $statusCounts = [
            'all' => $allApplications->count(),
            'applied' => $allApplications->where('status', 'applied')->count(),
            'viewed' => $allApplications->where('status', 'viewed')->count(),
            'shortlisted' => $allApplications->filter(fn($a) => in_array($a->status, ['shortlisted', 'calling_approved', 'offer_letter_generated', 'interview_scheduled']))->count(),
            'hired' => $allApplications->where('status', 'hired')->count(),
            'rejected' => $allApplications->filter(fn($a) => in_array($a->status, ['rejected', 'calling_rejected', 'not_selected']))->count(),
        ];

        $applications = JobApplication::with(['job', 'jobPost'])
            ->where('candidate_id', $user->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Candidate/MyApplications', [
            'applications' => $applications,
            'statusCounts' => $statusCounts,
        ]);
    }

    public function withdrawApplication($id)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $application = JobApplication::where('candidate_id', $user->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('uuid', $id);
            })
            ->first();
        if ($application) {
            $application->delete();
            return back()->with('success', 'Application withdrawn successfully.');
        }
        return back()->with('error', 'Application not found.');
    }

    public function savedJobs()
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $appliedApplications = JobApplication::with('jobPost')->where('candidate_id', $user->id)->get();
        $appliedJobIds = [];
        foreach ($appliedApplications as $app) {
            if ($app->job_id) {
                $appliedJobIds[] = (int) $app->job_id;
                $appliedJobIds[] = (string) $app->job_id;
            }
            if ($app->jobPost?->uuid) {
                $appliedJobIds[] = $app->jobPost->uuid;
            }
            if ($app->jobPost?->id) {
                $appliedJobIds[] = (int) $app->jobPost->id;
                $appliedJobIds[] = (string) $app->jobPost->id;
            }
        }
        $appliedJobIds = array_values(array_unique($appliedJobIds));

        $savedJobs = SavedJob::where('user_uuid', $user->uuid)
            ->latest()
            ->get()
            ->map(function ($sj) use ($appliedJobIds) {
                $job = JobPost::where('uuid', $sj->job_uuid)->first()
                    ?: JobPost::find($sj->job_uuid);
                if (!$job) return null;

                $salaryType = $job->salary_type ?: 'monthly';
                $unitLabel = match (strtolower((string) $salaryType)) {
                    'monthly'    => 'month',
                    'weekly'     => 'week',
                    'quarterly'  => 'quarter',
                    'halfyearly' => 'half-year',
                    'yearly'     => 'year',
                    default      => strtolower((string) $salaryType),
                };

                $salaryText = 'Competitive';
                if ($job->min_salary && $job->max_salary) {
                    $minFmt = number_format((float) $job->min_salary);
                    $maxFmt = number_format((float) $job->max_salary);
                    $salaryText = ($job->min_salary == $job->max_salary)
                        ? "₹{$minFmt} / {$unitLabel}"
                        : "₹{$minFmt} - ₹{$maxFmt} / {$unitLabel}";
                } elseif ($job->min_salary) {
                    $salaryText = "₹" . number_format((float) $job->min_salary) . "+ / {$unitLabel}";
                } elseif ($job->max_salary) {
                    $salaryText = "Up to ₹" . number_format((float) $job->max_salary) . " / {$unitLabel}";
                }

                $isApplied = in_array($job->id, $appliedJobIds) || in_array((string)$job->id, $appliedJobIds) || in_array($job->uuid, $appliedJobIds);

                return [
                    'id'                   => $job->id,
                    'uuid'                 => $job->uuid,
                    'title'                => $job->title,
                    'company'              => $job->company,
                    'company_about'        => $job->company_about,
                    'company_size'         => $job->company_size,
                    'company_image'        => $job->company_image,
                    'company_address'      => $job->company_address,
                    'location'             => $job->location,
                    'salary'               => $salaryText,
                    'salary_type'          => $job->salary_type,
                    'job_type'             => $job->job_type,
                    'type'                 => $job->job_type,
                    'openings'             => $job->openings ?: 1,
                    'experience'           => $job->experience ?: 'Fresher',
                    'exp'                  => $job->experience ?: 'Fresher',
                    'working_days'         => $job->working_days,
                    'shift_timing'         => $job->shift_timing,
                    'interview_details'    => $job->interview_details,
                    'skills'               => is_array($job->skills) ? $job->skills : (is_string($job->skills) ? (json_decode($job->skills, true) ?: []) : []),
                    'qualifications'       => is_array($job->qualifications) ? $job->qualifications : (is_string($job->qualifications) ? (json_decode($job->qualifications, true) ?: []) : []),
                    'requirements'         => is_array($job->qualifications) ? $job->qualifications : (is_string($job->qualifications) ? (json_decode($job->qualifications, true) ?: []) : []),
                    'perks'                => is_array($job->perks) ? $job->perks : (is_string($job->perks) ? (json_decode($job->perks, true) ?: []) : []),
                    'benefits'             => is_array($job->perks) ? $job->perks : (is_string($job->perks) ? (json_decode($job->perks, true) ?: []) : []),
                    'key_responsibilities' => is_array($job->key_responsibilities) ? $job->key_responsibilities : (is_string($job->key_responsibilities) ? (json_decode($job->key_responsibilities, true) ?: []) : []),
                    'desc'                 => $job->description,
                    'description'          => $job->description,
                    'posted'               => $job->created_at ? $job->created_at->diffForHumans() : 'Recently',
                    'created_at_human'     => $job->created_at ? $job->created_at->diffForHumans() : 'Recently',
                    'badge'                => $job->badge,
                    'hot'                  => ($job->badge === 'hot' || $job->badge === 'featured'),
                    'contact_person'       => $job->contact_person,
                    'contact_phone'        => $job->contact_phone,
                    'contact_email'        => $job->contact_email,
                    'is_applied'           => $isApplied,
                ];
            })->filter()->values();

        return Inertia::render('Candidate/savedjobs', [
            'savedJobs'   => $savedJobs,
            'appliedJobs' => $appliedJobIds,
        ]);
    }

    public function saveJob($jobId)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $job = JobPost::find($jobId) ?: JobPost::where('uuid', $jobId)->first();
        if ($job) {
            SavedJob::firstOrCreate([
                'user_uuid' => $user->uuid,
                'job_uuid'  => $job->uuid,
            ]);
        }
        return back();
    }

    public function unsaveJob($jobId)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $job = JobPost::find($jobId) ?: JobPost::where('uuid', $jobId)->first();
        $targetUuids = array_filter([(string) $jobId, $job?->uuid]);
        SavedJob::where('user_uuid', $user->uuid)
            ->whereIn('job_uuid', $targetUuids)
            ->delete();
        return back();
    }

    public function deleteSavedJob($jobId)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $job = JobPost::find($jobId) ?: JobPost::where('uuid', $jobId)->first();
        $targetUuids = array_filter([(string) $jobId, $job?->uuid]);
        SavedJob::where('user_uuid', $user->uuid)
            ->whereIn('job_uuid', $targetUuids)
            ->delete();
        return back();
    }
}