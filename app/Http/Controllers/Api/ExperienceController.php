<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ExperienceController extends Controller
{
    /**
     * Add candidate experience
     */
    public function addExperience(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'designation'  => 'required|string|max:255',
            'start_date'   => 'required|date_format:Y-m-d',
            'end_date'     => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'is_current'   => 'nullable|boolean',
            'description'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $isCurrent = $request->boolean('is_current');

            $experience = $request->user()->experiences()->create([
                'company_name' => $request->company_name,
                'designation'  => $request->designation,
                'start_date'   => $request->start_date,
                'end_date'     => $isCurrent ? null : $request->end_date,
                'is_current'   => $isCurrent,
                'description'  => $request->description,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Experience added successfully',
                'data'    => $experience
            ], 201);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete candidate experience
     */
    public function deleteExperience(Request $request, $id)
    {
        $user = $request->user();
        $experience = $user->experiences()->where('id', $id)->first();

        if (!$experience) {
            return response()->json([
                'status'  => false,
                'message' => 'Experience record not found or unauthorized.'
            ], 404);
        }

        $experience->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Experience deleted successfully.'
        ], 200);
    }
}
