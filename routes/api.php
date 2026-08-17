<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\JobController;

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
            Route::get('/', 'getProfile');
            Route::post('/update', 'updateProfile');
        });

        // Resume
        Route::controller(ResumeController::class)->group(function () {
            Route::post('/upload-resume', 'uploadResume');
            Route::post('/resume/delete/{id}', 'deleteResume');
            Route::post('/resume/{id}/set-default', 'setDefaultResume');
        });

        // Education
        Route::controller(EducationController::class)->prefix('education')->group(function () {
            Route::get('/', 'getEducation');
            Route::post('/', 'addEducation');
            Route::post('/{id}', 'deleteEducation');
        });

        // Experience
        Route::controller(ExperienceController::class)->prefix('experience')->group(function () {
            Route::get('/', 'getExperience');
            Route::post('/', 'addExperience');
            Route::post('/{id}', 'deleteExperience');
        });

        // Certificate
        Route::controller(CertificateController::class)->prefix('certificate')->group(function () {
            Route::get('/', 'getCertificate');
            Route::post('/', 'addCertificate');
            Route::post('/{id}', 'deleteCertificate');
        });
    });

    // --------------------------------------
    // Job Section Group (/jobs/...)
    // --------------------------------------
    Route::controller(JobController::class)->prefix('jobs')->group(function () {
        Route::get('/', 'getJobs');
        Route::get('/{id}', 'getJobDetail');
        Route::post('/apply', 'applyJob');
    });

});