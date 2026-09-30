<?php

// Include auth routes
require __DIR__.'/auth.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Candidate\HomeController;
use App\Http\Controllers\Candidate\JobController;
use App\Http\Controllers\Candidate\PageController;
use App\Http\Controllers\Auth\CandidateAuthController;
use App\Http\Controllers\Candidate\ProfileController;
use App\Http\Controllers\Candidate\LocationController;
use App\Http\Controllers\Candidate\NotificationController;

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AdminJobController;
use App\Http\Controllers\Admin\InterviewController;
use App\Http\Controllers\Admin\JobApplicationController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\BulkMessageController;
use App\Http\Controllers\Admin\SkillController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\AdminPageController;
use App\Http\Controllers\Admin\AdminNotificationController;


// ==========================================
// CANDIDATE & PUBLIC ROUTES
// ==========================================
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/jobs', [JobController::class, 'index'])->name('jobs');
Route::get('/job', fn() => redirect()->route('job.listings'));
Route::get('/job-search', [JobController::class, 'index'])->name('job.search');
Route::get('/job-listings', [JobController::class, 'index'])->name('job.listings');
Route::get('/public/jobs', [JobController::class, 'index'])->name('public.jobs');
Route::get('/categories', [PageController::class, 'getCategories'])->name('categories');
Route::get('/category', fn() => redirect()->route('categories'));
Route::get('/companies', [PageController::class, 'companies'])->name('companies');
Route::get('/company', fn() => redirect()->route('companies'));
Route::get('/services', [PageController::class, 'getServices'])->name('services');
Route::get('/service', fn() => redirect()->route('services'));
Route::get('/companies/{company}', [PageController::class, 'getCompany'])->name('companies.show');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/about-us', fn() => redirect()->route('about'));
Route::get('/mobile-app', [PageController::class, 'apps'])->name('mobile.app');
Route::get('/apps', [PageController::class, 'apps']);
Route::get('/app', fn() => redirect()->route('mobile.app'));
Route::get('/contact', [PageController::class, 'contact'])->name('contact.show');
Route::get('/contact-us', fn() => redirect()->route('contact.show'));
Route::post('/contact', [PageController::class, 'submitContact'])->name('contact.submit');

// Legal, Trust & Information Pages
Route::get('/privacy-policy', [PageController::class, 'privacy'])->name('privacy');
Route::get('/privacy', fn() => redirect()->route('privacy'));

Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/terms-and-conditions', fn() => redirect()->route('terms'));
Route::get('/terms-of-service', fn() => redirect()->route('terms'));

Route::get('/faq', [PageController::class, 'faq'])->name('faq');
Route::get('/faqs', fn() => redirect()->route('faq'));

Route::get('/cookies', [PageController::class, 'cookies'])->name('cookies');
Route::get('/cookie-policy', fn() => redirect()->route('cookies'));

