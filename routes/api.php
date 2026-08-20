<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CategoryController;

// ==========================================
// Public Endpoints
// ==========================================
Route::controller(AuthController::class)->group(function () {
    Route::post('/send-otp', 'sendOtp');
    Route::post('/verify-otp', 'verifyOtp');
});

// ==========================================
// Protected Endpoints (Requires valid Bearer Token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/get-home-data', [JobController::class, 'getHomeData']);

    // --------------------------------------
    // Profile Section Group (/profile/...)
    // --------------------------------------
    Route::prefix('profile')->group(function () {

        // User Profile
        Route::controller(UserProfileController::class)->group(function () {
            Route::post('/', 'getProfile');
            Route::post('/update', 'updateProfile');
        });

        // Resume (/profile...)
        Route::controller(ResumeController::class)->group(function () {
            Route::post('/resume', 'getResumes');
            Route::post('/resume-upload', 'uploadResume');
            Route::post('/resume-update/{id}', 'updateResume');
            Route::post('/resume-delete/{id}', 'deleteResume');
            Route::post('/resume/{id}/set-default', 'setDefaultResume');
        });

        // Education (/profile/...)
        Route::controller(EducationController::class)->group(function () {
            Route::post('/education', 'getEducations');
            Route::post('/education-add', 'addEducation');
            Route::post('/education-update/{id}', 'updateEducation');
            Route::post('/education-delete/{id}', 'deleteEducation');
        });

        // Experience (/profile/experience/...)
        Route::controller(ExperienceController::class)->group(function () {
            Route::post('/experience', 'getExperiences');
            Route::post('/experience-add', 'addExperience');
            Route::post('/experience-update/{id}', 'updateExperience');
            Route::post('/experience-delete/{id}', 'deleteExperience');
        });

        // Certificate (/profile/certificate/...)
        Route::controller(CertificateController::class)->group(function () {
            Route::post('/certificate', 'getCertificates');
            Route::post('/certificate-add', 'addCertificate');
            Route::post('/certificate-update/{id}', 'updateCertificate');
            Route::post('/certificate-delete/{id}', 'deleteCertificate');
        });
    });

    // --------------------------------------
    // Job Section Group (/find-job/...)
    // --------------------------------------
    Route::controller(JobController::class)->prefix('find-job')->group(function () {
        Route::post('/', 'getJobs');
        Route::post('/filter', 'filterJobs');
        Route::get('/saved', 'getSavedJobs');
        Route::post('/save-toggle', 'toggleSaveJob');
        Route::get('/{uuid}', 'getJobDetail');
        Route::post('/apply', 'applyJob');
    });

    // --------------------------------------
    // Company Section Group (/companies/...)
    // --------------------------------------
    Route::controller(CompanyController::class)->group(function () {
        Route::post('/getcompanies', 'getCompanyDetail');
    });


    // --------------------------------------
    // Category Section Group (/categories/...)
    // --------------------------------------
    Route::controller(CategoryController::class)->group(function () {
        Route::post('/categories', 'getCategories');   // All categories + search filter
        Route::post('/category-filter', 'getCategoryByUuid');  // Single category by UUID (via body)
    });

});
