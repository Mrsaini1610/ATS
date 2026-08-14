<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\UserResume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Throwable;

class UserProfileController extends Controller
{
    /**
     * Complete Profile Fetch API
     */
    public function getProfile(Request $request)
    {
        $user = $request->user()->load(['educations', 'experiences', 'resumes']);
        
        return response()->json([
            'status' => true,
            'data'   => $user
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
            'skills'                 => 'sometimes|array',
            'total_experience_years' => 'sometimes|numeric',
            'current_ctc'            => 'sometimes|numeric',
            'expected_ctc'           => 'sometimes|numeric',
            'notice_period_days'     => 'sometimes|integer',
            'bio'                    => 'sometimes|string',
            'profile_picture'        => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
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
                'full_name', 'email', 'skills', 'total_experience_years',
                'current_ctc', 'expected_ctc', 'notice_period_days', 'bio',
                'address', 'city', 'state', 'pincode'
            ]);

            if ($request->hasFile('profile_picture')) {
                if ($user->profile_picture) {
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

    /**
     * Upload Resume
     */
    public function uploadResume(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // Max 5MB
            'title'  => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $file = $request->file('resume');
        
        $path = $file->store('resumes/' . $user->id, 'public');

        // Check if first resume -> make default
        $isDefault = $user->resumes()->count() === 0;

        $resume = $user->resumes()->create([
            'title'      => $request->title ?? $file->getClientOriginalName(),
            'file_path'  => $path,
            'file_type'  => $file->getClientOriginalExtension(),
            'is_default' => $isDefault
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Resume uploaded successfully',
            'resume'  => $resume
        ], 201);
    }

    /**
     * Apply for a Job
     */
    public function applyJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id'             => 'required|exists:jobs,id',
            'resume_id'          => 'required|exists:user_resumes,id',
            'expected_ctc'       => 'nullable|numeric',
            'notice_period_days' => 'nullable|integer',
            'cover_note'         => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Security check: Verify resume belongs to authenticated user
        $resume = UserResume::where('id', $request->resume_id)->where('user_id', $user->id)->first();
        if (!$resume) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthorized access to the specified resume.'
            ], 403);
        }

        // Duplicate Check
        $alreadyApplied = JobApplication::where('user_id', $user->id)
            ->where('job_id', $request->job_id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'status'  => false,
                'message' => 'You have already applied for this job.'
            ], 400);
        }

        $application = JobApplication::create([
            'user_id'            => $user->id,
            'job_id'             => $request->job_id,
            'resume_id'          => $request->resume_id,
            'expected_ctc'       => $request->expected_ctc ?? $user->expected_ctc,
            'notice_period_days' => $request->notice_period_days ?? $user->notice_period_days,
            'cover_note'         => $request->cover_note,
            'status'             => 'applied'
        ]);

        return response()->json([
            'status'      => true,
            'message'     => 'Application submitted successfully',
            'application' => $application
        ], 201);
    }

    /**
     * Delete Resume
     */
    public function deleteResume(Request $request, $id)
    {
        $user = $request->user();
        $resume = $user->resumes()->where('id', $id)->first();

        if (!$resume) {
            return response()->json(['status' => false, 'message' => 'Resume not found.'], 404);
        }

        Storage::disk('public')->delete($resume->file_path);
        $resume->delete();

        return response()->json(['status' => true, 'message' => 'Resume deleted successfully.'], 200);
    }

    /**
     * Add Education
     */
    public function addEducation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'degree'      => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'start_year'  => 'required|digits:4',
            'end_year'    => 'nullable|digits:4',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $education = $request->user()->educations()->create($request->all());

        return response()->json([
            'status'  => true,
            'message' => 'Education added successfully',
            'data'    => $education
        ], 201);
    }

    /**
     * Add Experience
     */
    public function addExperience(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'designation'  => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'start_date'   => 'required|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
            'is_current'   => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $experience = $request->user()->experiences()->create($request->all());

        return response()->json([
            'status'  => true,
            'message' => 'Experience added successfully',
            'data'    => $experience
        ], 201);
    }
}