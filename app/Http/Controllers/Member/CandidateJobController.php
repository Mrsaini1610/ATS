<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Member;
use App\Models\SavedJob;
use App\Support\JobQuestionHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CandidateJobController extends Controller
{
    private function getProfileCompletionData(Member $member): array
    {
        $weights = [
            'name' => 15,
            'email' => 10,
            'phone' => 10,
            'username' => 5,
            'image' => 10,
            'dob' => 5,
            'gender' => 5,
            'skills' => 8,
            'overview' => 8,
            'education' => 8,
            'projects' => 6,
            'experience' => 10,
        ];

        $candidate = is_array($member->candidate_profile) ? $member->candidate_profile : [];

        $checks = [
            'name' => !empty($member->name),
            'email' => !empty($member->email),
            'phone' => !empty($member->phone),
            'username' => !empty($member->username),
            'image' => !empty($member->image),
            'dob' => !empty($member->dob),
            'gender' => !empty($member->gender),
            'skills' => !empty($candidate['skills']),
            'overview' => !empty($candidate['overview']),
            'education' => !empty($candidate['education']),
            'projects' => !empty($candidate['projects']),
            'experience' => array_key_exists('is_fresher', $candidate)
                ? ($candidate['is_fresher'] ? true : !empty($candidate['experience']))
                : false,
        ];

        $totalWeight = array_sum($weights);
        $score = 0;
        $missing = [];

        foreach ($weights as $key => $weight) {
            if (!empty($checks[$key])) {
                $score += $weight;
            } else {
                $missing[] = $key;
            }
        }

        $percentage = $totalWeight > 0 ? (int) floor(($score / $totalWeight) * 100) : 0;

        return [
            'percentage' => $percentage,
            'missing_fields' => $missing,
        ];
    }

    public function profileCompletion(Request $request)
    {
        $member = Auth::guard('member')->user();
        $data = $this->getProfileCompletionData($member);

        return response()->json([
            'success' => true,
            'completion_percentage' => $data['percentage'],
            'missing_fields' => $data['missing_fields'],
            'min_required' => 35,
            'profile_url' => route('member.profile'),
        ]);
    }

    /**
     * Display job listings for candidates
     */
    public function index(Request $request)
    {
        $query = Job::with(['creator' => function($q) {
                $q->select('id', 'name', 'email');
            }])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc');

        // Search by title or company
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filter by job type
        if ($request->has('job_type') && $request->job_type) {
            $query->where('job_type', $request->job_type);
        }

        // Filter by location
        if ($request->has('location') && $request->location) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        // Filter by job category
        if ($request->has('job_category') && $request->job_category) {
            $query->where('job_category', $request->job_category);
        }

        $jobs = $query->paginate(12)->withQueryString();

        // Check which jobs user has already applied to and saved
        $appliedJobIds = [];
        $savedJobIds = [];
        if (Auth::guard('member')->check()) {
            $memberId = Auth::guard('member')->id();
            $appliedJobIds = JobApplication::where('candidate_id', $memberId)
                ->pluck('job_id')
                ->toArray();

            $savedJobIds = SavedJob::where('member_id', $memberId)
                ->pluck('job_id')
                ->toArray();
        }

        // Attach is_saved and is_applied to each job
        $appliedMap = array_flip($appliedJobIds);
        $savedMap = array_flip($savedJobIds);
        $jobs->getCollection()->transform(function ($job) use ($appliedMap, $savedMap) {
            $job->is_saved = isset($savedMap[$job->id]);
            $job->is_applied = isset($appliedMap[$job->id]);
            return $job;
        });

        // Get unique locations for filters
        $locations = Job::where('status', 'active')
            ->distinct()
            ->pluck('location');

        // Get unique job categories for filters
        $jobCategories = Job::where('status', 'active')
            ->whereNotNull('job_category')
            ->where('job_category', '!=', '')
            ->distinct()
            ->pluck('job_category');

        // All possible job types from admin form
        $jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance', 'Remote'];

        return Inertia::render('Member/JobListings', [
            'jobs' => $jobs,
            'appliedJobIds' => $appliedJobIds,
            'savedJobIds' => $savedJobIds,
            'filters' => [
                'search' => $request->search ?? '',
                'job_type' => $request->job_type ?? '',
                'job_category' => $request->job_category ?? '',
                'location' => $request->location ?? '',
            ],
            'jobTypes' => $jobTypes,
            'jobCategories' => $jobCategories,
            'locations' => $locations,
        ]);
    }

    /**
     * Get single job details
     */
    public function show(Job $job)
    {
        if ($job->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This job is not available.',
            ], 404);
        }

        $job->load(['creator' => function($q) {
            $q->select('id', 'name');
        }]);

        // Check if user has already applied
        $hasApplied = false;
        $application = null;

        if (Auth::guard('member')->check()) {
            $application = JobApplication::where('job_id', $job->id)
                ->where('candidate_id', Auth::guard('member')->id())
                ->first();
            $hasApplied = !is_null($application);
        }

        return response()->json([
            'success' => true,
            'job' => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'title' => $job->title,
                'company' => $job->company,
                'description' => $job->description,
                'location' => $job->location,
                'job_type' => $job->job_type,
                'experience' => $job->experience,
                'salary' => $job->salary,
                'skills' => $job->skills,
                'perks' => $job->perks,
                'key_responsibilities' => $job->key_responsibilities,
                'qualifications' => $job->qualifications,
                'application_questions' => $job->application_questions ?? [],
                'last_date' => $job->last_date,
                'company_image' => $job->company_image,
                'applicants' => $job->applicants,
                'status' => $job->status,
                'created_at' => $job->created_at,
                'creator' => $job->creator,
            ],
            'hasApplied' => $hasApplied,
            'application' => $application,
        ]);
    }

    /**
     * Submit job application
     */
    public function apply(Request $request, Job $job)
    {
        if ($job->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This job is no longer accepting applications.',
            ], 400);
        }

        $candidate = Auth::guard('member')->user();

        $completion = $this->getProfileCompletionData($candidate);
        if ($completion['percentage'] < 35) {
            return response()->json([
                'success' => false,
                'message' => 'Complete at least 35% of your profile before applying.',
                'completion_percentage' => $completion['percentage'],
                'missing_fields' => $completion['missing_fields'],
                'min_required' => 35,
                'profile_url' => route('member.profile'),
            ], 422);
        }

        // Check if already applied
        $existingApplication = JobApplication::where('job_id', $job->id)
            ->where('candidate_id', $candidate->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'success' => false,
                'message' => 'You have already applied for this job.',
            ], 400);
        }

        $validated = $request->validate([
            'cover_letter' => 'nullable|string|max:5000',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'application_profile' => 'nullable',
            'screening_answers' => 'nullable',
        ]);

        $applicationProfile = null;
        if (array_key_exists('application_profile', $validated) && $validated['application_profile'] !== null) {
            $applicationProfile = is_string($validated['application_profile'])
                ? json_decode($validated['application_profile'], true)
                : $validated['application_profile'];

            if (!is_array($applicationProfile)) {
                $applicationProfile = null;
            }
        }

        $screeningAnswers = JobQuestionHelper::normalizeAnswers(
            $request->input('screening_answers'),
            $job->application_questions ?? []
        );

        // Handle resume upload
        $resumeUrl = null;
        if ($request->hasFile('resume')) {
            $file = $request->file('resume');
            $extension = $file->getClientOriginalExtension() ?: 'pdf';
            $relativeDir = 'member-resumes/' . ($candidate->uuid ?? Str::uuid());
            $filename = Str::uuid() . '.' . $extension;
            $path = $relativeDir . '/' . $filename;
            Storage::disk('public')->putFileAs($relativeDir, $file, $filename);
            $resumeUrl = 'storage/' . $path;

            $candidate->forceFill([
                'resume_path' => $path,
                'resume_original_name' => $file->getClientOriginalName(),
                'resume_mime' => $file->getClientMimeType(),
                'resume_size' => $file->getSize(),
                'resume_uploaded_at' => now(),
            ])->save();
        } elseif (!empty($candidate->resume_path)) {
            $resumeUrl = Str::startsWith($candidate->resume_path, ['http://', 'https://', 'storage/'])
                ? $candidate->resume_path
                : 'storage/' . ltrim($candidate->resume_path, '/');
        }

        if (!$resumeUrl) {
            if (!$applicationProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload a resume or fill application details to generate a resume.',
                ], 422);
            }

            $detailValidated = validator($applicationProfile, [
                'is_fresher' => 'required|boolean',
                'skills' => 'required|array|min:1',
                'skills.*' => 'string|max:50',
                'hobbies' => 'nullable|array',
                'hobbies.*' => 'string|max:50',
                'overview' => 'required|string|max:2000',
                'links' => 'nullable|array',
                'links.linkedin' => 'nullable|string|max:255',
                'links.github' => 'nullable|string|max:255',
                'links.portfolio' => 'nullable|string|max:255',
                'education' => 'required|array',
                'education.tenth' => 'required|array',
                'education.tenth.percentage' => 'nullable|string|max:20',
                'education.twelfth' => 'nullable|array',
                'education.twelfth.percentage' => 'nullable|string|max:20',
                'education.degree' => 'required|array',
                'education.degree.name' => 'required|string|max:255',
                'education.degree.college' => 'nullable|string|max:255',
                'education.degree.cgpa' => 'nullable|string|max:50',
                'experience' => 'nullable|array',
                'experience.total_years' => 'nullable|string|max:20',
                'experience.last_salary' => 'nullable|array',
                'experience.last_salary.amount' => 'nullable|string|max:30',
                'experience.last_salary.unit' => 'nullable|in:lpa,month',
                'experience.expected_salary' => 'nullable|array',
                'experience.expected_salary.amount' => 'nullable|string|max:30',
                'experience.expected_salary.unit' => 'nullable|in:lpa,month',
                'projects' => 'nullable|array',
                'projects.*.title' => 'nullable|string|max:255',
                'projects.*.description' => 'nullable|string|max:2000',
                'projects.*.link' => 'nullable|string|max:255',
            ])->validate();

            if ($detailValidated['is_fresher'] === false) {
                if (empty($detailValidated['experience']['total_years'] ?? null)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Experience years is required for experienced candidates.',
                    ], 422);
                }
            }

            $theme = collect(['indigo', 'emerald', 'slate', 'rose'])->random();
            $resumeHtml = $this->buildGeneratedResumeHtml($candidate, $detailValidated, $theme, $validated['cover_letter'] ?? null);
            $path = 'generated-resumes/' . Str::uuid() . '.html';
            Storage::disk('public')->put($path, $resumeHtml);
            $resumeUrl = 'storage/' . $path;

            $candidate->forceFill([
                'candidate_profile' => $detailValidated,
            ])->save();
        }

        // Create application
        $application = JobApplication::create([
            'uuid' => (string) Str::uuid(),
            'job_id' => $job->id,
            'candidate_id' => $candidate->id,
            'cover_letter' => $validated['cover_letter'] ?? null,
            'resume_url' => $resumeUrl,
            'answers' => $applicationProfile,
            'screening_answers' => $screeningAnswers,
            'candidate_name' => $candidate->name,
            'candidate_email' => $candidate->email,
            'candidate_phone' => $candidate->phone,
            'candidate_skills' => $candidate->skills ?? null,
            'candidate_experience' => $candidate->experience ?? null,
            'status' => 'applied',
        ]);

        // Increment job applicants count
        $job->increment('applicants');

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully!',
            'application' => $application,
        ]);
    }

    private function buildGeneratedResumeHtml(Member $candidate, array $profile, string $theme, ?string $coverLetter): string
    {
        $colors = [
            'indigo' => ['#4f46e5', '#111827', '#6b7280', '#eef2ff'],
            'emerald' => ['#059669', '#0f172a', '#64748b', '#ecfdf5'],
            'slate' => ['#334155', '#0f172a', '#64748b', '#f1f5f9'],
            'rose' => ['#e11d48', '#111827', '#6b7280', '#fff1f2'],
        ];
        $palette = $colors[$theme] ?? $colors['indigo'];

        $accent = $palette[0];
        $text = $palette[1];
        $muted = $palette[2];
        $pill = $palette[3];

        $skills = array_map('htmlspecialchars', $profile['skills'] ?? []);
        $hobbies = array_map('htmlspecialchars', $profile['hobbies'] ?? []);

        $overview = htmlspecialchars((string) ($profile['overview'] ?? ''));
        $name = htmlspecialchars((string) ($candidate->name ?? ''));
        $email = htmlspecialchars((string) ($candidate->email ?? ''));
        $phone = htmlspecialchars((string) ($candidate->phone ?? ''));

        $links = $profile['links'] ?? [];
        $linkedin = htmlspecialchars((string) ($links['linkedin'] ?? ''));
        $github = htmlspecialchars((string) ($links['github'] ?? ''));
        $portfolio = htmlspecialchars((string) ($links['portfolio'] ?? ''));

        $education = $profile['education'] ?? [];
        $tenth = $education['tenth']['percentage'] ?? null;
        $twelfth = $education['twelfth']['percentage'] ?? null;
        $degree = $education['degree'] ?? [];
        $degreeName = htmlspecialchars((string) ($degree['name'] ?? ''));
        $degreeCollege = htmlspecialchars((string) ($degree['college'] ?? ''));
        $degreeCgpa = htmlspecialchars((string) ($degree['cgpa'] ?? ''));

        $exp = $profile['experience'] ?? [];
        $totalYears = htmlspecialchars((string) ($exp['total_years'] ?? ''));
        $lastSalary = $exp['last_salary'] ?? [];
        $expectedSalary = $exp['expected_salary'] ?? [];
        $lastSalaryText = htmlspecialchars(trim(($lastSalary['amount'] ?? '') . ' ' . ($lastSalary['unit'] ?? '')));
        $expectedSalaryText = htmlspecialchars(trim(($expectedSalary['amount'] ?? '') . ' ' . ($expectedSalary['unit'] ?? '')));

        $projects = $profile['projects'] ?? [];
        $projectsHtml = '';
        if (is_array($projects)) {
            foreach ($projects as $proj) {
                if (!is_array($proj)) continue;
                $pt = htmlspecialchars((string) ($proj['title'] ?? ''));
                $pd = htmlspecialchars((string) ($proj['description'] ?? ''));
                $pl = htmlspecialchars((string) ($proj['link'] ?? ''));
                if ($pt === '' && $pd === '' && $pl === '') continue;
                $projectsHtml .= '<div class="item"><div class="item-title">' . ($pt !== '' ? $pt : 'Project') . '</div>';
                if ($pd !== '') {
                    $projectsHtml .= '<div class="item-desc">' . nl2br($pd) . '</div>';
                }
                if ($pl !== '') {
                    $projectsHtml .= '<div class="item-meta"><a href="' . $pl . '" target="_blank" rel="noreferrer">' . $pl . '</a></div>';
                }
                $projectsHtml .= '</div>';
            }
        }

        $cover = $coverLetter ? htmlspecialchars($coverLetter) : '';

        $skillsPills = implode('', array_map(fn($s) => '<span class="pill">' . $s . '</span>', $skills));
        $hobbyPills = implode('', array_map(fn($s) => '<span class="pill">' . $s . '</span>', $hobbies));

        $eduLines = [];
        if ($degreeName !== '') $eduLines[] = $degreeName;
        if ($degreeCollege !== '') $eduLines[] = $degreeCollege;
        if ($degreeCgpa !== '') $eduLines[] = 'CGPA/GPA: ' . $degreeCgpa;
        if (!empty($tenth)) $eduLines[] = '10th: ' . htmlspecialchars((string) $tenth);
        if (!empty($twelfth)) $eduLines[] = '12th: ' . htmlspecialchars((string) $twelfth);
        $eduText = htmlspecialchars(implode(' | ', $eduLines));

        $metaParts = array_filter([
            $phone !== '' ? $phone : null,
            $email !== '' ? $email : null,
            $linkedin !== '' ? $linkedin : null,
            $github !== '' ? $github : null,
            $portfolio !== '' ? $portfolio : null,
        ]);

        $metaHtml = '';
        foreach ($metaParts as $m) {
            $metaHtml .= '<span class="meta">' . $m . '</span>';
        }

        $experienceHtml = '';
        if (($profile['is_fresher'] ?? true) === false) {
            $items = array_filter([
                $totalYears !== '' ? 'Experience: ' . $totalYears . ' years' : null,
                $lastSalaryText !== '' ? 'Last Salary: ' . $lastSalaryText : null,
                $expectedSalaryText !== '' ? 'Expected Salary: ' . $expectedSalaryText : null,
            ]);
            if (!empty($items)) {
                $experienceHtml .= '<div class="section"><div class="h">Experience</div><div class="p">' . htmlspecialchars(implode(' | ', $items)) . '</div></div>';
            }
        } else {
            $experienceHtml .= '<div class="section"><div class="h">Experience</div><div class="p">Fresher</div></div>';
        }

        $projectsSection = $projectsHtml !== '' ? '<div class="section"><div class="h">Projects</div>' . $projectsHtml . '</div>' : '';
        $coverSection = $cover !== '' ? '<div class="section"><div class="h">Cover Letter</div><div class="p">' . nl2br($cover) . '</div></div>' : '';

        return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Resume</title>'
            . '<style>'
            . 'body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:' . $text . ';}'
            . '.page{max-width:860px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;}'
            . '.header{padding:24px 28px;background:linear-gradient(135deg,' . $accent . ',#111827);color:#fff;}'
            . '.name{font-size:28px;font-weight:800;margin:0 0 6px 0;}'
            . '.meta{display:inline-block;margin-right:10px;font-size:13px;opacity:.95;background:rgba(255,255,255,.12);padding:6px 10px;border-radius:999px;}'
            . '.content{padding:22px 28px;display:grid;grid-template-columns:1fr 300px;gap:18px;}'
            . '.section{margin-bottom:16px;}'
            . '.h{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:' . $muted . ';font-weight:700;margin-bottom:6px;}'
            . '.p{font-size:14px;line-height:1.6;color:' . $text . ';}'
            . '.pill{display:inline-block;background:' . $pill . ';border:1px solid rgba(0,0,0,.06);padding:6px 10px;border-radius:999px;margin:0 6px 6px 0;font-size:12px;color:' . $text . ';}'
            . '.item{border:1px solid #eef2f7;border-radius:12px;padding:12px 12px;margin-bottom:10px;background:#fff;}'
            . '.item-title{font-weight:700;margin-bottom:4px;}'
            . '.item-desc{font-size:13px;color:' . $text . ';line-height:1.5;}'
            . '.item-meta{font-size:12px;color:' . $muted . ';margin-top:6px;}'
            . 'a{color:' . $accent . ';text-decoration:none;}'
            . '@media(max-width:860px){.content{grid-template-columns:1fr;}}'
            . '</style></head><body><div class="page">'
            . '<div class="header"><div class="name">' . $name . '</div><div>' . $metaHtml . '</div></div>'
            . '<div class="content"><div>'
            . '<div class="section"><div class="h">Overview</div><div class="p">' . nl2br($overview) . '</div></div>'
            . $experienceHtml
            . $projectsSection
            . $coverSection
            . '</div><div>'
            . '<div class="section"><div class="h">Skills</div>' . ($skillsPills !== '' ? $skillsPills : '<div class="p">—</div>') . '</div>'
            . '<div class="section"><div class="h">Education</div><div class="p">' . ($eduText !== '' ? $eduText : '—') . '</div></div>'
            . '<div class="section"><div class="h">Hobbies</div>' . ($hobbyPills !== '' ? $hobbyPills : '<div class="p">—</div>') . '</div>'
            . '</div></div></div></body></html>';
    }

    /**
     * Get candidate's applications
     */
    public function myApplications(Request $request)
    {
        $candidate = Auth::guard('member')->user();

        $applications = JobApplication::with(['job' => function($q) {
                $q->select('id', 'title', 'company', 'location', 'job_type', 'salary', 'status as job_status');
            }])
            ->where('candidate_id', $candidate->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Application status counts
        $statusCounts = [
            'applied' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'applied')->count(),
            'viewed' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'viewed')->count(),
            'shortlisted' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'shortlisted')->count(),
            'assigned_to_calling_member' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'assigned_to_calling_member')->count(),
            'calling_in_progress' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'calling_in_progress')->count(),
            'calling_approved' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'calling_approved')->count(),
            'calling_rejected' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'calling_rejected')->count(),
            'admin_review' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'admin_review')->count(),
            'offer_letter_generated' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'offer_letter_generated')->count(),
            'waiting_list' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'waiting_list')->count(),
            'hired' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'hired')->count(),
            'not_selected' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'not_selected')->count(),
            'rejected' => JobApplication::where('candidate_id', $candidate->id)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Member/MyApplications', [
            'applications' => $applications,
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Save a job (toggle save)
     */
    public function save(Job $job)
    {
        $member = Auth::guard('member')->user();

        if ($job->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This job is not available.',
            ], 404);
        }

        SavedJob::firstOrCreate([
            'member_id' => $member->id,
            'job_id' => $job->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job saved successfully.',
            'is_saved' => true,
        ]);
    }

    /**
     * Unsave a job (remove from saved)
     */
    public function unsave(Job $job)
    {
        $member = Auth::guard('member')->user();

        SavedJob::where('member_id', $member->id)
            ->where('job_id', $job->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job removed from saved.',
            'is_saved' => false,
        ]);
    }

    /**
     * Withdraw application
     */
    public function withdraw(JobApplication $application)
    {
        $candidate = Auth::guard('member')->user();

        if ($application->candidate_id !== $candidate->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        if (!in_array($application->status, ['applied', 'viewed'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot withdraw application at this stage.',
            ], 400);
        }

        $application->delete();

        // Decrement job applicants count
        Job::where('id', $application->job_id)->decrement('applicants');

        return response()->json([
            'success' => true,
            'message' => 'Application withdrawn successfully.',
        ]);
    }
}
