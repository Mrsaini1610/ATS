<?php
    use App\Http\Controllers\Api\AuthController;
    use Illuminate\Support\Facades\Route;
    


    Route::get('/', function () {
    return response()->json([
        'status'  => true,
        'message' => 'API is running.',
    ]);
});

Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});