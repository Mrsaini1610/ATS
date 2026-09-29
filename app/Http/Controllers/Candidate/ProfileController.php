<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\User;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\SavedJob;
use App\Models\UserEducation;
use App\Models\UserExperience;
use App\Models\UserCertificate;
use App\Models\UserResume;

class ProfileController extends Controller
{
    public function index()
    {
        $candidate = Auth::guard('web')->user();

        if (!$candidate) {
            return redirect()->route('login');
        }

        $candidate->load([
            'educations' => fn($q) => $q->where('is_delete', 0)->orderBy('start_year', 'desc'),
            'experiences' => fn($q) => $q->where('is_delete', 0)->orderBy('start_date', 'desc'),
            'certificates' => fn($q) => $q->where('is_delete', 0)->orderBy('issue_date', 'desc'),
            'resumes' => fn($q) => $q->where('is_delete', 0)->orderBy('created_at', 'desc'),
        ]);

        $applications = JobApplication::with(['jobPost'])
            ->where('candidate_id', $candidate->id)
            ->latest()
            ->get();

        $savedJobs = SavedJob::where('user_uuid', $candidate->uuid)
            ->with(['job'])
            ->latest()
            ->get();

        return Inertia::render('Candidate/Profile', [
            'candidate' => $candidate,
            'educations' => $candidate->educations,
            'experiences' => $candidate->experiences,
            'certificates' => $candidate->certificates,
            'resume' => $candidate->defaultResume ?? $candidate->resumes->first(),
            'applications' => $applications,
            'savedJobs' => $savedJobs,
        ]);
    }

    public function edit()
    {
        return redirect()->route('profile');
    }

    public function update(Request $request)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $data = $request->only([
            'full_name',
            'name',
            'email',
            'phone',
            'dob',
            'city',
            'area',
            'address',
            'job_title',
            'bio',
            'is_open_to_work',
            'total_experience_years',
            'experience',
            'expected_ctc',
            'current_ctc',
            'salary',
            'job_type',
            'work_mode',
            'notice_period_days',
            'notice',
            'skills',
            'languages',
            'linkedin',
            'github',
            'portfolio',
        ]);

        if (isset($data['name']) && empty($data['full_name'])) {
            $data['full_name'] = $data['name'];
        }
        if (isset($data['experience']) && empty($data['total_experience_years'])) {
            $data['total_experience_years'] = $data['experience'];
        }
        if (isset($data['salary']) && empty($data['expected_ctc'])) {
            $data['expected_ctc'] = $data['salary'];
        }
        if (isset($data['notice']) && empty($data['notice_period_days'])) {
            $val = $data['notice'];
            if (is_numeric($val)) {
                $data['notice_period_days'] = (int) $val;
            } elseif (stripos($val, 'month') !== false) {
                preg_match('/\d+/', $val, $matches);
                $months = !empty($matches) ? (int)$matches[0] : 1;
                $data['notice_period_days'] = $months * 30;
            } elseif (stripos($val, 'week') !== false) {
                preg_match('/\d+/', $val, $matches);
                $weeks = !empty($matches) ? (int)$matches[0] : 1;
                $data['notice_period_days'] = $weeks * 7;
            } elseif (stripos($val, 'immediately') !== false) {
                $data['notice_period_days'] = 0;
            } else {
                preg_match('/\d+/', $val, $matches);
                $data['notice_period_days'] = !empty($matches) ? (int)$matches[0] : 30;
            }
        }

        $updateFields = array_filter($data, fn($v) => !is_null($v));

