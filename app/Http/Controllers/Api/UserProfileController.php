<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;
use App\Services\GeocodingService;

class UserProfileController extends Controller
{
 

public function getProfile(Request $request, GeocodingService $geocodingService)
{
    // 1. Authenticated User with Relations
    $user = $request->user()->load([
        'educations',
        'experiences',
        'resumes',
        'certificates'
    ]);

    // 2. Extract Latitude & Longitude
    $lat = $user->latitude;
    $lng = $user->longitude;

    $currentCity = null;
    $currentArea = null;

    // 3. Fetch City & Area if coordinates are available
    if (!empty($lat) && !empty($lng)) {
        $geoResult = $geocodingService->reverseGeocodeResult((float)$lat, (float)$lng);
        $parsedLocation = $this->parseAddressComponents($geoResult);

        $currentCity = $geoResult['city'] ?? $parsedLocation['city'] ?? null;
        $currentArea = $geoResult['area'] ?? $parsedLocation['area'] ?? null;
    }

    // 4. Convert User Model to Array and Append Custom Location Fields
    $userData = $user->toArray();
    $userData['current_city'] = $currentCity;
    $userData['current_area'] = $currentArea;

    return response()->json([
        'status'  => true,
        'message' => 'Profile fetched successfully',
        'data'    => $userData
    ], 200);
}
/**
 * Helper to parse address from raw Google components or formatted string fallback.
 */
private function parseAddressComponents(array $geoResult): array
{
    $components = [
        'formatted_address' => $geoResult['formatted_address'] ?? null,
        'area' => null,
        'city' => null,
        'state' => null,
        'country' => null,
        'pincode' => null,
    ];

    // Case A: Google raw 'address_components' array present in geoResult
    if (!empty($geoResult['address_components']) && is_array($geoResult['address_components'])) {
        foreach ($geoResult['address_components'] as $component) {
            $types = $component['types'] ?? [];

            if (in_array('sublocality', $types) || in_array('sublocality_level_1', $types) || in_array('neighborhood', $types)) {
                $components['area'] = $component['long_name'];
            }
            if (in_array('locality', $types)) {
                $components['city'] = $component['long_name'];
            }
            if (in_array('administrative_area_level_1', $types)) {
                $components['state'] = $component['long_name'];
            }
            if (in_array('country', $types)) {
                $components['country'] = $component['long_name'];
            }
            if (in_array('postal_code', $types)) {
                $components['pincode'] = $component['long_name'];
            }
        }

        return $components;
    }

    // Case B: Fallback regex parsing using 'formatted_address' string
    if (!empty($components['formatted_address'])) {
        $parts = array_map('trim', explode(',', $components['formatted_address']));
        $count = count($parts);

        // Extract Pincode (6 digits for India)
        if (preg_match('/\b\d{6}\b/', $components['formatted_address'], $matches)) {
            $components['pincode'] = $matches[0];
        }

        // Standard Indian Address pattern matching: "Street, Area, City, State Pincode, Country"
        if ($count >= 4) {
            $components['country'] = $parts[$count - 1] ?? null;
            
            // State (extracting name without pincode digits)
            $statePart = $parts[$count - 2] ?? '';
            $components['state'] = trim(preg_replace('/\b\d{6}\b/', '', $statePart));
            
            $components['city'] = $parts[$count - 3] ?? null;
            $components['area'] = $parts[$count - 4] ?? null;
        }
    }

    return $components;
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
