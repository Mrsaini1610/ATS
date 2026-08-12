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
    Route::post('/profile', [UserProfileController::class, 'getProfile']); // POST as per requirement
    Route::post('/profile/update', [UserProfileController::class, 'updateProfile']);
    Route::post('/profile/upload-resume', [UserProfileController::class, 'uploadResume']);
    
    // Application Route
    Route::post('/jobs/apply', [UserProfileController::class, 'applyJob']);
});