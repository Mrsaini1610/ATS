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

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
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


// ==========================================
// CANDIDATE & PUBLIC ROUTES
// ==========================================
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/job-search', [JobController::class, 'index'])->name('job.search');
Route::get('/categories', [PageController::class, 'getCategories'])->name('categories');
Route::get('/services', [PageController::class, 'getServices'])->name('services');
Route::get('/companies/{company}', [PageController::class, 'getCompany'])->name('companies.show');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact.show');
Route::post('/contact', [PageController::class, 'submitContact'])->name('contact.submit');
Route::get('/apps', [PageController::class, 'apps'])->name('app');

Route::get('/location/states', [LocationController::class, 'getState']);
Route::get('/location/cities', [LocationController::class, 'getCitybyState']);
Route::get('/location/towns', [LocationController::class, 'getTownsByCity']);
Route::post('/location/update', [LocationController::class, 'updateLocation']);

Route::middleware('candidate')->group(function () {
    Route::get('/login', [CandidateAuthController::class, 'showLogin'])->name('login');
    Route::post('/check-phone', [CandidateAuthController::class, 'checkPhoneLogin'])->name('check.phone');
    Route::post('/phone-login', [CandidateAuthController::class, 'phoneLogin'])->name('phone.login');

    Route::get('/register', [CandidateAuthController::class, 'showRegister'])->name('register');
    Route::post('/check-phone-register', [CandidateAuthController::class, 'checkPhoneRegister'])->name('check.phone.register');
    Route::post('/candidate-register', [CandidateAuthController::class, 'register'])->name('candidate.register');
});

Route::middleware('auth:web')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('/applications/{application}', [ProfileController::class, 'show'])->name('applications.show');

    Route::get('/savedjobs', fn () => Inertia::render('savedjobs'));
    Route::get('/notifications', fn () => Inertia::render('Notifications'));
    Route::get('/settings', fn () => Inertia::render('Settings'));
});

// ==========================================
// ADMIN PANEL ROUTES (Super Admin, Admin, Team Member)
// ==========================================
Route::prefix('admin')->name('admin.')->group(function () {

    // 1. Guest Routes (Login)
    Route::middleware(['guest:admin', 'no-cache'])->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login.submit');
    });

    // 2. Authenticated Admin Group
    Route::middleware(['admin.auth'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

        // Main Dashboard Route (Handles all roles dynamically)
        Route::get('/dashboard', [DashboardController::class, 'superAdminDashboard'])->name('dashboard');

        // Role-wise Dashboard Redirect Handlers
        Route::middleware(['admin.auth:super_admin'])->prefix('super')->name('super.')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'superAdminDashboard'])->name('dashboard');

            // Staff & Role Management (Super Admin Exclusive)
            Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
            Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
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
        Route::get('/notifications', fn () => Inertia::render('Admin/AdminNotifications'))->name('notifications');

        // 2. Job Posts & Moderation
        Route::get('/jobs', [AdminJobController::class, 'index'])->name('jobs.index');
        Route::get('/jobs/create', [AdminJobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs/{uuid}/update-status', [AdminJobController::class, 'updateStatus'])->name('jobs.update-status');
        Route::post('/jobs/{uuid}/assign-team', [AdminJobController::class, 'assignTeam'])->name('jobs.assign-team');

        // 3. Applications
        Route::get('/applications', [JobApplicationController::class, 'index'])->name('applications.index');
        Route::post('/applications/{application}/status', [JobApplicationController::class, 'updateStatus'])->name('applications.update-status');
        Route::post('/applications/{application}/assign', [JobApplicationController::class, 'assign'])->name('applications.assign');
        Route::post('/applications/{application}/remark', [JobApplicationController::class, 'updateRemark'])->name('applications.update-remark');
        Route::post('/applications/{application}/offer', [JobApplicationController::class, 'saveOfferDetails'])->name('applications.save-offer');

        // Staff & Team (URL: /admin/team)
        Route::get('/team', [StaffController::class, 'index'])->name('team.index');
        Route::post('/team', [StaffController::class, 'store'])->name('team.store');
        Route::post('/team/{admin}/toggle-status', [StaffController::class, 'toggleStatus'])->name('team.toggle-status');
        Route::delete('/team/{admin}', [StaffController::class, 'destroy'])->name('team.destroy');

        // 4. Candidates / Users
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

        // 5. Interviews
        Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');
        Route::post('/interviews', [InterviewController::class, 'store'])->name('interviews.store');
        Route::post('/interviews/{interview}/status', [InterviewController::class, 'updateStatus'])->name('interviews.update-status');
        Route::post('/interviews/{interview}/remark', [InterviewController::class, 'updateRemark'])->name('interviews.update-remark');

        // 6. Tasks Workflow
        Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::post('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');

        // 7. Bulk Messages / Notifications
        Route::get('/bulk', [BulkMessageController::class, 'index'])->name('bulk.index');
        Route::post('/bulk/send', [BulkMessageController::class, 'send'])->name('bulk.send');

        // 8. Companies
        Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
        Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
        Route::put('/companies/{company}', [CompanyController::class, 'update'])->name('companies.update');
        Route::post('/companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->name('companies.toggle-status');
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');

        // 9. Categories
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // 10. Skills
        Route::get('/skills', [SkillController::class, 'index'])->name('skills.index');
        Route::post('/skills', [SkillController::class, 'store'])->name('skills.store');
        Route::put('/skills/{skill}', [SkillController::class, 'update'])->name('skills.update');
        Route::post('/skills/{skill}/toggle-status', [SkillController::class, 'toggleStatus'])->name('skills.toggle-status');
        Route::delete('/skills/{skill}', [SkillController::class, 'destroy'])->name('skills.destroy');

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