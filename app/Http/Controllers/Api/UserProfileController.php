<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\UserResume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\JobPost;
use Throwable;

class UserProfileController extends Controller
{
    /**
     * Complete Profile Fetch API
     */
/**
 * Complete Profile Fetch API
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
        'status' => true,
        'message'=> 'Profile fetched successfully',
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
            'gender'                 => 'sometimes|nullable|string|in:Male,Female,Other',
            'dob'                    => 'sometimes|nullable|date_format:Y-m-d',
            'skills'                 => 'sometimes|array',
            'total_experience_years' => 'sometimes|nullable|numeric',
            'current_ctc'            => 'sometimes|nullable|numeric',
            'expected_ctc'           => 'sometimes|nullable|numeric',
            'notice_period_days'     => 'sometimes|nullable|integer',
            'bio'                    => 'sometimes|nullable|string',
            'address'                => 'sometimes|nullable|string',
            'city'                   => 'sometimes|nullable|string',
            'state'                  => 'sometimes|nullable|string',
            'pincode'                => 'sometimes|nullable|string|max:10',
            'latitude'               => 'sometimes|nullable|numeric',
            'longitude'              => 'sometimes|nullable|numeric',
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
            // Sabhi zaroori columns ko yahan shamil kiya gaya hai
            $data = $request->only([
                'full_name', 'email', 'gender', 'dob', 'skills',
                'total_experience_years', 'current_ctc', 'expected_ctc',
                'notice_period_days', 'bio', 'address', 'city',
                'state', 'pincode', 'latitude', 'longitude'
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
/**
 * Apply for a Job
 */
// public function applyJob(Request $request)
// {
//     $validator = Validator::make($request->all(), [
//         'job_id'       => 'required',
//         'resume_id'    => 'required|exists:user_resumes,id',
//         'cover_letter' => 'nullable|string'
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
//     }

//     $user = $request->user();

//     // Security check: Verify resume belongs to authenticated user
//     $resume = UserResume::where('id', $request->resume_id)->where('user_id', $user->id)->first();
//     if (!$resume) {
//         return response()->json([
//             'status'  => false,
//             'message' => 'Unauthorized access to the specified resume.'
//         ], 403);
//     }

//     // Duplicate Check
//     $alreadyApplied = JobApplication::where('candidate_id', $user->id)
//         ->where('job_id', $request->job_id)
//         ->exists();

//     if ($alreadyApplied) {
//         return response()->json([
//             'status'  => false,
//             'message' => 'You have already applied for this job.'
//         ], 400);
//     }

//     $application = JobApplication::create([
//         'candidate_id'         => $user->id,
//         'job_id'               => $request->job_id,
//         'resume_url'           => $resume->file_path,
//         'cover_letter'         => $request->cover_letter,
//         'candidate_name'       => $user->full_name ?? $user->username,
//         'candidate_email'      => $user->email,
//         'candidate_phone'      => $user->phone,
//         'candidate_skills'     => $user->skills,
//         'candidate_experience' => $user->total_experience_years,
//         'status'               => 'applied'
//     ]);

//     return response()->json([
//         'status'      => true,
//         'message'     => 'Application submitted successfully',
//         'application' => $application
//     ], 201);
// }

public function applyJob(Request $request)
{
    $validator = Validator::make($request->all(), [
        'job_id'       => 'required|exists:job_posts,id',
        'resume_id'    => 'required|exists:user_resumes,id',
        'cover_letter' => 'nullable|string'
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    $user = $request->user();

    // 1. Check resume ownership
    $resume = UserResume::where('id', $request->resume_id)->where('user_id', $user->id)->first();
    if (!$resume) {
        return response()->json([
            'status'  => false,
            'message' => 'Unauthorized access to the specified resume.'
        ], 403);
    }

    // 2. Duplicate Check
    $alreadyApplied = JobApplication::where('candidate_id', $user->id)
        ->where('job_id', $request->job_id)
        ->exists();

    if ($alreadyApplied) {
        return response()->json([
            'status'  => false,
            'message' => 'You have already applied for this job.'
        ], 400);
    }

    // 3. Create Application
    $application = JobApplication::create([
        'candidate_id'         => $user->id,
        'job_id'               => $request->job_id,
        'resume_url'           => $resume->file_path,
        'cover_letter'         => $request->cover_letter,
        'candidate_name'       => $user->full_name ?? $user->username,
        'candidate_email'      => $user->email,
        'candidate_phone'      => $user->phone,
        'candidate_skills'     => $user->skills,
        'candidate_experience' => $user->total_experience_years,
        'status'               => 'applied'
    ]);

    // 4. (Optional) Increment applicants count in job_posts
    JobPost::where('id', $request->job_id)->increment('applicants');

    return response()->json([
        'status'      => true,
        'message'     => 'Application submitted successfully',
        'application' => $application
    ], 201);
}

    /**
     * Delete Resume
     */
/**
 * Delete Resume
 */
public function deleteResume(Request $request, $id)
{
    $user = $request->user();
    $resume = $user->resumes()->where('id', $id)->first();

    if (!$resume) {
        return response()->json([
            'status'  => false,
            'message' => 'Resume not found or unauthorized.'
        ], 404);
    }

    $wasDefault = $resume->is_default;

    // Storage se physical file delete karein
    if ($resume->file_path && Storage::disk('public')->exists($resume->file_path)) {
        Storage::disk('public')->delete($resume->file_path);
    }

    // Database record delete karein
    $resume->delete();

    // Agar delete hone wala resume 'default' tha, toh kisi doosre resume ko default banayein
    if ($wasDefault) {
        $nextResume = $user->resumes()->first();
        if ($nextResume) {
            $nextResume->update(['is_default' => true]);
        }
    }

    return response()->json([
        'status'  => true,
        'message' => 'Resume deleted successfully.'
    ], 200);
}

    /**
     * Add Education
     */
/**
 * Add Education
 */
public function addEducation(Request $request)
{
    $validator = Validator::make($request->all(), [
        'degree'             => 'required|string|max:255',
        'institution'        => 'required|string|max:255',
        'field_of_study'     => 'nullable|string|max:255',
        'start_year'         => 'required|digits:4|integer',
        'end_year'           => 'nullable|digits:4|integer|gte:start_year',
        'percentage_or_cgpa' => 'nullable|numeric|between:0,100',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Validation error',
            'errors' => $validator->errors()
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

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}

/**
     * Delete Education
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


    /**
     * Add Experience
     */
/**
 * Add Experience
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

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}


/**
     * Delete Experience
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

    

/**
     * Add Certificate
     */
    public function addCertificate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'                => 'required|string|max:255',
            'issuing_organization'=> 'required|string|max:255',
            'issue_date'           => 'required|date_format:Y-m-d',
            'expiration_date'      => 'nullable|date_format:Y-m-d|after_or_equal:issue_date',
            'credential_id'        => 'nullable|string|max:255',
            'credential_url'       => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $certificate = $request->user()->certificates()->create([
                'title'                => $request->title,
                'issuing_organization'=> $request->issuing_organization,
                'issue_date'           => $request->issue_date,
                'expiration_date'      => $request->expiration_date,
                'credential_id'        => $request->credential_id,
                'credential_url'       => $request->credential_url,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Certificate added successfully',
                'data'    => $certificate
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete Certificate
     */
    public function deleteCertificate(Request $request, $id)
    {
        $user = $request->user();
        $certificate = $user->certificates()->where('id', $id)->first();

        if (!$certificate) {
            return response()->json([
                'status'  => false,
                'message' => 'Certificate not found or unauthorized.'
            ], 404);
        }

        $certificate->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Certificate deleted successfully.'
        ], 200);
    }





}
