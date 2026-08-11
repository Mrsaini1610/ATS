<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobRequestController extends Controller
{
    private function publicDiskPathFromDbValue(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $path = parse_url($value, PHP_URL_PATH) ?: '';
        } else {
            $path = $value;
        }

        if (str_starts_with($path, '/storage/')) {
            $path = substr($path, strlen('/storage/'));
        } elseif (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        return ltrim($path, '/');
    }

    /**
     * Display job requests page (Inertia)
     */
    public function index()
    {
        return Inertia::render('SuperAdmin/JobRequests/Index');
    }

    /**
     * Display all jobs listing page (Inertia)
     */
    public function allJobs()
    {
        return Inertia::render('SuperAdmin/JobRequests/AllJobs');
    }

    public function applicationsIndex()
    {
        return Inertia::render('SuperAdmin/JobApplications/Index');
    }

    public function listApplications(Request $request)
    {
        $perPage = max(1, min((int) $request->input('per_page', 15), 50));

        $query = JobApplication::query()
            ->with([
                'job' => function ($q) {
                    $q->select('id', 'title', 'company', 'created_by');
                },
                'candidate' => function ($q) {
                    $q->select('id', 'name', 'email', 'phone', 'image');
                },
            ])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('job_id')) {
            $query->where('job_id', (int) $request->input('job_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('candidate_name', 'like', "%{$search}%")
                    ->orWhere('candidate_email', 'like', "%{$search}%")
                    ->orWhere('candidate_phone', 'like', "%{$search}%")
                    ->orWhereHas('job', function ($jq) use ($search) {
                        $jq->where('title', 'like', "%{$search}%")
                            ->orWhere('company', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $applications = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Get all job requests (pending, active, declined)
     */
    public function getAllRequests()
    {
        $jobs = Job::with(['creator', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Get pending job requests
     */
    public function getPendingRequests()
    {
        $jobs = Job::with('creator')
            ->pending()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Get single job full details
     */
    public function show($id)
    {
        $job = Job::with([
            'creator',
            'approver',
            'applications' => function ($q) {
                $q->orderByDesc('created_at');
            },
            'applications.candidate',
        ])->find($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Job post no longer exists or has been deleted.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $job,
        ]);
    }

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'job_type' => 'required|string|max:50',
            'openings' => 'nullable|integer|min:1',
            'experience' => 'nullable|string|max:100',
            'salary' => 'nullable|string|max:100',
            'skills' => 'nullable',
            'perks' => 'nullable',
            'key_responsibilities' => 'nullable',
            'qualifications' => 'nullable',
            'assets' => 'nullable',
            'last_date' => 'nullable|date',
            'company_image' => 'nullable|image|max:5120',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email|max:255',
            'company_address' => 'nullable|string',
        ]);

        // Convert JSON strings to arrays for array-based fields
        foreach (['skills', 'perks', 'key_responsibilities', 'qualifications', 'assets'] as $arrField) {
            if (!empty($validated[$arrField]) && is_string($validated[$arrField])) {
                $decoded = json_decode($validated[$arrField], true);
                $validated[$arrField] = is_array($decoded) ? $decoded : [];
            } elseif (empty($validated[$arrField])) {
                $validated[$arrField] = [];
            }
        }

        // Default openings to 1
        $validated['openings'] = (int) ($validated['openings'] ?? 1);
        if ($validated['openings'] < 1) {
            $validated['openings'] = 1;
        }

        if ($request->hasFile('company_image')) {
            $oldValue = $job->getRawOriginal('company_image');
            $oldPath = $this->publicDiskPathFromDbValue($oldValue);
            if (!empty($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('company_image')->store('job-images', 'public');
            $validated['company_image'] = $path;
        }

        $job->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Job updated successfully.',
            'data' => $job->fresh(['creator', 'approver']),
        ]);
    }

    /**
     * Approve a job request
     */
    public function approve(Job $job)
    {
        if ($job->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending jobs can be approved.',
            ], 400);
        }

        $superAdminId = Auth::guard('superadmin')->id();
        $job->approve($superAdminId);

        return response()->json([
            'success' => true,
            'message' => 'Job approved successfully.',
            'data' => $job->fresh(['creator', 'approver']),
        ]);
    }

    /**
     * Reject a job request
     */
    public function reject(Request $request, Job $job)
    {
        if ($job->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending jobs can be rejected.',
            ], 400);
        }

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $superAdminId = Auth::guard('superadmin')->id();
        $job->reject($superAdminId, $validated['rejection_reason'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Job rejected successfully.',
            'data' => $job->fresh(['creator', 'approver']),
        ]);
    }

    /**
     * Resend edited job for approval (by Super Admin)
     * This is different from admin resend - allows super admin to send back for changes
     */
    public function requestChanges(Request $request, Job $job)
    {
        $validated = $request->validate([
            'change_request' => 'required|string|max:500',
        ]);

        $superAdminId = Auth::guard('superadmin')->id();

        // Add log entry for change request
        $logs = $job->approval_logs ?? [];
        $logs[] = [
            'action' => 'change_requested',
            'user_id' => $superAdminId,
            'reason' => $validated['change_request'],
            'timestamp' => now()->toDateTimeString(),
        ];

        $job->update([
            'status' => 'declined',
            'rejection_reason' => $validated['change_request'],
            'approval_logs' => $logs,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Change request sent to admin.',
            'data' => $job->fresh(['creator', 'approver']),
        ]);
    }

    /**
     * Delete a job request
     */
    public function destroy(Job $job)
    {
        // Delete company image if exists
        $oldValue = $job->getRawOriginal('company_image');
        $oldPath = $this->publicDiskPathFromDbValue($oldValue);
        if (!empty($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job request deleted successfully.',
        ]);
    }

    /**
     * Permanently close a job
     */
    public function close(Job $job)
    {
        // Only active or inactive jobs can be closed
        if (!in_array($job->status, ['active', 'inactive'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only active or inactive jobs can be closed.',
            ], 400);
        }

        $superAdminId = Auth::guard('superadmin')->id();

        // Add log entry for closing
        $logs = $job->approval_logs ?? [];
        $logs[] = [
            'action' => 'closed',
            'user_id' => $superAdminId,
            'timestamp' => now()->toDateTimeString(),
        ];

        $job->update([
            'status' => 'closed',
            'approval_logs' => $logs,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job closed successfully.',
            'data' => $job->fresh(['creator', 'approver']),
        ]);
    }

    /**
     * Toggle job active/inactive status (Super Admin)
     */
    public function toggleStatus(Request $request, Job $job)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        // Allow toggling if job is approved (active, inactive) or closed (can be reactivated)
        if (!in_array($job->status, ['active', 'inactive', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only approved or closed jobs can be toggled.',
            ], 400);
        }

        $job->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Job status updated successfully.',
            'data' => $job->fresh(['creator', 'approver']),
        ]);
    }

    public function applicationDecision(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $newStatus = $validated['action'] === 'approve' ? 'shortlisted' : 'rejected';

        if (!in_array($application->status, ['applied', 'viewed', 'shortlisted', 'waiting_list', 'hired', 'not_selected', 'rejected'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid application status.',
            ], 400);
        }

        $application->update([
            'status' => $newStatus,
            'admin_notes' => $validated['admin_notes'] ?? $application->admin_notes,
            'reviewed_at' => now(),
            'reviewed_by' => null,
        ]);

        $application->load([
            'job' => function ($q) {
                $q->select('id', 'title', 'company', 'created_by');
            },
            'candidate' => function ($q) {
                $q->select('id', 'name', 'email', 'phone');
            },
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully.',
            'data' => $application,
        ]);
    }

    /**
     * Get job statistics for dashboard
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Job::count(),
            'pending' => Job::pending()->count(),
            'active' => Job::active()->count(),
            'declined' => Job::declined()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Display all job applicants page (Inertia) - Super Admin sees all
     */
    public function applicants()
    {
        return Inertia::render('SuperAdmin/JobRequests/JobApplicants');
    }

    /**
     * Get all applicants for all jobs (Super Admin)
     */
    public function getAllApplicants(Request $request)
    {
        $query = JobApplication::with(['job' => function($q) {
                $q->select('id', 'title', 'company', 'location', 'job_type', 'created_by');
            }, 'candidate' => function($q) {
                $q->select('id', 'name', 'email', 'phone', 'image');
            }, 'reviewer' => function($q) {
                $q->select('id', 'name');
            }])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by job
        if ($request->has('job_id') && $request->job_id) {
            $query->where('job_id', $request->job_id);
        }

        // Filter by admin/creator
        if ($request->has('admin_id') && $request->admin_id) {
            $query->whereHas('job', function($q) use ($request) {
                $q->where('created_by', $request->admin_id);
            });
        }

        // Search by candidate name, email, or job title
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('candidate_name', 'like', "%{$search}%")
                  ->orWhere('candidate_email', 'like', "%{$search}%")
                  ->orWhereHas('job', function($jq) use ($search) {
                      $jq->where('title', 'like', "%{$search}%");
                  });
            });
        }

        $applications = $query->paginate(12)->withQueryString();

        // Get all jobs for filter dropdown
        $jobs = Job::select('id', 'title', 'company')
            ->orderBy('title')
            ->get();

        // Status counts
        $statusCounts = [
            'applied' => JobApplication::where('status', 'applied')->count(),
            'viewed' => JobApplication::where('status', 'viewed')->count(),
            'shortlisted' => JobApplication::where('status', 'shortlisted')->count(),
            'assigned_to_calling_member' => JobApplication::where('status', 'assigned_to_calling_member')->count(),
            'calling_in_progress' => JobApplication::where('status', 'calling_in_progress')->count(),
            'calling_approved' => JobApplication::where('status', 'calling_approved')->count(),
            'calling_rejected' => JobApplication::where('status', 'calling_rejected')->count(),
            'admin_review' => JobApplication::where('status', 'admin_review')->count(),
            'offer_letter_generated' => JobApplication::where('status', 'offer_letter_generated')->count(),
            'waiting_list' => JobApplication::where('status', 'waiting_list')->count(),
            'hired' => JobApplication::where('status', 'hired')->count(),
            'not_selected' => JobApplication::where('status', 'not_selected')->count(),
            'rejected' => JobApplication::where('status', 'rejected')->count(),
            'total' => JobApplication::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $applications,
            'jobs' => $jobs,
            'statusCounts' => $statusCounts,
            'filters' => [
                'status' => $request->status ?? '',
                'job_id' => $request->job_id ?? '',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Get single applicant details (Super Admin)
     */
    public function getApplicantDetails(JobApplication $application)
    {
        $application->load(['job', 'candidate', 'reviewer']);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Update applicant status (Super Admin)
     */
    public function updateApplicantStatus(Request $request, JobApplication $application)
    {
        $superAdminId = Auth::guard('superadmin')->id();

        Log::info('Super admin job application status update requested.', [
            'application_id' => $application->id,
            'job_id' => $application->job_id,
            'candidate_id' => $application->candidate_id,
            'old_status' => $application->status,
            'requested_status' => $request->input('status'),
            'requested_by' => $superAdminId,
        ]);

        try {
            $validated = $request->validate([
                'status' => 'required|in:applied,viewed,shortlisted,assigned_to_calling_member,calling_in_progress,calling_approved,calling_rejected,admin_review,offer_letter_generated,waiting_list,hired,not_selected,rejected',
                'admin_notes' => 'nullable|string|max:5000',
            ]);

            Log::info('Super admin job application status validation passed.', [
                'application_id' => $application->id,
                'validated_status' => $validated['status'],
                'has_admin_notes' => !empty($validated['admin_notes']),
            ]);

            $application->update([
                'status' => $validated['status'],
                'admin_notes' => $validated['admin_notes'] ?? $application->admin_notes,
                'reviewed_at' => now(),
                'reviewed_by' => $superAdminId,
            ]);

            Log::info('Super admin job application status updated successfully.', [
                'application_id' => $application->id,
                'job_id' => $application->job_id,
                'candidate_id' => $application->candidate_id,
                'new_status' => $validated['status'],
                'reviewed_by' => $superAdminId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application status updated successfully.',
                'data' => $application->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Super admin job application status validation failed.', [
                'application_id' => $application->id,
                'requested_status' => $request->input('status'),
                'requested_by' => $superAdminId,
                'errors' => $e->errors(),
            ]);

            throw $e;
        } catch (\Exception $e) {
            Log::error('Super admin job application status update failed.', [
                'application_id' => $application->id,
                'job_id' => $application->job_id,
                'candidate_id' => $application->candidate_id,
                'requested_status' => $request->input('status'),
                'requested_by' => $superAdminId,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update application status.',
            ], 500);
        }
    }

    public function previewApplicantResume(JobApplication $application)
    {
        $application->load([
            'job:id,title,company,location',
            'candidate:id,name,email,phone,image,candidate_profile',
        ]);

        return response()->view('job_applications.resume_preview', [
            'resume' => $this->buildApplicantResumePreviewData($application),
        ]);
    }

    private function buildApplicantResumePreviewData(JobApplication $application): array
    {
        $candidate = $application->candidate;
        $profile = is_array($candidate?->candidate_profile) ? $candidate->candidate_profile : [];
        $education = is_array($profile['education'] ?? null) ? $profile['education'] : [];
        $experience = is_array($profile['experience'] ?? null) ? $profile['experience'] : [];
        $projects = collect($profile['projects'] ?? [])
            ->filter(fn ($project) => is_array($project))
            ->map(fn ($project) => [
                'title' => trim((string) ($project['title'] ?? '')),
                'description' => trim((string) ($project['description'] ?? '')),
                'link' => trim((string) ($project['link'] ?? '')),
            ])
            ->filter(fn ($project) => $project['title'] !== '' || $project['description'] !== '' || $project['link'] !== '')
            ->values()
            ->all();

        $skills = collect($profile['skills'] ?? [])
            ->filter(fn ($skill) => is_string($skill) && trim($skill) !== '')
            ->values()
            ->all();

        if (empty($skills) && is_array($application->candidate_skills)) {
            $skills = collect($application->candidate_skills)
                ->filter(fn ($skill) => is_string($skill) && trim($skill) !== '')
                ->values()
                ->all();
        }

        $summary = collect([
            $profile['summary'] ?? null,
            $profile['career_objective'] ?? null,
            $application->cover_letter,
        ])->filter(fn ($value) => is_string($value) && trim($value) !== '')
            ->implode("\n\n");

        return [
            'name' => $application->candidate_name ?: ($candidate?->name ?? 'Candidate'),
            'email' => $application->candidate_email ?: ($candidate?->email ?? null),
            'phone' => $application->candidate_phone ?: ($candidate?->phone ?? null),
            'job_title' => $application->job?->title,
            'company' => $application->job?->company,
            'location' => $profile['current_location'] ?? $profile['location'] ?? $application->job?->location,
            'profile_photo_url' => $this->resolveCandidateImageUrl($candidate?->image),
            'summary' => $summary,
            'skills' => $skills,
            'experience' => [
                'total_years' => $experience['total_years'] ?? ($application->candidate_experience ?? null),
                'current_company' => $experience['current_company'] ?? null,
                'current_designation' => $experience['current_designation'] ?? null,
                'last_salary_amount' => $experience['last_salary']['amount'] ?? null,
                'last_salary_unit' => $experience['last_salary']['unit'] ?? null,
                'expected_salary_amount' => $experience['expected_salary']['amount'] ?? null,
                'expected_salary_unit' => $experience['expected_salary']['unit'] ?? null,
            ],
            'education' => [
                [
                    'title' => '10th',
                    'subtitle' => $education['tenth']['percentage'] ?? null,
                ],
                [
                    'title' => '12th',
                    'subtitle' => $education['twelfth']['percentage'] ?? null,
                ],
                [
                    'title' => $education['degree']['name'] ?? 'Degree',
                    'subtitle' => collect([
                        $education['degree']['college'] ?? null,
                        $education['degree']['cgpa'] ?? null,
                    ])->filter()->implode(' | '),
                ],
            ],
            'projects' => $projects,
        ];
    }

    private function resolveCandidateImageUrl(?string $image): ?string
    {
        if (empty($image)) {
            return null;
        }

        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return $image;
        }

        return Storage::disk('public')->exists($image)
            ? Storage::disk('public')->url($image)
            : null;
    }
}
