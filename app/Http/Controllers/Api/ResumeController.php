<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;
use Illuminate\Support\Facades\DB;

class ResumeController extends Controller
{
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

            $path = $file->store('resumes/' . $user->uuid, 'public');
            $isDefault = $user->resumes()->count() === 0;

            $resume = $user->resumes()->create([
                'title'      => $request->title ?? $file->getClientOriginalName(),
                'file_path'  => $path,
                'file_type'  => strtolower($file->getClientOriginalExtension()),
                'is_default' => $isDefault
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
     * Set specific resume as default
     */
    public function setDefaultResume(Request $request, $id)
    {
        $user = $request->user();
        $resume = $user->resumes()->where('id', $id)->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found or unauthorized.'
            ], 404);
        }

        // Reset other resumes and set selected one
        $user->resumes()->update(['is_default' => false]);
        $resume->update(['is_default' => true]);

        return response()->json([
            'status'  => true,
            'message' => 'Default resume updated successfully.'
        ], 200);
    }


    /**
     * Delete Resume (POST method)
     */
    public function deleteResume(Request $request, $id)
    {
        $user = $request->user();

        // 1. Check karein ki resume authenticated user ka hi hai (ID ya UUID dono support karega)
        $resume = $user->resumes()
            ->where(function ($query) use ($id) {
                $query->where('id', $id)
                    ->orWhere('uuid', $id);
            })
            ->first();

        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Resume not found or you are not authorized to delete it.'
            ], 404);
        }

        try {
            DB::transaction(function () use ($user, $resume) {
                $wasDefault = $resume->is_default;
                $filePath   = $resume->file_path;

                // Storage se file delete karein
                if ($filePath && Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }

                // Record delete karein
                $resume->delete();

                // Agar deleted resume default tha, toh bache hue pehle resume ko default bana dein
                if ($wasDefault) {
                    $nextResume = $user->resumes()->latest()->first();
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
