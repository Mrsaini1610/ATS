<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Support\Facades\Route;

// Public Endpoints
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

// Protected Endpoints (Requires valid Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Candidate Profile Routes
    Route::get('/profile', [UserProfileController::class, 'getProfile']); // Changed to GET (Recommended)
    Route::post('/profile/update', [UserProfileController::class, 'updateProfile']);
    
    // Resume Routes
    Route::post('/profile/upload-resume', [UserProfileController::class, 'uploadResume']);
    Route::delete('/profile/resume/{id}', [UserProfileController::class, 'deleteResume']);
    Route::post('/profile/resume/{id}/set-default', [UserProfileController::class, 'setDefaultResume']);

    // Education & Experience Routes (NEW)
    Route::post('/profile/education', [UserProfileController::class, 'addEducation']);
    Route::delete('/profile/education/{id}', [UserProfileController::class, 'deleteEducation']);
    
    Route::post('/profile/experience', [UserProfileController::class, 'addExperience']);
    Route::delete('/profile/experience/{id}', [UserProfileController::class, 'deleteExperience']);
    
    // Application Route
    Route::post('/jobs/apply', [UserProfileController::class, 'applyJob']);
});