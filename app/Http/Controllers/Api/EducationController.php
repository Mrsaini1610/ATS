<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class EducationController extends Controller
{
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
     * Delete candidate education
     */
    public function deleteEducation(Request $request, $id)
    {
        $user = $request->user();
        $education = $user->educations()->where('id', $id)->first();

        if (!$education) {
            return response()->json([
                'status'  => false,
                'message' => 'Education record not found or unauthorized.'
            ], 404);
        }

        $education->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Education deleted successfully.'
        ], 200);
    }
}
