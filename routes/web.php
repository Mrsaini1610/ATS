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


// Candidate / Public 
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/job-search', [JobController::class, 'index'])->name('job.search');
Route::get('/categories', [PageController::class, 'getCategories'])->name('categories');
Route::get('/services', [PageController::class, 'getServices'])->name('services');
Route::get('/companies/{company}', [PageController::class, 'getCompany'])->name('companies.show');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact.show');
Route::post('/contact', [PageController::class, 'submitContact'])->name('contact.submit');
Route::get('/apps',[PageController::class,'apps'])->name('app');



Route::middleware('candidate')->group(function () {
    Route::get('/login', [CandidateAuthController::class, 'showLogin'])->name('login');
    Route::post('/check-phone', [CandidateAuthController::class, 'checkPhoneLogin'])->name('check.phone');
    Route::post('/phone-login', [CandidateAuthController::class, 'phoneLogin'])->name('phone.login');

    Route::get('/register', [CandidateAuthController::class, 'showRegister'])->name('register');
    Route::post('/check-phone-register', [CandidateAuthController::class, 'checkPhoneRegister'])->name('check.phone.register');
    Route::post('/candidate-register', [CandidateAuthController::class, 'register'])->name('candidate.register');
});



Route::middleware('auth:web')->group(function () {

    Route::get('/profile', [ProfileController::class, 'index'])
        ->name('profile');

    Route::get('/profile/edit', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::post('/profile/update', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::get('/applications/{application}', [ProfileController::class, 'show'])
        ->name('applications.show');

    Route::get('/savedjobs', fn () => Inertia::render('savedjobs'));
    Route::get('/notifications', fn () => Inertia::render('Notifications'));
    Route::get('/settings', fn () => Inertia::render('Settings'));

});






// /** SUPER ADMIN ROUTES START HERE **/
// Route::prefix('super')->name('super.')->group(function () {
//     // Public routes (no auth required)
//     Route::middleware('authorized:superadmin')->group(function () {
//         Route::redirect('/login', '/login');
//         Route::post('/verify', [AdminAuthController::class, 'verify'])->name('verify');
//         Route::get('/forgot-password', [AdminAuthController::class, 'forgotPassword'])->name('forgotPassword');
//     });

//     // Protected routes (auth required)
//     Route::middleware('auth.superadmin')->group(function () {
//         // Profile routes
//         Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
//         Route::post('/logout', [AdminDashboardController::class, 'logout'])->name('logout');
//         Route::get('/profile', [AdminDashboardController::class, 'userProfile'])->name('profile');
//         Route::post('/profile-update', [AdminDashboardController::class, 'userProfileUpdate'])->name('profile.update');
//         Route::post('/profile/photo/update', [AdminDashboardController::class, 'userProfilePhotoUpdate'])->name('profile.photo.update');
//         Route::post('/profile/photo/remove', [AdminDashboardController::class, 'userProfilePhotoRemove'])->name('profile.photo.remove');
//         Route::post('/profile/password/update', [AdminDashboardController::class, 'userProfilePasswordUpdate'])->name('profile.password.update');

//         Route::group(['prefix' => 'notifications', 'as' => 'notifications.'], function () {
//             Route::get('/api/unread-count', [AdminDashboardController::class, 'notificationsUnreadCount'])->name('api.unread_count');
//             Route::get('/api/list', [AdminDashboardController::class, 'notificationsList'])->name('api.list');
//             Route::patch('/api/{notification}/read', [AdminDashboardController::class, 'notificationsMarkRead'])->name('api.read');
//             Route::patch('/api/read-all', [AdminDashboardController::class, 'notificationsMarkAllRead'])->name('api.read_all');
//             Route::delete('/api/{notification}', [AdminDashboardController::class, 'notificationsDelete'])->name('api.delete');
//             Route::delete('/api/delete-all', [AdminDashboardController::class, 'notificationsDeleteAll'])->name('api.delete_all');
//         });

//         // Resume Builder routes
//         Route::get('/resumes', [SuperResumeController::class, 'index'])->name('resumes.index');
//         Route::get('/resumes/create', [SuperResumeController::class, 'create'])->name('resumes.create');
//         Route::post('/resumes', [SuperResumeController::class, 'store'])->name('resumes.store');
//         Route::get('/resumes/{resume}', [SuperResumeController::class, 'show'])->name('resumes.show');
//         Route::get('/resumes/{resume}/edit', [SuperResumeController::class, 'edit'])->name('resumes.edit');
//         Route::post('/resumes/{resume}', [SuperResumeController::class, 'update'])->name('resumes.update');
//         Route::delete('/resumes/{resume}', [SuperResumeController::class, 'destroy'])->name('resumes.destroy');

//         // Departments Route
//         Route::get('/departments', [DepartmentController::class, 'departments'])->name('departments');
//         Route::post('/departments/add', [DepartmentController::class, 'addDepartments'])->name('add.departments');
//         Route::put('/update-departments/{uuid?}', [DepartmentController::class, 'addDepartments'])->name('update.departments');
//         Route::post('/update-status/{uuid}', [DepartmentController::class, 'updateStatus'])->name('status.departments');
//         Route::delete('departments/{id}', [DepartmentController::class, 'destroy'])->name('department.destroy');

//         // Roles Route
//         Route::prefix('role')->name('role.')->group(function () {
//             Route::get('/list', [RolesController::class, 'list'])->name('list');
//             Route::post('/add', [RolesController::class, 'addRole'])->name('add');
//             Route::put('/{uuid}/update', [RolesController::class, 'addRole'])->name('update');
//             Route::delete('/{id}', [RolesController::class, 'destroy'])->name('destroy');
//             Route::post('/update-status/{uuid}', [RolesController::class, 'updateStatus'])->name('status');
//         });

//         // Designation Routes
//         Route::group(['prefix' => 'designation', 'as' => 'designation.'], function () {
//             Route::get('/list', [DesignationController::class, 'index'])->name('list');
//             Route::post('/store', [DesignationController::class, 'store'])->name('store');
//             Route::put('/update/{id}', [DesignationController::class, 'store'])->name('update');
//             Route::delete('/{id}', [DesignationController::class, 'destroy'])->name('destroy');
//             Route::post('/update-status/{uuid}', [DesignationController::class, 'updateStatus'])->name('status');
//         });

//         Route::group(['prefix' => 'settings', 'as' => 'settings.'], function () {
//             Route::get('/', [SiteSettingController::class, 'index'])->name('index');
//             Route::get('/list', [SiteSettingController::class, 'list'])->name('list');
//             Route::post('/update', [SiteSettingController::class, 'update'])->name('update');
//         });

//         Route::get('/designations/by-departments', [MemberController::class, 'getByDepartments'])->name('designations.by_departments');

//         Route::group(['prefix' => 'members', 'as' => 'members.'], function () {
//             Route::get('/list', [MemberController::class, 'index'])->name('list');
//             Route::post('/store', [MemberController::class, 'store'])->name('store');
//             Route::put('/update/{id}', [MemberController::class, 'store'])->name('update');
//             Route::post('/{member}/assign-admin', [MemberController::class, 'assignAdmin'])->name('assign-admin');
//             Route::delete('/{uuid}', [MemberController::class, 'destroy'])->name('destroy');
//             Route::post('/update-status/{uuid}', [MemberController::class, 'updateStatus'])->name('status');
//             Route::put('/{member}/password', [MemberController::class, 'updatePassword'])->name('password');
//             Route::get('/{uuid}/details', [MemberController::class, 'memberDetails'])->name('details');
//         });

//         // Job Requests Routes (Super Admin)
//         Route::group(['prefix' => 'job-requests', 'as' => 'job.requests.'], function () {
//             Route::get('/', [JobRequestController::class, 'index'])->name('index');
//             Route::get('/all-jobs', [JobRequestController::class, 'allJobs'])->name('all.jobs');
//             Route::get('/api/all', [JobRequestController::class, 'getAllRequests'])->name('api.all');
//             Route::get('/api/pending', [JobRequestController::class, 'getPendingRequests'])->name('api.pending');
//             Route::get('/api/statistics', [JobRequestController::class, 'getStatistics'])->name('api.statistics');
//             Route::get('/api/{job}', [JobRequestController::class, 'show'])->name('api.show');
//             Route::patch('/api/{job}/approve', [JobRequestController::class, 'approve'])->name('api.approve');
//             Route::patch('/api/{job}/reject', [JobRequestController::class, 'reject'])->name('api.reject');
//             Route::patch('/api/{job}/request-changes', [JobRequestController::class, 'requestChanges'])->name('api.request_changes');
//             Route::post('/api/{job}/update', [JobRequestController::class, 'update'])->name('api.update');
//             Route::patch('/api/{job}/toggle-status', [JobRequestController::class, 'toggleStatus'])->name('api.toggle-status');
//             Route::patch('/api/{job}/close', [JobRequestController::class, 'close'])->name('api.close');
//             Route::delete('/api/{job}', [JobRequestController::class, 'destroy'])->name('api.destroy');
//             Route::patch('/api/applications/{application}/decision', [JobRequestController::class, 'applicationDecision'])->name('api.applications.decision');
//         });

//         // Job Applications Routes (From Main Branch)
//         Route::group(['prefix' => 'job-applications', 'as' => 'job.applications.'], function () {
//             Route::get('/', [JobRequestController::class, 'applicationsIndex'])->name('index');
//             Route::get('/api/list', [JobRequestController::class, 'listApplications'])->name('api.list');
//             Route::patch('/api/{application}/status', [JobRequestController::class, 'updateApplicantStatus'])->name('api.status');
//             Route::get('/api/{application}/resume-preview', [JobRequestController::class, 'previewApplicantResume'])->name('api.resume-preview');
//         });

       
//         Route::group(['prefix' => 'contact-messages', 'as' => 'contact.messages.'], function () {
//             Route::get('/', [ContactMessageController::class, 'index'])->name('index');
//             Route::patch('/{message}/toggle-read', [ContactMessageController::class, 'toggleRead'])->name('toggle-read');
//             Route::delete('/{message}', [ContactMessageController::class, 'destroy'])->name('destroy');
//         });

//     });
// });


// /** SUPER ADMIN ROUTES END HERE **/

// /** ADMIN ROUTES START HERE **/
// Route::prefix('admin')->middleware(['admin'])->group(function () {
//     // Profile routes
//     Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('admin.dashboard');
//     Route::get('/tasks/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('admin.task.dashboard');
//     Route::get('/tasks/tasklist', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('admin.task.tasklist');

//     Route::get('/members/dashboard', [App\Http\Controllers\Admin\AdminMemberController::class, 'dashboard'])->name('admin.members.dashboard');
//     Route::post('/members/store', [App\Http\Controllers\Admin\AdminMemberController::class, 'store'])->name('admin.members.store');
//     Route::post('/members/{member}/update-status', [App\Http\Controllers\Admin\AdminMemberController::class, 'updateStatus'])->name('admin.members.update-status');
//     Route::get('/members/{uuid}/details', [App\Http\Controllers\Admin\AdminMemberController::class, 'memberDetails'])->name('admin.members.details');
//     Route::get('/designations/by-departments', [App\Http\Controllers\Admin\AdminMemberController::class, 'getByDepartments'])->name('admin.designations.by_departments');

//     Route::post('/checkin', [App\Http\Controllers\Member\CheckInOutController::class, 'checkIn'])->name('admin.checkin');
//     Route::post('/checkout', [App\Http\Controllers\Member\CheckInOutController::class, 'checkOut'])->name('admin.checkout');

//     Route::get('/resumes', [ResumeController::class, 'index'])->name('admin.resumes.index');
//     Route::get('/resumes/create', [ResumeController::class, 'create'])->name('admin.resumes.create');
//     Route::post('/resumes', [ResumeController::class, 'store'])->name('admin.resumes.store');
//     Route::get('/resumes/{resume}', [ResumeController::class, 'show'])->name('admin.resumes.show');
//     Route::get('/resumes/{resume}/edit', [ResumeController::class, 'edit'])->name('admin.resumes.edit');
//     Route::post('/resumes/{resume}', [ResumeController::class, 'update'])->name('admin.resumes.update');
//     Route::delete('/resumes/{resume}', [ResumeController::class, 'destroy'])->name('admin.resumes.destroy');

//     // Job Posts routes
//     Route::get('/job-posts', [JobController::class, 'index'])->name('admin.job.posts.index');
//     Route::get('/job-listing', [JobController::class, 'listing'])->name('admin.job.posts.listing');

//     // Job Applicants routes (Your Version)
//     Route::get('/job-applicants', [JobController::class, 'applicants'])->name('admin.job.applicants');

//     // Job Applications routes (From Main Branch)
//     Route::get('/job-applications', [JobController::class, 'applicationsIndex'])->name('admin.job.applications.index');
//     Route::get('/calling-team', [CallingTeamController::class, 'index'])->name('admin.calling-team.index');
//     Route::post('/calling-team', [CallingTeamController::class, 'store'])->name('admin.calling-team.store');
//     Route::post('/calling-team/{member}/status', [CallingTeamController::class, 'updateStatus'])->name('admin.calling-team.status');

//     // Job API routes
//     Route::get('/api/jobs', [JobController::class, 'getAdminJobs'])->name('admin.api.jobs.list');
//     Route::post('/api/jobs', [JobController::class, 'store'])->name('admin.api.jobs.store');
//     Route::post('/api/jobs/{job}', [JobController::class, 'update'])->name('admin.api.jobs.update');
//     Route::delete('/api/jobs/{job}', [JobController::class, 'destroy'])->name('admin.api.jobs.destroy');
//     Route::patch('/api/jobs/{job}/resend', [JobController::class, 'resend'])->name('admin.api.jobs.resend');
//     Route::patch('/api/jobs/{job}/toggle-status', [JobController::class, 'toggleStatus'])->name('admin.api.jobs.toggle-status');
//     Route::get('/api/jobs/{job}/applications', [JobController::class, 'applications'])->name('admin.api.jobs.applications');
//     Route::patch('/api/applications/{application}/decision', [JobController::class, 'applicationDecision'])->name('admin.api.applications.decision');

//     // Job Applicants API routes (Your Version)
//     Route::get('/api/job-applicants', [JobController::class, 'getApplicants'])->name('admin.api.job.applicants.list');
//     Route::get('/api/job-applicants/{application}', [JobController::class, 'getApplicantDetails'])->name('admin.api.job.applicants.details');
//     Route::get('/api/job-applicants/{application}/resume-preview', [JobController::class, 'previewApplicantResume'])->name('admin.api.job.applicants.resume-preview');
//     Route::patch('/api/job-applicants/{application}/status', [JobController::class, 'updateApplicantStatus'])->name('admin.api.job.applicants.status');
//     Route::patch('/api/job-applicants/{application}/admin-final-review', [JobController::class, 'adminFinalReview'])->name('admin.api.job.applicants.admin-final-review');
//     Route::patch('/api/job-applicants/{application}/generate-offer-letter', [JobController::class, 'generateOfferLetter'])->name('admin.api.job.applicants.generate-offer-letter');
//     Route::get('/api/job-applicants/{application}/download-offer-letter', [JobController::class, 'downloadOfferLetter'])->name('admin.api.job.applicants.download-offer-letter');
//     Route::patch('/api/job-applicants/{application}/send-offer-letter', [JobController::class, 'sendOfferLetterEmail'])->name('admin.api.job.applicants.send-offer-letter');
//     Route::patch('/api/job-applicants/{application}/assign-calling-team', [JobController::class, 'assignCallingTeam'])->name('admin.api.job.applicants.assign-calling-team');
//     Route::get('/api/calling-team-members', [CallingTeamController::class, 'membersList'])->name('admin.api.calling-team.members');

//     // Job Applications API route (From Main Branch)
//     Route::get('/api/applications', [JobController::class, 'listApplications'])->name('admin.api.applications.list');

//     Route::get('/api/notifications/unread-count', [App\Http\Controllers\Admin\AdminController::class, 'notificationsUnreadCount'])->name('admin.api.notifications.unread_count');
//     Route::get('/api/notifications/list', [App\Http\Controllers\Admin\AdminController::class, 'notificationsList'])->name('admin.api.notifications.list');
//     Route::patch('/api/notifications/{notification}/read', [App\Http\Controllers\Admin\AdminController::class, 'notificationsMarkRead'])->name('admin.api.notifications.read');
//     Route::patch('/api/notifications/read-all', [App\Http\Controllers\Admin\AdminController::class, 'notificationsMarkAllRead'])->name('admin.api.notifications.read_all');
//     Route::delete('/api/notifications/{notification}', [App\Http\Controllers\Admin\AdminController::class, 'notificationsDelete'])->name('admin.api.notifications.delete');
//     Route::delete('/api/notifications/delete-all', [App\Http\Controllers\Admin\AdminController::class, 'notificationsDeleteAll'])->name('admin.api.notifications.delete_all');

//     Route::post('/logout', [App\Http\Controllers\Admin\AdminController::class, 'logout'])->name('admin.logout');
//     Route::get('/profile', [App\Http\Controllers\Admin\AdminController::class, 'userProfile'])->name('admin.profile');
//     Route::post('/profile-update', [App\Http\Controllers\Admin\AdminController::class, 'userProfileUpdate'])->name('admin.profile.update');
//     Route::post('/profile/photo/update', [App\Http\Controllers\Admin\AdminController::class, 'userProfilePhotoUpdate'])->name('admin.profile.photo.update');
//     Route::post('/profile/password/update', [App\Http\Controllers\Admin\AdminController::class, 'userProfilePasswordUpdate'])->name('admin.profile.password.update');
//     Route::post('/profile/photo/remove', [App\Http\Controllers\Admin\AdminController::class, 'userProfilePhotoRemove'])->name('admin.profile.photo.remove');
// });
// /** ADMIN ROUTES END HERE **/

// /** CALLING TEAM ROUTES START HERE **/
// Route::prefix('calling-team')->group(function () {
//     Route::middleware('authorized:callingteam')->group(function () {
//         Route::get('/login', [CallingTeamAuthController::class, 'login'])->name('callingteam.login');
//         Route::post('/verify', [CallingTeamAuthController::class, 'verify'])->name('callingteam.verify');
//     });

//     Route::middleware(['callingteam'])->group(function () {
//         Route::get('/dashboard', [CallingTeamPortalController::class, 'dashboard'])->name('callingteam.dashboard');
//         Route::get('/profile', [CallingTeamPortalController::class, 'userProfile'])->name('callingteam.profile');
//         Route::post('/profile-update', [CallingTeamPortalController::class, 'userProfileUpdate'])->name('callingteam.profile.update');
//         Route::post('/profile/photo/update', [CallingTeamPortalController::class, 'userProfilePhotoUpdate'])->name('callingteam.profile.photo.update');
//         Route::post('/profile/photo/remove', [CallingTeamPortalController::class, 'userProfilePhotoRemove'])->name('callingteam.profile.photo.remove');
//         Route::post('/profile/password/update', [CallingTeamPortalController::class, 'userProfilePasswordUpdate'])->name('callingteam.profile.password.update');
//         Route::get('/applications', [CallingTeamPortalController::class, 'listApplications'])->name('callingteam.applications.list');
//         Route::get('/applications/{application}', [CallingTeamPortalController::class, 'show'])->name('callingteam.applications.show');
//         Route::patch('/applications/{application}/call-outcome', [CallingTeamPortalController::class, 'updateCallOutcome'])->name('callingteam.applications.call-outcome');
//         Route::patch('/applications/{application}/schedule-interview', [CallingTeamPortalController::class, 'scheduleInterview'])->name('callingteam.applications.schedule-interview');
//         Route::patch('/applications/{application}/final-decision', [CallingTeamPortalController::class, 'finalDecision'])->name('callingteam.applications.final-decision');

//         Route::get('/api/notifications/unread-count', [App\Http\Controllers\Admin\AdminController::class, 'notificationsUnreadCount'])->name('callingteam.api.notifications.unread_count');
//         Route::get('/api/notifications/list', [App\Http\Controllers\Admin\AdminController::class, 'notificationsList'])->name('callingteam.api.notifications.list');
//         Route::patch('/api/notifications/{notification}/read', [App\Http\Controllers\Admin\AdminController::class, 'notificationsMarkRead'])->name('callingteam.api.notifications.read');
//         Route::patch('/api/notifications/read-all', [App\Http\Controllers\Admin\AdminController::class, 'notificationsMarkAllRead'])->name('callingteam.api.notifications.read_all');
//         Route::delete('/api/notifications/{notification}', [App\Http\Controllers\Admin\AdminController::class, 'notificationsDelete'])->name('callingteam.api.notifications.delete');
//         Route::delete('/api/notifications/delete-all', [App\Http\Controllers\Admin\AdminController::class, 'notificationsDeleteAll'])->name('callingteam.api.notifications.delete_all');

//         Route::post('/logout', [CallingTeamPortalController::class, 'logout'])->name('callingteam.logout');
//     });
// });
// /** CALLING TEAM ROUTES END HERE **/

// /** MEMBER ROUTES START HERE **/
// Route::prefix('member')->middleware(['member'])->group(function () {
//     // Profile routes
//     Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('member.dashboard');
//     Route::get('/tasks/dashboard', [App\Http\Controllers\Member\MemberTaskController::class, 'dashboard'])->name('member.task.dashboard');
//     Route::get('/tasks/tasklist', [App\Http\Controllers\Member\MemberTaskController::class, 'taskList'])->name('member.task.tasklist');

//     Route::post('/checkin', [App\Http\Controllers\Member\CheckInOutController::class, 'checkIn'])->name('member.checkin');
//     Route::post('/checkout', [App\Http\Controllers\Member\CheckInOutController::class, 'checkOut'])->name('member.checkout');
//     Route::post('/logout', [App\Http\Controllers\Admin\AdminController::class, 'logout'])->name('member.logout');
//     Route::get('/profile', [App\Http\Controllers\Member\MemberTaskController::class, 'userProfile'])->name('member.profile');
//     Route::post('/profile-update', [App\Http\Controllers\Member\MemberTaskController::class, 'userProfileUpdate'])->name('member.profile.update');
//     Route::post('/profile/photo/update', [App\Http\Controllers\Member\MemberTaskController::class, 'userProfilePhotoUpdate'])->name('member.profile.photo.update');
//     Route::post('/profile/password/update', [App\Http\Controllers\Member\MemberTaskController::class, 'userProfilePasswordUpdate'])->name('member.profile.password.update');
//     Route::post('/profile/photo/remove', [App\Http\Controllers\Member\MemberTaskController::class, 'userProfilePhotoRemove'])->name('member.profile.photo.remove');

//         // Candidate Job Portal Routes
//         Route::get('/jobs', [App\Http\Controllers\Member\CandidateJobController::class, 'index'])->name('member.jobs.index');
//         Route::get('/jobs/{job}', [App\Http\Controllers\Member\CandidateJobController::class, 'show'])->name('member.jobs.show');
//         Route::post('/jobs/{job}/apply', [App\Http\Controllers\Member\CandidateJobController::class, 'apply'])->name('member.jobs.apply');
//         Route::post('/jobs/{job}/save', [App\Http\Controllers\Member\CandidateJobController::class, 'save'])->name('member.jobs.save');
//         Route::post('/jobs/{job}/unsave', [App\Http\Controllers\Member\CandidateJobController::class, 'unsave'])->name('member.jobs.unsave');
//         Route::get('/api/profile-completion', [App\Http\Controllers\Member\CandidateJobController::class, 'profileCompletion'])->name('member.api.profile-completion');
//         Route::get('/my-applications', [App\Http\Controllers\Member\CandidateJobController::class, 'myApplications'])->name('member.applications.index');
//         Route::delete('/applications/{application}/withdraw', [App\Http\Controllers\Member\CandidateJobController::class, 'withdraw'])->name('member.applications.withdraw');

//     Route::get('/api/notifications/unread-count', [App\Http\Controllers\Admin\AdminController::class, 'notificationsUnreadCount'])->name('member.api.notifications.unread_count');
//     Route::get('/api/notifications/list', [App\Http\Controllers\Admin\AdminController::class, 'notificationsList'])->name('member.api.notifications.list');
//     Route::patch('/api/notifications/{notification}/read', [App\Http\Controllers\Admin\AdminController::class, 'notificationsMarkRead'])->name('member.api.notifications.read');
//     Route::patch('/api/notifications/read-all', [App\Http\Controllers\Admin\AdminController::class, 'notificationsMarkAllRead'])->name('member.api.notifications.read_all');
//     Route::delete('/api/notifications/{notification}', [App\Http\Controllers\Admin\AdminController::class, 'notificationsDelete'])->name('member.api.notifications.delete');
//     Route::delete('/api/notifications/delete-all', [App\Http\Controllers\Admin\AdminController::class, 'notificationsDeleteAll'])->name('member.api.notifications.delete_all');
// });
// /** MEMBER ROUTES END HERE **/

// /** PUBLIC ROUTES START HERE **/
// Route::get('/', [HomeController::class, 'authShowPage'])->name('home');
// Route::get('/homepage', [HomeController::class, 'showHomepage'])->name('homepage');
// Route::get('/jobs', [HomeController::class, 'jobs'])->name('jobs.index');
// Route::get('/companies', [HomeController::class, 'companies'])->name('companies.index');
// Route::get('/about', [HomeController::class, 'about'])->name('about');
// Route::get('/contact', [HomeController::class, 'contact'])->name('contact.show');
// Route::post('/contact', [HomeController::class, 'submitContact'])->name('contact.submit');
// Route::get('/register', function() {
//     return Inertia::render('Register');
// })->name('register');
// Route::get('/login', [AdminAuthController::class, 'login'])->name('login');
// Route::post('/verify', [AdminAuthController::class, 'verify'])->name('auth.login');
// Route::post('/member-verify', [AdminAuthController::class, 'memberVerify'])->name('member.verify');
// Route::redirect('/admin/login', '/login')->name('admin.login');
// Route::redirect('/member/login', '/login')->name('doer.login');

// // Password Reset Routes
// Route::get('/forget-password', [HomeController::class, 'forgetPassword'])->name('password.request');
// Route::get('/super-forget-password', [HomeController::class, 'superForgetPassword'])->name('super.password.request');
// Route::post('/check-email', [HomeController::class, 'checkEmail'])->name('auth.checkEmail');
// Route::post('/super-check-email', [HomeController::class, 'superCheckEmail'])->name('super.auth.checkEmail');
// Route::post('/forgot-password', [HomeController::class, 'sendResetLink'])->name('password.email');
// Route::post('/super-forgot-password', [HomeController::class, 'superSendResetLink'])->name('super.password.email');
// Route::get('/reset-password/{token}', [HomeController::class, 'showResetForm'])->name('password.reset');
// Route::get('/super-reset-password/{token}', [HomeController::class, 'superShowResetForm'])->name('super.password.reset');
// Route::post('/reset-password', [HomeController::class, 'resetPassword'])->name('password.update');
// Route::post('/super-reset-password', [HomeController::class, 'superResetPassword'])->name('super.password.update');
// /** PUBLIC ROUTES END HERE **/

// /** UTILITY ROUTES START HERE **/
// Route::get('/migrate', function () {
//     Artisan::call('migrate');
//     return response()->json(['migrated']);
// });

// Route::get('seed', function () {
//     Artisan::call('db:seed');
//     return response()->json(['seeded']);
// });

// Route::get('/clear', function () {
//     Artisan::call('cache:clear');
//     Artisan::call('route:cache');
//     Artisan::call('view:clear');
//     Artisan::call('optimize:clear');
//     return 'Application cache has been cleared';
// });

/** UTILITY ROUTES END HERE **/
