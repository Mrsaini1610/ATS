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
        Route::get('/jobs', [AdminJobController::class, 'index'])->middleware('permission:create_jobs,approve_jobs,reject_jobs,hold_jobs,deactivate_jobs')->name('jobs.index');
        Route::get('/jobs/create', [AdminJobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [AdminJobController::class, 'store'])->middleware('permission:create_jobs')->name('jobs.store'); // Agar store method bhi hai
        Route::post('/jobs/{uuid}/update-status', [AdminJobController::class, 'updateStatus'])->middleware('permission:approve_jobs,reject_jobs,hold_jobs,deactivate_jobs')->name('jobs.update-status');
        Route::post('/jobs/{uuid}/assign-team', [AdminJobController::class, 'assignTeam'])->middleware('permission:manage_permissions')->name('jobs.assign-team');

        // 3. Applications
        Route::get('/applications', [JobApplicationController::class, 'index'])->middleware('permission:view_applications,update_application_status')->name('applications.index');
        Route::post('/applications/{application}/status', [JobApplicationController::class, 'updateStatus'])->middleware('permission:update_application_status')->name('applications.update-status');
        Route::post('/applications/{application}/assign', [JobApplicationController::class, 'assign'])->middleware('permission:update_application_status')->name('applications.assign');
        Route::post('/applications/{application}/remark', [JobApplicationController::class, 'updateRemark'])->middleware('permission:update_application_status')->name('applications.update-remark');
        Route::post('/applications/{application}/offer', [JobApplicationController::class, 'saveOfferDetails'])->middleware('permission:update_application_status')->name('applications.save-offer');

        // Staff & Team (URL: /admin/team)
        Route::get('/team', [StaffController::class, 'index'])->middleware('permission:view_team_member')->name('team.index');
        Route::post('/team', [StaffController::class, 'store'])->name('team.store');
        Route::post('/team/{admin}/toggle-status', [StaffController::class, 'toggleStatus'])->name('team.toggle-status');
        Route::delete('/team/{admin}', [StaffController::class, 'destroy'])->name('team.destroy');

        // 4. Candidates / Users
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:add_users,view_users,call_users,delete_user')->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

        // 5. Interviews
        Route::get('/interviews', [InterviewController::class, 'index'])->middleware('permission:view_interviews')->name('interviews.index');
        Route::post('/interviews', [InterviewController::class, 'store'])->name('interviews.store');
        Route::post('/interviews/{interview}/status', [InterviewController::class, 'updateStatus'])->name('interviews.update-status');
        Route::post('/interviews/{interview}/remark', [InterviewController::class, 'updateRemark'])->name('interviews.update-remark');

        // 6. Tasks Workflow
        Route::get('/tasks', [TaskController::class, 'index'])->middleware('permission:assign_tasks,view_tasks,complete_tasks')->name('tasks.index');
        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::post('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');

        // 7. Bulk Messages / Notifications
        Route::get('/bulk', [BulkMessageController::class, 'index'])->middleware('permission:send_bulk_messages')->name('bulk.index');
        Route::post('/bulk/send', [BulkMessageController::class, 'send'])->name('bulk.send');

        // 8. Companies
        Route::get('/companies', [CompanyController::class, 'index'])->middleware('permission:view_companies')->name('companies.index');
        Route::post('/companies', [CompanyController::class, 'store'])->middleware('permission:create_companies')->name('companies.store');
        Route::put('/companies/{company}', [CompanyController::class, 'update'])->middleware('permission:edit_companies')->name('companies.update');
        Route::post('/companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->middleware('permission:edit_companies')->name('companies.toggle-status');
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->middleware('permission:delete_companies')->name('companies.destroy');

        // 9. Categories & Subcategories
        Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:view_categories')->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:create_categories')->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('permission:edit_categories')->name('categories.update');
        Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->middleware('permission:edit_categories')->name('categories.toggle-status');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:delete_categories')->name('categories.destroy');
        Route::post('/categories/{category}/subcategories', [CategoryController::class, 'storeSubcategory'])->middleware('permission:create_subcategories')->name('categories.subcategories.store');
        Route::put('/categories/{category}/subcategories/{subCategory}', [CategoryController::class, 'updateSubcategory'])->middleware('permission:edit_subcategories')->name('categories.subcategories.update');
        Route::delete('/categories/{category}/subcategories/{subCategory}', [CategoryController::class, 'destroySubcategory'])->middleware('permission:delete_subcategories')->name('categories.subcategories.destroy');

        // 10. Skills
        Route::get('/skills', [SkillController::class, 'index'])->middleware('permission:view_skills')->name('skills.index');
        Route::post('/skills', [SkillController::class, 'store'])->middleware('permission:create_skills')->name('skills.store');
        Route::put('/skills/{skill}', [SkillController::class, 'update'])->middleware('permission:edit_skills')->name('skills.update');
        Route::post('/skills/{skill}/toggle-status', [SkillController::class, 'toggleStatus'])->middleware('permission:edit_skills')->name('skills.toggle-status');
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
