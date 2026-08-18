<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;

class UserProfileController extends Controller
{
    /**
     * Fetch complete candidate profile with related records
     */
    public function getProfile(Request $request)
    {
        $user = $request->user()->load([
            'educations',
            'experiences',
            'resumes',
            'certificates'
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Profile fetched successfully',
            'data'    => $user
        ], 200);
    }

    /**
     * Update Candidate Profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'full_name'              => 'sometimes|string|max:255',
            'email'                  => 'sometimes|email|unique:users,email,' . $user->id,
            'phone'                  => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id,
            'gender'                 => 'sometimes|nullable|string|in:Male,Female,Other',
            'dob'                    => 'sometimes|nullable|date_format:Y-m-d',
            'skills'                 => 'sometimes|array',
            'total_experience_years' => 'sometimes|nullable|string|max:255',
            'current_ctc'            => 'sometimes|nullable|string|max:255',
            'expected_ctc'           => 'sometimes|nullable|string|max:255',
            'notice_period_days'     => 'sometimes|nullable|integer',
            'bio'                    => 'sometimes|nullable|string',
            'address'                => 'sometimes|nullable|string',
            'city'                   => 'sometimes|nullable|string|max:255',
            'state'                  => 'sometimes|nullable|string|max:255',
            'pincode'                => 'sometimes|nullable|string|max:20',
            'latitude'               => 'sometimes|nullable|numeric|between:-90,90',
            'longitude'              => 'sometimes|nullable|numeric|between:-180,180',
            'profile_picture'        => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only([
                'full_name', 'email', 'phone', 'gender', 'dob', 'skills',
                'total_experience_years', 'current_ctc', 'expected_ctc',
                'notice_period_days', 'bio', 'address', 'city',
                'state', 'pincode', 'latitude', 'longitude'
            ]);

            if ($request->hasFile('profile_picture')) {
                if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $data['profile_picture'] = $request->file('profile_picture')->store('profiles', 'public');
            }

            $user->update($data);

            return response()->json([
                'status'  => true,
                'message' => 'Profile updated successfully',
                'user'    => $user->fresh()
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}






