<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ResumeController extends Controller
{
    /**
     * Get all active resumes of the authenticated user
     */
    public function getResumes(Request $request)
    {
        try {
            $user = $request->user();

            $resumes = $user->resumes()
                ->where('is_delete', 0)
                ->latest()
                ->get();

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
     * Upload candidate resume
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

            // Original name extract aur clean karein
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $cleanFileName = Str::slug($originalName);

            // Unique file name with timestamp
            $finalFileName = time() . '_' . $cleanFileName . '.' . $extension;

            // 'resumes' folder me save karein (storage/app/public/resumes)
            $file->storeAs('resumes', $finalFileName, 'public');
            $filePath = 'resumes/' . $finalFileName;

            // Pehla resume automatically default banega
            $isDefault = $user->resumes()->where('is_delete', 0)->count() === 0;

            $resume = $user->resumes()->create([
                'title'      => $request->title ?? $file->getClientOriginalName(),
                'file_path'  => $filePath,
                'file_type'  => strtolower($extension),
                'is_default' => $isDefault,
                'is_delete'  => 0
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Resume uploaded successfully',
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
     * Update resume (title or replace file)
     */
    public function updateResume(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title'  => 'nullable|string|max:255',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $resume = $user->resumes()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found or unauthorized.'
            ], 404);
        }

        try {
            $hasUpdate = false;

            if ($request->filled('title')) {
                $resume->title = $request->title;
                $hasUpdate = true;
            }

            if ($request->hasFile('resume')) {
                // Purani file delete karein
                if ($resume->file_path && Storage::disk('public')->exists($resume->file_path)) {
                    Storage::disk('public')->delete($resume->file_path);
                }

                $file = $request->file('resume');
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $cleanFileName = Str::slug($originalName);
                $finalFileName = time() . '_' . $cleanFileName . '.' . $extension;

                $file->storeAs('resumes', $finalFileName, 'public');

                $resume->file_path = 'resumes/' . $finalFileName;
                $resume->file_type = strtolower($extension);

                if (!$request->filled('title')) {
                    $resume->title = $file->getClientOriginalName();
                }

                $hasUpdate = true;
            }

            if (!$hasUpdate) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No fields provided to update.'
                ], 400);
            }

            $resume->save();

            return response()->json([
                'status'  => true,
                'message' => 'Resume updated successfully',
                'resume'  => $resume
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update resume: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set specific resume as default
     */
    public function setDefaultResume(Request $request, $id)
    {
        $user = $request->user();
        $resume = $user->resumes()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found or unauthorized.'
            ], 404);
        }

        $user->resumes()->where('is_delete', 0)->update(['is_default' => false]);
        $resume->update(['is_default' => true]);

        return response()->json([
            'status'  => true,
            'message' => 'Default resume updated successfully.'
        ], 200);
    }

    /**
     * Soft Delete Resume
     */
    public function deleteResume(Request $request, $id)
    {
        $user = $request->user();

        $resume = $user->resumes()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->where('is_delete', 0)
            ->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found or already deleted.'
            ], 404);
        }

        try {
            DB::transaction(function () use ($user, $resume) {
                $wasDefault = $resume->is_default;

                $resume->is_delete = 1;
                $resume->is_default = false;
                $resume->save();

                if ($wasDefault) {
                    $nextResume = $user->resumes()
                        ->where('is_delete', 0)
                        ->latest()
                        ->first();

                    if ($nextResume) {
                        $nextResume->update(['is_default' => true]);
                    }
                }
            });

            return response()->json([
                'status'  => true,
                'message' => 'Resume deleted successfully.'
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete resume: ' . $e->getMessage()
            ], 500);
        }
    }
}
