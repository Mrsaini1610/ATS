<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ResumeController extends Controller
{
    /**
     * Get all resumes of authenticated user
     */
    public function getResumes(Request $request)
    {
        try {
            $user = $request->user();
            $resumes = $user->resumes()->latest()->get();

            return response()->json([
                'status'  => true,
                'message' => 'Resumes fetched successfully',
                'data'    => $resumes
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch resumes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload candidate resume & set it as active default
     */
    public function uploadResume(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
            'title'  => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $file = $request->file('resume');

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension    = $file->getClientOriginalExtension();
            $cleanFileName = Str::slug($originalName);
            $finalFileName = time() . '_' . $cleanFileName . '.' . $extension;

            // Storage me file save karein
            $file->storeAs('resumes', $finalFileName, 'public');
            $filePath = 'storage/resumes/' . $finalFileName;

            // Purane resumes ko default = false karein aur naye ko default banayein (Bina delete kiye)
            $resume = DB::transaction(function () use ($user, $request, $file, $filePath, $extension) {
                $user->resumes()->update(['is_default' => false]);

                return $user->resumes()->create([
                    'title'      => $request->title ?? $file->getClientOriginalName(),
                    'file_path'  => $filePath,
                    'file_type'  => strtolower($extension),
                    'is_default' => true,
                ]);
            });

            return response()->json([
                'status'  => true,
                'message' => 'Resume uploaded and set as active default',
                'resume'  => $resume
            ], 201);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set specific resume as default by UUID (Request Body)
     */
    public function setDefaultResume(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'uuid' => 'required|string|exists:user_resumes,uuid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $resume = $user->resumes()->where('uuid', $request->uuid)->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found or unauthorized.'
            ], 404);
        }

        DB::transaction(function () use ($user, $resume) {
            $user->resumes()->update(['is_default' => false]);
            $resume->update(['is_default' => true]);
        });

        return response()->json([
            'status'  => true,
            'message' => 'Default resume updated successfully.',
            'resume'  => $resume
        ], 200);
    }

    /**
     * Hard Delete Resume (Database record only - physical file preserved)
     * Fallback to latest resume as default if deleted resume was default
     */
    public function deleteResume(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'uuid' => 'required|string|exists:user_resumes,uuid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $resume = $user->resumes()->where('uuid', $request->uuid)->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found.'
            ], 404);
        }

        try {
            DB::transaction(function () use ($user, $resume) {
                $wasDefault = $resume->is_default;

                // Permanent DB deletion only (File in storage remains untouched)
                $resume->delete();

                // Agar active default delete hua, toh bacha hua latest resume auto-default banega
                if ($wasDefault) {
                    $latestResume = $user->resumes()->latest()->first();
                    if ($latestResume) {
                        $latestResume->update(['is_default' => true]);
                    }
                }
            });

            return response()->json([
                'status'  => true,
                'message' => 'Resume deleted successfully from database.'
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete resume: ' . $e->getMessage()
            ], 500);
        }
    }
}
