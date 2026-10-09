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

Route::get('/sitemap.xml', [PageController::class, 'sitemap'])->name('sitemap');

Route::get('/apply/{job}', [JobController::class, 'apply'])->name('jobs.apply');
Route::post('/apply/{job}', [JobController::class, 'submitApplication'])->name('jobs.apply.submit');

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

    Route::get('/my-applications', [JobController::class, 'myApplications'])->name('my-applications');

    Route::get('/applied-jobs', fn() => redirect()->route('my-applications'))->name('applied-jobs');
    Route::get('/applied', fn() => redirect()->route('my-applications'));
    Route::get('/applications', fn() => redirect()->route('my-applications'))->name('applications');
    Route::get('/my-application', fn() => redirect()->route('my-applications'));
    Route::get('/my-jobs', fn() => redirect()->route('my-applications'));

    Route::delete('/my-applications/{id}/withdraw', [JobController::class, 'withdrawApplication'])->name('my-applications.withdraw');

    Route::get('/savedjobs', [JobController::class, 'savedJobs'])->name('savedjobs');

    Route::post('/jobs/{job}/save', [JobController::class, 'saveJob'])->name('jobs.save');
    Route::post('/jobs/{job}/unsave', [JobController::class, 'unsaveJob'])->name('jobs.unsave');
    Route::delete('/saved-jobs/{job}', [JobController::class, 'deleteSavedJob'])->name('jobs.saved.delete');

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
        Route::get('/profile', [AdminPageController::class, 'profile'])->name('profile');
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
        Route::post('/team', [StaffController::class, 'store'])->middleware('permission:create_team_member,view_team_member')->name('team.store');
        Route::put('/team/{admin}', [StaffController::class, 'update'])->middleware('permission:edit_team_member,view_team_member')->name('team.update');
        Route::post('/team/{admin}/toggle-status', [StaffController::class, 'toggleStatus'])->middleware('permission:status_team_member,view_team_member')->name('team.toggle-status');
        Route::delete('/team/{admin}', [StaffController::class, 'destroy'])->middleware('permission:delete_team_member,view_team_member')->name('team.destroy');
        Route::post('/team/{admin}/assign-admin', [StaffController::class, 'assignAdmin'])->name('team.assign-admin');

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
Route::get('/clear', [PageController::class, 'clearCache'])->name('clear.cache');
