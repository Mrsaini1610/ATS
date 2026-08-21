<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;

class UserProfileController extends Controller
{
    /**
     * Fetch complete candidate profile
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
     * Update Candidate Profile & Picture
     **/
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
                // 1. Purani file delete karne ke liye 'storage/' hata kar check karein
                if ($user->profile_picture) {
                    $oldDiskPath = str_replace('storage/', '', $user->profile_picture);
                    if (Storage::disk('public')->exists($oldDiskPath)) {
                        Storage::disk('public')->delete($oldDiskPath);
                    }
                }

                $file = $request->file('profile_picture');

                // 2. File name format: time()_filename.extension
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension    = $file->getClientOriginalExtension();
                $cleanFileName = Str::slug($originalName);
                $finalFileName = time() . '_' . $cleanFileName . '.' . $extension;

                // 3. Storage disk me direct 'profiles' folder me store karein
                $file->storeAs('profiles', $finalFileName, 'public');

                // 4. Database ke liye 'storage/profiles/...' format set karein
                $data['profile_picture'] = 'storage/profiles/' . $finalFileName;
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
