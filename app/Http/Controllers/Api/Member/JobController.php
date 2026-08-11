<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\SavedJob;
use App\Services\GeocodingService;
use App\Support\JobQuestionHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class JobController extends Controller
{
    private function getProfileCompletionData($member): array
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

    private function buildGeneratedResumeHtml($member, array $profile, string $theme, ?string $coverLetter): string
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
        $name = htmlspecialchars((string) ($member->name ?? ''));
        $email = htmlspecialchars((string) ($member->email ?? ''));
        $phone = htmlspecialchars((string) ($member->phone ?? ''));

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

    public function index(Request $request, GeocodingService $geocodingService)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'job_type' => ['nullable', 'string', 'max:50'],
            'job_category' => ['nullable', 'string', 'max:100'],
            'job_location' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'distance' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'latitude' => ['nullable', 'decimal:6,8', 'between:-90,90'],
            'longitude' => ['nullable', 'decimal:6,8', 'between:-180,180'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $member = $request->user();
        $query = Job::query()
            ->with(['creator'])
            ->where('status', 'active');

        if (! empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['job_type'])) {
            $query->where('job_type', $validated['job_type']);
        }

        if (! empty($validated['job_category'])) {
            $query->where('job_category', $validated['job_category']);
        }

        if (! empty($validated['job_location'])) {
            $query->where('location', 'like', '%' . $validated['job_location'] . '%');
        }

        $coordinates = $this->resolveCoordinates(
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null,
            $validated['location'] ?? null,
            $member,
            $geocodingService
        );

        if ($coordinates !== null) {
            $this->applyDistanceSelection($query, $coordinates['latitude'], $coordinates['longitude']);

            if (! empty($validated['distance'])) {
                $query->havingRaw('distance_km <= ?', [(float) $validated['distance']]);
            }

            $query->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->orderBy('distance_km')
                ->orderByDesc('created_at');

            if ($member && ($request->filled('latitude') || $request->filled('longitude') || $request->filled('location'))) {
                $this->updateMemberLocation($member, $coordinates['latitude'], $coordinates['longitude'], $geocodingService);
            }
        } elseif (! empty($validated['location'])) {
            $query->where('location', 'like', '%' . $validated['location'] . '%')
                ->orderByDesc('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        $perPage = max(1, min((int) ($validated['per_page'] ?? 12), 50));
        $jobs = $query->paginate($perPage)->withQueryString();

        [$appliedJobIds, $savedJobIds] = $this->getMemberJobState($member);
        $this->attachJobFlags($jobs->getCollection(), $appliedJobIds, $savedJobIds, $coordinates !== null);

        return response()->json([
            'success' => true,
            'jobs' => $jobs,
            'applied_job_ids' => $appliedJobIds,
            'saved_job_ids' => $savedJobIds,
            'total_jobs' => $jobs->total(),
            'current_address' => $member?->current_address,
        ]);
    }

    public function show(Request $request, Job $job)
    {
        if ($job->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This job is not available.',
            ], 404);
        }

        $job->load(['creator' => function ($q) {
            $q->select('id', 'name');
        }]);

        $member = $request->user();
        $application = JobApplication::query()
            ->where('job_id', $job->id)
            ->where('candidate_id', $member->id)
            ->first();

        $isSaved = SavedJob::query()
            ->where('member_id', $member->id)
            ->where('job_id', $job->id)
            ->exists();

        return response()->json([
            'success' => true,
            'job' => $job,
            'has_applied' => (bool) $application,
            'application' => $application,
            'is_saved' => $isSaved,
        ]);
    }

    public function save(Request $request, Job $job)
    {
        if ($job->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This job is not available.',
            ], 404);
        }

        $member = $request->user();

        SavedJob::query()->firstOrCreate([
            'member_id' => $member->id,
            'job_id' => $job->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job saved.',
            'is_saved' => true,
        ]);
    }

    public function unsave(Request $request, Job $job)
    {
        $member = $request->user();

        SavedJob::query()
            ->where('member_id', $member->id)
            ->where('job_id', $job->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job removed from saved.',
            'is_saved' => false,
        ]);
    }

    public function savedIndex(Request $request)
    {
        $member = $request->user();
        $perPage = max(1, min((int) $request->input('per_page', 12), 50));

        $saved = SavedJob::query()
            ->with(['job' => function ($q) {
                $q->select('id', 'title', 'company', 'location', 'job_type', 'salary', 'status', 'company_image', 'created_at');
            }])
            ->where('member_id', $member->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'saved_jobs' => $saved,
        ]);
    }

    public function apply(Request $request, Job $job)
    {
        if ($job->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This job is no longer accepting applications.',
            ], 400);
        }

        $member = $request->user();

        $completion = $this->getProfileCompletionData($member);
        if ($completion['percentage'] < 35) {
            return response()->json([
                'success' => false,
                'message' => 'Complete at least 35% of your profile before applying.',
                'completion_percentage' => $completion['percentage'],
                'missing_fields' => $completion['missing_fields'],
                'min_required' => 35,
            ], 422);
        }

        $existing = JobApplication::query()
            ->where('job_id', $job->id)
            ->where('candidate_id', $member->id)
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already applied for this job.',
            ], 400);
        }

        $validated = $request->validate([
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx'],
            'application_profile' => ['nullable'],
            'screening_answers' => ['nullable'],
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

        $resumeUrl = null;
        if ($request->hasFile('resume')) {
            $file = $request->file('resume');
            $extension = $file->getClientOriginalExtension() ?: 'pdf';
            $relativeDir = 'member-resumes/' . ($member->uuid ?? Str::uuid());
            $filename = Str::uuid() . '.' . $extension;
            $path = $relativeDir . '/' . $filename;
            Storage::disk('public')->putFileAs($relativeDir, $file, $filename);
            $resumeUrl = 'storage/' . $path;

            $member->forceFill([
                'resume_path' => $path,
                'resume_original_name' => $file->getClientOriginalName(),
                'resume_mime' => $file->getClientMimeType(),
                'resume_size' => $file->getSize(),
                'resume_uploaded_at' => now(),
            ])->save();
        } elseif (!empty($member->resume_path)) {
            $resumeUrl = Str::startsWith($member->resume_path, ['http://', 'https://', 'storage/'])
                ? $member->resume_path
                : 'storage/' . ltrim($member->resume_path, '/');
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
            $resumeHtml = $this->buildGeneratedResumeHtml($member, $detailValidated, $theme, $validated['cover_letter'] ?? null);
            $path = 'generated-resumes/' . Str::uuid() . '.html';
            Storage::disk('public')->put($path, $resumeHtml);
            $resumeUrl = 'storage/' . $path;

            $member->forceFill([
                'candidate_profile' => $detailValidated,
            ])->save();
        }

        $application = JobApplication::create([
            'uuid' => (string) Str::uuid(),
            'job_id' => $job->id,
            'candidate_id' => $member->id,
            'cover_letter' => $validated['cover_letter'] ?? null,
            'resume_url' => $resumeUrl,
            'answers' => $applicationProfile,
            'screening_answers' => $screeningAnswers,
            'candidate_name' => $member->name,
            'candidate_email' => $member->email,
            'candidate_phone' => $member->phone,
            'candidate_skills' => $member->skills ?? null,
            'candidate_experience' => $member->experience ?? null,
            'status' => 'applied',
        ]);

        if (isset($job->applicants)) {
            $job->increment('applicants');
        }

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully!',
            'application' => $application,
        ]);
    }

    public function myApplications(Request $request)
    {
        $member = $request->user();
        if (! $member) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $validStatuses = ['all', 'applied', 'viewed', 'shortlisted', 'assigned_to_calling_member', 'calling_in_progress', 'calling_approved', 'calling_rejected', 'admin_review', 'offer_letter_generated', 'waiting_list', 'hired', 'not_selected', 'rejected'];
        $countedStatuses = array_filter($validStatuses, fn ($status) => $status !== 'all');

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'status' => ['nullable', 'string', 'in:' . implode(',', $validStatuses)],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $status = $validated['status'] ?? 'all';

        $query = JobApplication::query()
            ->with(['job' => function ($q) {
                $q->select('id', 'title', 'company', 'location', 'job_type', 'salary', 'status as job_status');
            }])
            ->where('candidate_id', $member->id);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $applications = $query
            ->orderByDesc('created_at')
            ->paginate(max(1, min($perPage, 50)))
            ->withQueryString();

        $statusCounts = JobApplication::query()
            ->where('candidate_id', $member->id)
            ->whereIn('status', $countedStatuses)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $statusCounts = array_merge(array_fill_keys($countedStatuses, 0), $statusCounts);
        $statusCounts = ['all' => array_sum($statusCounts)] + $statusCounts;

        return response()->json([
            'success' => true,
            'applications' => $applications,
            'status_counts' => $statusCounts,
            'filtered_status' => $status,
        ]);
    }

    public function locations(Request $request, GeocodingService $geocodingService)
    {
        $locationData = $this->buildLocationData($geocodingService);

        return response()->json([
            'success' => true,
            'locations' => $locationData['locations'],
            'neighbourhoods' => $locationData['neighbourhoods'],
            'suburbs' => $locationData['suburbs'],
        ]);
    }

    public function categories(Request $request, GeocodingService $geocodingService)
    {
        $query = Job::query()
            ->where('status', 'active')
            ->whereNotNull('job_category')
            ->where('job_category', '!=', '');

        $categories = (clone $query)
            ->distinct()
            ->orderBy('job_category')
            ->pluck('job_category')
            ->values();

        $response = [
            'success' => true,
            'categories' => $categories,
        ];

        if ($request->boolean('with_count')) {
            $response['counts'] = (clone $query)
                ->select('job_category', DB::raw('COUNT(*) as count'))
                ->groupBy('job_category')
                ->orderBy('job_category')
                ->get();
        }

        $locationData = $this->buildLocationData($geocodingService);
        $response['locations'] = $locationData['locations'];
        $response['neighbourhoods'] = $locationData['neighbourhoods'];
        $response['suburbs'] = $locationData['suburbs'];

        return response()->json($response);
    }
    /**
     * Search jobs near a given location using haversine distance.
     *
     * GET /api/jobs/nearby?latitude=28.6139&longitude=77.2090&radius=50&unit=km
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function nearby(Request $request, GeocodingService $geocodingService)
    {
        $validated = $request->validate([
            'location' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'decimal:6,8', 'between:-90,90'],
            'longitude' => ['nullable', 'decimal:6,8', 'between:-180,180'],
            'radius_km' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'search' => ['nullable', 'string', 'max:255'],
            'job_type' => ['nullable', 'string', 'max:50'],
            'job_category' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $member = $request->user();
        $coordinates = $this->resolveCoordinates(
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null,
            $validated['location'] ?? null,
            $member,
            $geocodingService
        );

        if ($coordinates === null) {
            return response()->json([
                'success' => false,
                'message' => 'Latitude and longitude or a location are required.',
            ], 422);
        }

        if ($member && ($request->filled('latitude') || $request->filled('longitude') || $request->filled('location'))) {
            $this->updateMemberLocation($member, $coordinates['latitude'], $coordinates['longitude'], $geocodingService);
        }

        $query = Job::query()
            ->with(['creator'])
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        $this->applyDistanceSelection($query, $coordinates['latitude'], $coordinates['longitude']);
        $query->orderBy('distance_km');

        if (! empty($validated['radius_km'])) {
            $query->havingRaw('distance_km <= ?', [(float) $validated['radius_km']]);
        }

        if (! empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['job_type'])) {
            $query->where('job_type', $validated['job_type']);
        }

        if (! empty($validated['job_category'])) {
            $query->where('job_category', $validated['job_category']);
        }

        $perPage = max(1, min((int) ($validated['per_page'] ?? 12), 50));
        $jobs = $query->paginate($perPage)->withQueryString();

        [$appliedJobIds, $savedJobIds] = $this->getMemberJobState($member);
        $this->attachJobFlags($jobs->getCollection(), $appliedJobIds, $savedJobIds, true);

        return response()->json([
            'success' => true,
            'jobs' => $jobs,
            'total_jobs' => $jobs->total(),
            'current_address' => $member?->fresh()?->current_address,
            'latitude' => $coordinates['latitude'],
            'longitude' => $coordinates['longitude'],
        ]);
    }

    private function resolveCoordinates(
        mixed $latitude,
        mixed $longitude,
        ?string $location,
        $member,
        GeocodingService $geocodingService
    ): ?array {
        if ($latitude !== null && $longitude !== null && $latitude !== '' && $longitude !== '') {
            return [
                'latitude' => round((float) $latitude, 6),
                'longitude' => round((float) $longitude, 6),
            ];
        }

        $location = trim((string) $location);
        if ($location !== '') {
            $geoResult = $geocodingService->geocodeAddress($location);
            if (is_array($geoResult) && isset($geoResult['latitude'], $geoResult['longitude'])) {
                return [
                    'latitude' => round((float) $geoResult['latitude'], 6),
                    'longitude' => round((float) $geoResult['longitude'], 6),
                ];
            }
        }

        if ($member && $member->latitude !== null && $member->longitude !== null) {
            return [
                'latitude' => round((float) $member->latitude, 6),
                'longitude' => round((float) $member->longitude, 6),
            ];
        }

        return null;
    }

    private function applyDistanceSelection($query, float $latitude, float $longitude): void
    {
        $haversineSql = GeocodingService::haversineSql($latitude, $longitude, 'job_posts.latitude', 'job_posts.longitude');

        $query->select('job_posts.*')
            ->selectRaw("{$haversineSql} AS distance_km");
    }

    private function getMemberJobState($member): array
    {
        if (! $member) {
            return [[], []];
        }

        $appliedJobIds = JobApplication::query()
            ->where('candidate_id', $member->id)
            ->pluck('job_id')
            ->toArray();

        $savedJobIds = SavedJob::query()
            ->where('member_id', $member->id)
            ->pluck('job_id')
            ->toArray();

        return [$appliedJobIds, $savedJobIds];
    }

    private function attachJobFlags($collection, array $appliedJobIds, array $savedJobIds, bool $hasDistance = false): void
    {
        $appliedMap = array_flip($appliedJobIds);
        $savedMap = array_flip($savedJobIds);

        $collection->transform(function ($job) use ($appliedMap, $savedMap, $hasDistance) {
            $job->is_saved = isset($savedMap[$job->id]);
            $job->is_applied = isset($appliedMap[$job->id]);

            if ($hasDistance && isset($job->distance_km)) {
                $job->distance_km = round((float) $job->distance_km, 2);
            }

            return $job;
        });
    }

    private function buildLocationData(GeocodingService $geocodingService): array
    {
        $locations = Job::query()
            ->where('status', 'active')
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->selectRaw('location, MIN(latitude) as latitude, MIN(longitude) as longitude, COUNT(*) as jobs_count')
            ->groupBy('location')
            ->orderBy('location')
            ->get()
            ->map(function ($location) use ($geocodingService) {
                $latitude = $location->latitude !== null ? round((float) $location->latitude, 6) : null;
                $longitude = $location->longitude !== null ? round((float) $location->longitude, 6) : null;
                $area = $geocodingService->getAreaDetailsFromCoordinates($latitude, $longitude);

                return [
                    'location' => $location->location,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'jobs_count' => (int) $location->jobs_count,
                    'formatted_address' => $area['formatted_address'],
                    'neighbourhood' => $area['neighbourhood'],
                    'neighborhood' => $area['neighbourhood'],
                    'suburb' => $area['suburb'],
                ];
            })
            ->values();

        return [
            'locations' => $locations,
            'neighbourhoods' => $locations->pluck('neighbourhood')->filter()->unique()->sort()->values(),
            'suburbs' => $locations->pluck('suburb')->filter()->unique()->sort()->values(),
        ];
    }

    private function updateMemberLocation($member, float $latitude, float $longitude, GeocodingService $geocodingService): void
    {
        $member->forceFill([
            'latitude' => round($latitude, 6),
            'longitude' => round($longitude, 6),
            'current_address' => $geocodingService->reverseGeocode($latitude, $longitude),
        ])->save();
    }

    public function withdraw(Request $request, JobApplication $application)
    {
        $member = $request->user();

        if ((int) $application->candidate_id !== (int) $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $application->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application withdrawn.',
        ]);
    }
}
