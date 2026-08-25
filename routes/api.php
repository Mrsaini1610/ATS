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
use App\Http\Controllers\Api\CityController;
// use App\Http\Controllers\Api\TownController;

// Route::get('/sync-towns', [TownController::class, 'syncTownsFromOverpass']);

Route::get('/import-cities', [CityController::class, 'importCities']);
Route::get('/sync-states', [CityController::class, 'fetchAndSyncStates']);
Route::get('/sync-cities', [CityController::class, 'fetchAndSyncCities']);

Route::post('/find-towns-by-city', [CityController::class, 'getTownsByCity']);



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
Route::post('/find-state', [CityController::class, 'getState']);
Route::post('/find-cityby-state', [CityController::class, 'getCitybyState']);
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

        // Resume Section (All POST with body payloads)
        Route::controller(ResumeController::class)->group(function () {
            Route::post('/resume', 'getResumes');
            Route::post('/resume-upload', 'uploadResume');
            Route::post('/resume-set-default', 'setDefaultResume'); // Body: { "uuid": "..." }
            Route::post('/resume-delete', 'deleteResume');          // Body: { "uuid": "..." }
        });

        // Education
        Route::controller(EducationController::class)->group(function () {
            Route::post('/education', 'getEducations');
            Route::post('/education-add', 'addEducation');
            Route::post('/education-update/{id}', 'updateEducation');
            Route::post('/education-delete/{id}', 'deleteEducation');
        });

        // Experience
        Route::controller(ExperienceController::class)->group(function () {
            Route::post('/experience', 'getExperiences');
            Route::post('/experience-add', 'addExperience');
            Route::post('/experience-update/{id}', 'updateExperience');
            Route::post('/experience-delete/{id}', 'deleteExperience');
        });

        // Certificate
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
        Route::post('/saved', 'getSavedJobs');
        Route::post('/save-toggle', 'toggleSaveJob');
        Route::post('/detail/{uuid}', 'getJobDetail');
        Route::post('/apply', 'applyJob');
        Route::post('/applied-jobs', 'getAppliedJobs');
    });

    // --------------------------------------
    // Company Section Group
    // --------------------------------------
    Route::controller(CompanyController::class)->group(function () {
        Route::post('/getcompanies', 'getCompanyDetail');
    });

    // --------------------------------------
    // Category Section Group
    // --------------------------------------
    Route::controller(CategoryController::class)->group(function () {
        Route::post('/categories', 'getCategories');
        Route::post('/category-filter', 'getCategoryByUuid');
    });

});
