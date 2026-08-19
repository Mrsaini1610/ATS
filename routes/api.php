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

        // User Profile (/profile, /profile/update)
        Route::controller(UserProfileController::class)->group(function () {
            Route::get('/', 'getProfile');
            Route::post('/update', 'updateProfile');
        });

        // Resume (/profile/resume/...)
        Route::controller(ResumeController::class)->prefix('resume')->group(function () {
            Route::get('/', 'getResumes');                         // GET  /profile/resume
            Route::post('/upload', 'uploadResume');                // POST /profile/resume/upload
            Route::post('/update/{id}', 'updateResume');           // POST /profile/resume/update/{id}
            Route::post('/delete/{id}', 'deleteResume');           // POST /profile/resume/delete/{id}
            Route::post('/{id}/set-default', 'setDefaultResume');  // POST /profile/resume/{id}/set-default
        });

        // Education (/profile/education/...)
        Route::controller(EducationController::class)->prefix('education')->group(function () {
            Route::get('/', 'getEducations');                      // GET  /profile/education
            Route::post('/', 'addEducation');                      // POST /profile/education
            Route::post('/update/{id}', 'updateEducation');        // POST /profile/education/update/{id}
            Route::post('/delete/{id}', 'deleteEducation');        // POST /profile/education/delete/{id}
        });

        // Experience (/profile/experience/...)
        Route::controller(ExperienceController::class)->prefix('experience')->group(function () {
            Route::get('/', 'getExperiences');                     // GET  /profile/experience
            Route::post('/', 'addExperience');                     // POST /profile/experience
            Route::post('/update/{id}', 'updateExperience');       // POST /profile/experience/update/{id}
            Route::post('/delete/{id}', 'deleteExperience');       // POST /profile/experience/delete/{id}
        });

        // Certificate (/profile/certificate/...)
        Route::controller(CertificateController::class)->prefix('certificate')->group(function () {
            Route::get('/', 'getCertificates');                    // GET  /profile/certificate
            Route::post('/', 'addCertificate');                    // POST /profile/certificate
            Route::post('/update/{id}', 'updateCertificate');      // POST /profile/certificate/update/{id}
            Route::post('/delete/{id}', 'deleteCertificate');      // POST /profile/certificate/delete/{id}
        });
    });

    // --------------------------------------
    // Job Section Group (/jobs/...)
    // --------------------------------------
    Route::controller(JobController::class)->prefix('find-job')->group(function () {
        Route::post('/', 'getJobs');
        Route::post('/filter', 'filterJobs');
        Route::get('/saved', 'getSavedJobs');        // GET  /jobs/saved (Saved jobs list)
        Route::post('/save-toggle', 'toggleSaveJob');// POST /jobs/save-toggle (Save / Unsave)
        Route::get('/{uuid}', 'getJobDetail');
        Route::post('/apply', 'applyJob');
    });


    // --------------------------------------
    // Company Section Group (/companies/...)
    // --------------------------------------
    Route::controller(CompanyController::class)->prefix('companies')->group(function () {
        Route::get('/{uuid}', 'getCompanyDetail'); // GET /companies/{uuid}
    });

    
});