Route::get('/sitemap.xml', function () {
    $baseUrl = url('/');
    $now = now()->toAtomString();

    $jobs = \App\Models\JobPost::where('status', 'approved')
        ->latest('updated_at')
        ->get(['uuid', 'updated_at']);

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

    $staticPages = [
        ['url' => '', 'priority' => '1.0', 'changefreq' => 'daily'],
        ['url' => '/jobs', 'priority' => '0.9', 'changefreq' => 'hourly'],
        ['url' => '/job-search', 'priority' => '0.9', 'changefreq' => 'hourly'],
        ['url' => '/companies', 'priority' => '0.8', 'changefreq' => 'daily'],
        ['url' => '/categories', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/services', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/about', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ['url' => '/contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ['url' => '/faq', 'priority' => '0.7', 'changefreq' => 'weekly'],
        ['url' => '/privacy-policy', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ['url' => '/terms', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ['url' => '/cookies', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ['url' => '/mobile-app', 'priority' => '0.6', 'changefreq' => 'monthly'],
    ];

    foreach ($staticPages as $p) {
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($baseUrl . $p['url']) . "</loc>\n";
        $xml .= "    <lastmod>{$now}</lastmod>\n";
        $xml .= "    <changefreq>{$p['changefreq']}</changefreq>\n";
        $xml .= "    <priority>{$p['priority']}</priority>\n";
        $xml .= "  </url>\n";
    }

    foreach ($jobs as $j) {
        $lastmod = $j->updated_at ? $j->updated_at->toAtomString() : $now;
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/apply/' . $j->uuid) . "</loc>\n";
        $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>0.8</priority>\n";
        $xml .= "  </url>\n";
    }

    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'text/xml');
});

Route::get('/apply/{job}', function ($jobKey) {
    $job = \App\Models\JobPost::where('uuid', $jobKey)->first() ?: \App\Models\JobPost::find($jobKey);
    if (!$job) {
        return redirect()->route('job.listings');
    }
    $user = \Illuminate\Support\Facades\Auth::guard('web')->user();

    if ($user) {
        $alreadyApplied = \App\Models\JobApplication::where('candidate_id', $user->id)
            ->where('job_id', $job->id)
            ->exists();
        if ($alreadyApplied) {
            return redirect()->route('my-applications')->with('success', 'You have already applied for this job. You can track its live status below.');
        }
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
})->name('jobs.apply');

Route::post('/apply/{job}', function (\Illuminate\Http\Request $request, $jobKey) {
    $job = \App\Models\JobPost::where('uuid', $jobKey)->first() ?: \App\Models\JobPost::find($jobKey);
    if (!$job) {
        return back()->withErrors(['message' => 'Job not found.']);
    }
    $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
    if (!$user) {
        return redirect()->route('login');
    }

    $alreadyApplied = \App\Models\JobApplication::where('candidate_id', $user->id)
        ->where('job_id', $job->id)
        ->exists();

    if ($alreadyApplied) {
        return back()->with('submitted', true);
    }

    $resumePath = null;
    if ($request->hasFile('cvFile')) {
        $resumePath = $request->file('cvFile')->store('resumes', 'public');
    } else {
        $defaultResume = $user->defaultResume ?? $user->resumes()->latest()->first();
        $resumePath = $defaultResume?->file_path;
    }

    \App\Models\JobApplication::create([
        'candidate_id'         => $user->id,
        'job_id'               => $job->id,
        'resume_url'           => $resumePath ? asset('storage/' . $resumePath) : null,
        'cover_letter'         => $request->input('coverLetter') ?: $request->input('whyApply'),
        'candidate_name'       => $request->input('fullName') ?: ($user->full_name ?? $user->name),
        'candidate_email'      => $request->input('email') ?: $user->email,
        'candidate_phone'      => $request->input('phone') ?: $user->phone,
        'candidate_skills'     => $user->skills,
        'candidate_experience' => $request->input('experience') ?: $user->total_experience_years,
        'status'               => 'applied'
    ]);

    return back()->with('submitted', true);
})->name('jobs.apply.submit');

Route::get('/location/states', [LocationController::class, 'getState']);
Route::get('/location/cities', [LocationController::class, 'getCitybyState']);
Route::get('/location/towns', [LocationController::class, 'getTownsByCity']);
Route::get('/location/areas-by-city', [LocationController::class, 'getAreasByCityName']);
Route::post('/location/update', [LocationController::class, 'updateLocation']);
Route::get('/login', [CandidateAuthController::class, 'showLogin'])->name('login');
Route::get('/register', [CandidateAuthController::class, 'showLogin'])->name('register');

Route::post('/check-phone', [CandidateAuthController::class, 'checkPhoneLogin'])->name('check.phone');
Route::post('/phone-login', [CandidateAuthController::class, 'phoneLogin'])->name('phone.login');
Route::post('/candidate/complete-profile', [CandidateAuthController::class, 'completeProfile'])->name('candidate.complete-profile');
Route::post('/check-phone-register', [CandidateAuthController::class, 'checkPhoneRegister'])->name('check.phone.register');
Route::post('/candidate-logout', [CandidateAuthController::class, 'logout'])->name('candidate.logout');

Route::middleware('auth:web')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::get('/user/profile', [ProfileController::class, 'index']);
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar');
    Route::post('/profile/education', [ProfileController::class, 'saveEducation'])->name('profile.education.save');
    Route::delete('/profile/education/{id}', [ProfileController::class, 'deleteEducation'])->name('profile.education.delete');
    Route::post('/profile/experience', [ProfileController::class, 'saveExperience'])->name('profile.experience.save');
    Route::delete('/profile/experience/{id}', [ProfileController::class, 'deleteExperience'])->name('profile.experience.delete');
    Route::post('/profile/certificate', [ProfileController::class, 'saveCertificate'])->name('profile.certificate.save');
    Route::delete('/profile/certificate/{id}', [ProfileController::class, 'deleteCertificate'])->name('profile.certificate.delete');
    Route::post('/profile/resume', [ProfileController::class, 'uploadResume'])->name('profile.resume.upload');
    Route::get('/profile/resume/download', [ProfileController::class, 'downloadResume'])->name('profile.resume.download');
    Route::get('/applications/{application}', [ProfileController::class, 'show'])->name('applications.show');

    Route::get('/my-applications', function () {
        $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $allApplications = \App\Models\JobApplication::where('candidate_id', $user->id)->get();
        $statusCounts = [
            'all' => $allApplications->count(),
            'applied' => $allApplications->where('status', 'applied')->count(),
            'viewed' => $allApplications->where('status', 'viewed')->count(),
            'shortlisted' => $allApplications->filter(fn($a) => in_array($a->status, ['shortlisted', 'calling_approved', 'offer_letter_generated', 'interview_scheduled']))->count(),
            'hired' => $allApplications->where('status', 'hired')->count(),
            'rejected' => $allApplications->filter(fn($a) => in_array($a->status, ['rejected', 'calling_rejected', 'not_selected']))->count(),
        ];

        $applications = \App\Models\JobApplication::with(['job', 'jobPost'])
            ->where('candidate_id', $user->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Candidate/MyApplications', [
            'applications' => $applications,
            'statusCounts' => $statusCounts,
        ]);
    })->name('my-applications');

    Route::get('/applied-jobs', fn() => redirect()->route('my-applications'))->name('applied-jobs');
    Route::get('/applied', fn() => redirect()->route('my-applications'));
    Route::get('/applications', fn() => redirect()->route('my-applications'))->name('applications');
    Route::get('/my-application', fn() => redirect()->route('my-applications'));
    Route::get('/my-jobs', fn() => redirect()->route('my-applications'));

    Route::delete('/my-applications/{id}/withdraw', function ($id) {
        $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $application = \App\Models\JobApplication::where('candidate_id', $user->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('uuid', $id);
            })
            ->first();
        if ($application) {
            $application->delete();
            return back()->with('success', 'Application withdrawn successfully.');
        }
        return back()->with('error', 'Application not found.');
    })->name('my-applications.withdraw');

    Route::get('/savedjobs', function () {
        $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $appliedApplications = \App\Models\JobApplication::with('jobPost')->where('candidate_id', $user->id)->get();
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

        $savedJobs = \App\Models\SavedJob::where('user_uuid', $user->uuid)
            ->latest()
            ->get()
            ->map(function ($sj) use ($appliedJobIds) {
                $job = \App\Models\JobPost::where('uuid', $sj->job_uuid)->first()
                    ?: \App\Models\JobPost::find($sj->job_uuid);
                if (!$job) return null;
                $salaryText = 'Competitive';
                if ($job->min_salary && $job->max_salary) {
                    $salaryText = '₹' . number_format($job->min_salary) . ' - ₹' . number_format($job->max_salary);
                } elseif ($job->min_salary) {
                    $salaryText = '₹' . number_format($job->min_salary) . '+';
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
    })->name('savedjobs');

    Route::post('/jobs/{job}/save', function ($jobId) {
        $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $job = \App\Models\JobPost::find($jobId) ?: \App\Models\JobPost::where('uuid', $jobId)->first();
        if ($job) {
            \App\Models\SavedJob::firstOrCreate([
                'user_uuid' => $user->uuid,
                'job_uuid'  => $job->uuid,
            ]);
        }
        return back();
    })->name('jobs.save');

    Route::post('/jobs/{job}/unsave', function ($jobId) {
        $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $job = \App\Models\JobPost::find($jobId) ?: \App\Models\JobPost::where('uuid', $jobId)->first();
        $targetUuids = array_filter([(string) $jobId, $job?->uuid]);
        \App\Models\SavedJob::where('user_uuid', $user->uuid)
            ->whereIn('job_uuid', $targetUuids)
            ->delete();
        return back();
    })->name('jobs.unsave');

    Route::delete('/saved-jobs/{job}', function ($jobId) {
        $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $job = \App\Models\JobPost::find($jobId) ?: \App\Models\JobPost::where('uuid', $jobId)->first();
        $targetUuids = array_filter([(string) $jobId, $job?->uuid]);
        \App\Models\SavedJob::where('user_uuid', $user->uuid)
            ->whereIn('job_uuid', $targetUuids)
            ->delete();
        return back();
    })->name('jobs.saved.delete');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'clearAll'])->name('notifications.clear');

    Route::get('/saved-jobs', fn() => redirect()->route('savedjobs'))->name('saved-jobs');
    Route::get('/saved_jobs', fn() => redirect()->route('savedjobs'));
    Route::get('/saved', fn() => redirect()->route('savedjobs'));

    Route::get('/settings', fn () => redirect()->route('profile'));
});

// ==========================================
// ADMIN PANEL ROUTES (Super Admin, Admin, Team Member)
// ==========================================
Route::get('/admin', fn () => redirect()->route('admin.dashboard'));
Route::prefix('admin')->name('admin.')->group(function () {

    // 1. Guest Routes (Login)
    Route::middleware(['guest:admin', 'no-cache'])->group(function () {
        Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
    });

    // 2. Authenticated Admin Group
    Route::middleware(['admin.auth'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Main Dashboard Route (Handles all roles dynamically)
        Route::get('/dashboard', [DashboardController::class, 'superAdminDashboard'])->name('dashboard');

        // Role-wise Dashboard Redirect Handlers
        Route::middleware(['admin.auth:super_admin'])->prefix('super')->name('super.')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'superAdminDashboard'])->name('dashboard');

            // Staff & Role Management (Super Admin Exclusive)
            Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
            Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
            Route::put('/staff/{admin}', [StaffController::class, 'update'])->name('staff.update');
            Route::post('/staff/{admin}/toggle-status', [StaffController::class, 'toggleStatus'])->name('staff.toggle-status');
            Route::delete('/staff/{admin}', [StaffController::class, 'destroy'])->name('staff.destroy');
        });

        Route::middleware(['admin.auth:team_member,super_admin'])->prefix('member')->name('member.')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'teamMemberDashboard'])->name('dashboard');
        });

        // ==========================================
        // SIDEBAR NAVIGATION PAGES
        // ==========================================

        // 1. Profile & Notifications
        Route::get('/profile', fn () => Inertia::render('Admin/AdminProfile'))->name('profile');
        Route::put('/profile', [AdminPageController::class, 'updateProfile'])->name('profile.update');
        Route::put('/profile/password', [AdminPageController::class, 'updatePassword'])->name('profile.password');
        Route::get('/notifications', [AdminNotificationController::class, 'index'])->name('notifications');
        Route::post('/notifications', [AdminNotificationController::class, 'store'])->name('notifications.store');
        Route::post('/notifications/read-all', [AdminNotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::post('/notifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
        Route::delete('/notifications/{notification}', [AdminNotificationController::class, 'destroy'])->name('notifications.destroy');

        // 2. Job Posts & Moderation
        Route::get('/jobs', [AdminJobController::class, 'index'])->middleware('permission:view_jobs,view_all_jobs,create_jobs,approve_jobs,reject_jobs,hold_jobs,deactivate_jobs')->name('jobs.index');
        Route::get('/jobs/create', [AdminJobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [AdminJobController::class, 'store'])->middleware('permission:create_jobs')->name('jobs.store'); // Agar store method bhi hai
        Route::post('/jobs/{uuid}/update-status', [AdminJobController::class, 'updateStatus'])->middleware('permission:approve_jobs,reject_jobs,hold_jobs,deactivate_jobs')->name('jobs.update-status');
        Route::post('/jobs/{uuid}/assign-team', [AdminJobController::class, 'assignTeam'])->name('jobs.assign-team');

        // 3. Applications
        Route::get('/applications', [JobApplicationController::class, 'index'])->middleware('permission:view_applications,view_all_applications,update_application_status')->name('applications.index');
        Route::post('/applications/{application}/status', [JobApplicationController::class, 'updateStatus'])->middleware('permission:update_application_status')->name('applications.update-status');
        Route::post('/applications/{application}/assign', [JobApplicationController::class, 'assign'])->middleware('permission:update_application_status')->name('applications.assign');
        Route::post('/applications/{application}/remark', [JobApplicationController::class, 'updateRemark'])->middleware('permission:update_application_status')->name('applications.update-remark');
        Route::post('/applications/{application}/offer', [JobApplicationController::class, 'saveOfferDetails'])->middleware('permission:update_application_status')->name('applications.save-offer');

        // Staff & Team (URL: /admin/team)
        Route::get('/team', [StaffController::class, 'index'])->middleware('permission:view_team_member,create_team_member,edit_team_member,status_team_member,delete_team_member')->name('team.index');
        Route::post('/team', [StaffController::class, 'store'])->middleware('permission:create_team_member')->name('team.store');
        Route::put('/team/{admin}', [StaffController::class, 'update'])->middleware('permission:edit_team_member')->name('team.update');
        Route::post('/team/{admin}/toggle-status', [StaffController::class, 'toggleStatus'])->middleware('permission:status_team_member')->name('team.toggle-status');
        Route::delete('/team/{admin}', [StaffController::class, 'destroy'])->middleware('permission:delete_team_member')->name('team.destroy');

        // 4. Candidates / Users
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:view_users,view_all_users,add_users,status_users')->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:add_users')->name('users.store');
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware('permission:status_users')->name('users.toggle-status');

        // 5. Interviews
        Route::get('/interviews', [InterviewController::class, 'index'])->middleware('permission:view_interviews,view_all_interviews,schedule_interviews,status_interviews')->name('interviews.index');
        Route::post('/interviews', [InterviewController::class, 'store'])->middleware('permission:schedule_interviews')->name('interviews.store');
        Route::post('/interviews/{interview}/status', [InterviewController::class, 'updateStatus'])->middleware('permission:status_interviews')->name('interviews.update-status');
        Route::post('/interviews/{interview}/remark', [InterviewController::class, 'updateRemark'])->middleware('permission:status_interviews')->name('interviews.update-remark');

        // 6. Tasks Workflow
        Route::get('/tasks', [TaskController::class, 'index'])->middleware('permission:view_tasks,view_all_tasks,assign_tasks,status_tasks')->name('tasks.index');
        Route::post('/tasks', [TaskController::class, 'store'])->middleware('permission:assign_tasks')->name('tasks.store');
        Route::post('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->middleware('permission:status_tasks')->name('tasks.update-status');

        // 7. Bulk Messages / Notifications
        Route::get('/bulk', [BulkMessageController::class, 'index'])->middleware('permission:send_bulk_messages')->name('bulk.index');
        Route::post('/bulk/send', [BulkMessageController::class, 'send'])->name('bulk.send');

        // 8. Companies
        Route::get('/companies', [CompanyController::class, 'index'])->middleware('permission:view_companies,create_companies,edit_companies,status_companies,delete_companies')->name('companies.index');
        Route::post('/companies', [CompanyController::class, 'store'])->middleware('permission:create_companies')->name('companies.store');
        Route::put('/companies/{company}', [CompanyController::class, 'update'])->middleware('permission:edit_companies')->name('companies.update');
        Route::post('/companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->middleware('permission:status_companies')->name('companies.toggle-status');
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->middleware('permission:delete_companies')->name('companies.destroy');

        // 9. Categories & Subcategories
        Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:view_categories,create_categories,edit_categories,status_categories,delete_categories,view_subcategories,create_subcategories,edit_subcategories,status_subcategories,delete_subcategories')->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:create_categories')->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('permission:edit_categories')->name('categories.update');
        Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->middleware('permission:status_categories')->name('categories.toggle-status');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:delete_categories')->name('categories.destroy');
        Route::post('/categories/{category}/subcategories', [CategoryController::class, 'storeSubcategory'])->middleware('permission:create_subcategories')->name('categories.subcategories.store');
        Route::put('/categories/{category}/subcategories/{subCategory}', [CategoryController::class, 'updateSubcategory'])->middleware('permission:edit_subcategories')->name('categories.subcategories.update');
        Route::post('/categories/{category}/subcategories/{subCategory}/toggle-status', [CategoryController::class, 'toggleStatusSubcategory'])->middleware('permission:status_subcategories')->name('categories.subcategories.toggle-status');
        Route::delete('/categories/{category}/subcategories/{subCategory}', [CategoryController::class, 'destroySubcategory'])->middleware('permission:delete_subcategories')->name('categories.subcategories.destroy');

        // 10. Skills
        Route::get('/skills', [SkillController::class, 'index'])->middleware('permission:view_skills,create_skills,edit_skills,status_skills,delete_skills')->name('skills.index');
        Route::post('/skills', [SkillController::class, 'store'])->middleware('permission:create_skills')->name('skills.store');
        Route::put('/skills/{skill}', [SkillController::class, 'update'])->middleware('permission:edit_skills')->name('skills.update');
        Route::post('/skills/{skill}/toggle-status', [SkillController::class, 'toggleStatus'])->middleware('permission:status_skills')->name('skills.toggle-status');
        Route::delete('/skills/{skill}', [SkillController::class, 'destroy'])->middleware('permission:delete_skills')->name('skills.destroy');

        // 11. Permissions & Access Control (Super Admin Exclusive)
        Route::middleware(['admin.auth:super_admin'])->group(function () {
            Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
            Route::put('/permissions/{admin}', [PermissionController::class, 'update'])->name('permissions.update');
        });

    }); // Closing Authenticated Admin Group
});

// ==========================================
// UTILITY / CACHE ROUTES
// ==========================================
Route::get('/clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    Artisan::call('optimize:clear');
    return 'Application cache and routes cleared successfully!';
});
