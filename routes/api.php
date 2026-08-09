<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Member\JobController;
use App\Http\Controllers\Api\Member\ProfileController;
use App\Http\Controllers\Api\Member\TaskController;
use Illuminate\Support\Facades\Route;

    Route::get('/', function () {
        return response()->json([
            'success' => true,
            'message' => 'API is running.',
        ]);
    });

   

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/send-otp', [AuthController::class, 'sendOtp']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

        Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
    });

    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::get('/profile/completion', [ProfileController::class, 'completion']);
        Route::post('/profile/location', [ProfileController::class, 'updateLocation']);
        Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
        Route::delete('/profile/photo', [ProfileController::class, 'removePhoto']);
        Route::get('/profile/resume', [ProfileController::class, 'resume']);
        Route::post('/profile/resume', [ProfileController::class, 'uploadResume']);
        Route::delete('/profile/resume', [ProfileController::class, 'deleteResume']);
        Route::get('/profile/resume/view', [ProfileController::class, 'viewResume']);

        Route::get('/jobs/nearby', [JobController::class, 'nearby']);
        Route::get('/jobs/locations', [JobController::class, 'locations']);
        Route::get('/jobs', [JobController::class, 'index']);
        Route::get('/jobs/{job}', [JobController::class, 'show']);
        Route::post('/jobs/{job}/apply', [JobController::class, 'apply']);
        Route::post('/jobs/{job}/save', [JobController::class, 'save']);
        Route::delete('/jobs/{job}/save', [JobController::class, 'unsave']);
        Route::get('/saved-jobs', [JobController::class, 'savedIndex']);
        Route::get('/applications', [JobController::class, 'myApplications']);
        Route::delete('/applications/{application}', [JobController::class, 'withdraw']);

        Route::get('/job-categories', [JobController::class, 'categories']);

         

        Route::get('/tasks', [TaskController::class, 'index']);
        Route::get('/tasks/{task}', [TaskController::class, 'show']);
        Route::get('/tasks/{task}/notes', [TaskController::class, 'notesIndex']);
        Route::post('/tasks/{task}/notes', [TaskController::class, 'notesStore']);
        Route::delete('/notes/{note}', [TaskController::class, 'notesDestroy']);
    });