        $candidate->update($updateFields);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function uploadAvatar(Request $request)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'avatar_' . $candidate->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads/avatars', $filename, 'public');
            $candidate->profile_picture = '/storage/' . $path;
            $candidate->save();
        }

        return back()->with('success', 'Profile picture updated successfully.');
    }

    public function saveEducation(Request $request)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $request->validate([
            'degree' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_year' => 'nullable',
            'end_year' => 'nullable',
            'percentage_or_cgpa' => 'nullable|string|max:50',
        ]);

        $id = $request->input('id');
        $edu = null;
        if ($id && is_numeric($id) && $id > 0) {
            $edu = UserEducation::where('id', $id)->where('user_uuid', $candidate->uuid)->first();
        }

        $data = [
            'degree' => $request->input('degree'),
            'institution' => $request->input('institution'),
            'field_of_study' => $request->input('field_of_study'),
            'start_year' => (int) $request->input('start_year', date('Y')),
            'end_year' => $request->input('end_year') ? (int) $request->input('end_year') : null,
            'percentage_or_cgpa' => $request->input('percentage_or_cgpa'),
            'is_delete' => 0,
        ];

        if ($edu) {
            $edu->update($data);
        } else {
            $data['user_uuid'] = $candidate->uuid;
            UserEducation::create($data);
        }

        return back()->with('success', 'Education details saved.');
    }

    public function deleteEducation($id)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        UserEducation::where('id', $id)
            ->where('user_uuid', $candidate->uuid)
            ->update(['is_delete' => 1]);

        return back()->with('success', 'Education record removed.');
    }

    public function saveExperience(Request $request)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $request->validate([
            'designation' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'nullable',
            'end_date' => 'nullable',
            'is_current' => 'nullable',
            'description' => 'nullable|string',
        ]);

        $id = $request->input('id');
        $exp = null;
        if ($id && is_numeric($id) && $id > 0) {
            $exp = UserExperience::where('id', $id)->where('user_uuid', $candidate->uuid)->first();
        }

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $isCurrent = filter_var($request->input('is_current', false), FILTER_VALIDATE_BOOLEAN);

        $parsedStart = null;
        if ($startDate) {
            try { $parsedStart = date('Y-m-d', strtotime($startDate)); } catch (\Exception $e) { $parsedStart = null; }
        }
        $parsedEnd = null;
        if ($endDate && !$isCurrent) {
            try { $parsedEnd = date('Y-m-d', strtotime($endDate)); } catch (\Exception $e) { $parsedEnd = null; }
        }

        $data = [
            'designation' => $request->input('designation'),
            'company_name' => $request->input('company_name'),
            'location' => $request->input('location'),
            'start_date' => $parsedStart ?? now()->toDateString(),
            'end_date' => $isCurrent ? null : $parsedEnd,
            'is_current' => $isCurrent,
            'description' => $request->input('description'),
            'is_delete' => 0,
        ];

        if ($exp) {
            $exp->update($data);
        } else {
            $data['user_uuid'] = $candidate->uuid;
            UserExperience::create($data);
        }

        return back()->with('success', 'Work experience saved.');
    }

    public function deleteExperience($id)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        UserExperience::where('id', $id)
            ->where('user_uuid', $candidate->uuid)
            ->update(['is_delete' => 1]);

        return back()->with('success', 'Work experience removed.');
    }

    public function saveCertificate(Request $request)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'issuing_organization' => 'nullable|string|max:255',
            'issue_date' => 'nullable',
            'expiration_date' => 'nullable',
            'credential_id' => 'nullable|string|max:255',
            'credential_url' => 'nullable|string|max:500',
        ]);

        $id = $request->input('id');
        $cert = null;
        if ($id && is_numeric($id) && $id > 0) {
            $cert = UserCertificate::where('id', $id)->where('user_uuid', $candidate->uuid)->first();
        }

        $issueDate = $request->input('issue_date');
        $expDate = $request->input('expiration_date');
        $parsedIssue = null;
        if ($issueDate) {
            try { $parsedIssue = date('Y-m-d', strtotime($issueDate)); } catch (\Exception $e) { $parsedIssue = null; }
        }
        $parsedExp = null;
        if ($expDate && !in_array(strtolower($expDate), ['no expiry', 'never', 'none'])) {
            try { $parsedExp = date('Y-m-d', strtotime($expDate)); } catch (\Exception $e) { $parsedExp = null; }
        }

        $data = [
            'title' => $request->input('title'),
            'issuing_organization' => $request->input('issuing_organization'),
            'issue_date' => $parsedIssue,
            'expiration_date' => $parsedExp,
            'credential_id' => $request->input('credential_id'),
            'credential_url' => $request->input('credential_url'),
            'is_delete' => 0,
        ];

        if ($cert) {
            $cert->update($data);
        } else {
            $data['user_uuid'] = $candidate->uuid;
            UserCertificate::create($data);
        }

        return back()->with('success', 'Certificate saved.');
    }

    public function deleteCertificate($id)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        UserCertificate::where('id', $id)
            ->where('user_uuid', $candidate->uuid)
            ->update(['is_delete' => 1]);

        return back()->with('success', 'Certificate removed.');
    }

    public function uploadResume(Request $request)
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $file = $request->file('resume');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $finalFileName = 'resume_' . $candidate->id . '_' . time() . '.' . $extension;

        $file->storeAs('resumes', $finalFileName, 'public');
        $filePath = 'storage/resumes/' . $finalFileName;

        $candidate->resumes()->update(['is_default' => false]);
        $candidate->resumes()->create([
            'title' => $originalName,
            'file_path' => $filePath,
            'file_type' => $extension,
            'is_default' => true,
        ]);

        return back()->with('success', 'Resume uploaded successfully.');
    }

    public function downloadResume()
    {
        $candidate = Auth::guard('web')->user();
        if (!$candidate) {
            return redirect()->route('login');
        }

        $resume = $candidate->defaultResume ?? $candidate->resumes()->latest()->first();

        if ($resume && $resume->file_path && file_exists(public_path($resume->file_path))) {
            return response()->download(public_path($resume->file_path), $resume->title ?: 'Resume.pdf');
        }

        return back()->with('error', 'No resume file available to download.');
    }

    public function show($id)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $application = JobApplication::with('jobPost')
            ->where('candidate_id', $user->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('uuid', $id);
            })
            ->first();

        if (!$application) {
            return redirect()->route('my-applications')->with('error', 'Application not found.');
        }

        return redirect()->route('my-applications')->with('view_application_id', $application->uuid ?: $application->id);
    }
}
