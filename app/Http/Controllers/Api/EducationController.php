<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class EducationController extends Controller
{
    /**
     * Get all active education records of the authenticated user
     */
    public function getEducations(Request $request)
    {
        try {
            $user = $request->user();

            $educations = $user->educations()
                ->where('is_delete', 0)
                ->orderBy('start_year', 'desc')
                ->get();

            return response()->json([
                'status'  => true,
                'message' => 'Educations fetched successfully',
                'data'    => $educations
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch educations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add candidate education
     */
    public function addEducation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'degree'             => 'required|string|max:255',
            'institution'        => 'required|string|max:255',
            'field_of_study'     => 'nullable|string|max:255',
            'start_year'         => 'required|digits:4|integer',
            'end_year'           => 'nullable|digits:4|integer|gte:start_year',
            'percentage_or_cgpa' => 'nullable|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $education = $request->user()->educations()->create([
                'degree'             => $request->degree,
                'institution'        => $request->institution,
                'field_of_study'     => $request->field_of_study,
                'start_year'         => $request->start_year,
                'end_year'           => $request->end_year,
                'percentage_or_cgpa' => $request->percentage_or_cgpa,
                'is_delete'          => 0,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Education added successfully',
                'data'    => $education
            ], 201);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update candidate education
     */
    public function updateEducation(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'degree'             => 'sometimes|required|string|max:255',
            'institution'        => 'sometimes|required|string|max:255',
            'field_of_study'     => 'nullable|string|max:255',
            'start_year'         => 'sometimes|required|digits:4|integer',
            'end_year'           => 'nullable|digits:4|integer|gte:start_year',
            'percentage_or_cgpa' => 'nullable|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $education = $user->educations()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$education) {
            return response()->json([
                'status'  => false,
                'message' => 'Education record not found or unauthorized.'
            ], 404);
        }

        try {
            $education->update($request->only([
                'degree',
                'institution',
                'field_of_study',
                'start_year',
                'end_year',
                'percentage_or_cgpa'
            ]));

            return response()->json([
                'status'  => true,
                'message' => 'Education updated successfully',
                'data'    => $education
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error updating education: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soft delete candidate education
     */
    public function deleteEducation(Request $request, $id)
    {
        $user = $request->user();
        $education = $user->educations()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$education) {
            return response()->json([
                'status'  => false,
                'message' => 'Education record not found or already deleted.'
            ], 404);
        }

        $education->is_delete = 1;
        $education->save();

        return response()->json([
            'status'  => true,
            'message' => 'Education deleted successfully.'
        ], 200);
    }
}
