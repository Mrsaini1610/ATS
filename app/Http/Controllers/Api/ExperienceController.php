<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ExperienceController extends Controller
{
    /**
     * Get all active experiences of the authenticated user
     */
    public function getExperiences(Request $request)
    {
        try {
            $user = $request->user();

            // Sirf non-deleted records fetch karega
            $experiences = $user->experiences()
                ->where('is_delete', 0)
                ->orderBy('start_date', 'desc')
                ->get();

            return response()->json([
                'status'  => true,
                'message' => 'Experience records retrieved successfully.',
                'data'    => $experiences
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch experiences: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add candidate experience
     */
    public function addExperience(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'designation'  => 'required|string|max:255',
            'start_date'   => 'nullable|date_format:Y-m-d',
            'end_date'     => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'is_current'   => 'nullable|boolean',
            'description'  => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $experience = $request->user()->experiences()->create([
                'company_name' => $request->company_name,
                'designation'  => $request->designation,
                'start_date'   => $request->start_date,
                'end_date'     => $request->boolean('is_current') ? null : $request->end_date,
                'is_current'   => $request->boolean('is_current', false),
                'description'  => $request->description,
                'is_delete'    => 0,
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
     * Update candidate experience
     */
    public function updateExperience(Request $request, $id)
    {
        $user = $request->user();

        $experience = $user->experiences()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$experience) {
            return response()->json([
                'status'  => false,
                'message' => 'Experience record not found or unauthorized.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => 'sometimes|required|string|max:255',
            'designation'  => 'sometimes|required|string|max:255',
            'start_date'   => 'nullable|date_format:Y-m-d',
            'end_date'     => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'is_current'   => 'nullable|boolean',
            'description'  => 'nullable|string|max:2000',
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
                'company_name',
                'designation',
                'start_date',
                'end_date',
                'is_current',
                'description'
            ]);

            if ($request->has('is_current') && $request->boolean('is_current')) {
                $data['end_date'] = null;
            }

            $experience->update($data);

            return response()->json([
                'status'  => true,
                'message' => 'Experience updated successfully',
                'data'    => $experience
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soft delete candidate experience (sets is_delete = 1)
     */
    public function deleteExperience(Request $request, $id)
    {
        $user = $request->user();

        $experience = $user->experiences()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$experience) {
            return response()->json([
                'status'  => false,
                'message' => 'Experience record not found or already deleted.'
            ], 404);
        }

        $experience->update(['is_delete' => 1]);

        return response()->json([
            'status'  => true,
            'message' => 'Experience deleted successfully.'
        ], 200);
    }
}
