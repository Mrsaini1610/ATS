<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\JobController;

// Public Endpoints
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

// Protected Endpoints (Requires valid Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile Endpoints
    Route::get('/profile', [UserProfileController::class, 'getProfile']);
    Route::post('/profile/update', [UserProfileController::class, 'updateProfile']);

    // Resume Endpoints
    Route::post('/profile/upload-resume', [ResumeController::class, 'uploadResume']);
    Route::post('/profile/resume/delete/{id}', [ResumeController::class, 'deleteResume']); // Method POST kiya gaya
    Route::post('/profile/resume/{id}/set-default', [ResumeController::class, 'setDefaultResume']);

    // Education Endpoints
    Route::post('/profile/education', [EducationController::class, 'addEducation']);
    Route::post('/profile/education/{id}', [EducationController::class, 'deleteEducation']);

    // Experience Endpoints
    Route::post('/profile/experience', [ExperienceController::class, 'addExperience']);
    Route::post('/profile/experience/{id}', [ExperienceController::class, 'deleteExperience']);

    // Certificate Endpoints
    Route::post('/profile/certificate', [CertificateController::class, 'addCertificate']);
    Route::post('/profile/certificate/{id}', [CertificateController::class, 'deleteCertificate']);

    // Job Endpoints
    Route::get('/jobs', [JobController::class, 'getJobs']);
    Route::get('/jobs/{id}', [JobController::class, 'getJobDetail']);
    Route::post('/jobs/apply', [JobController::class, 'applyJob']);
});
