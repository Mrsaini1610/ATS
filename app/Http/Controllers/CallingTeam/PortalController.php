<?php

namespace App\Http\Controllers\CallingTeam;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Member;
use App\Models\Notification;
use App\Models\SuperAdminPasswordLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PortalController extends Controller
{
    private const DASHBOARD_STATUSES = [
        'assigned_to_calling_member',
        'calling_in_progress',
        'calling_approved',
        'calling_rejected',
    ];

    public function dashboard(Request $request)
    {
        $payload = $this->buildApplicationsPayload($request);

        return Inertia::render('CallingTeam/Dashboard', [
            'applications' => $payload['applications'],
            'statusCounts' => $payload['statusCounts'],
            'filters' => $payload['filters'],
        ]);
    }

    public function userProfile(Request $request)
    {
        return Inertia::render('CallingTeam/UserProfile');
    }

    public function userProfileUpdate(Request $request)
    {
        $user = Auth::guard('callingteam')->user();

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:members,username,' . $user->id,
            'email' => 'required|email|unique:members,email,' . $user->id,
        ]);

        $user->update([
            'name' => $validatedData['name'],
            'username' => $validatedData['username'],
            'email' => $validatedData['email'],
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function userProfilePhotoUpdate(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $auth = Auth::guard('callingteam')->user();
        $member = Member::findOrFail($auth->id);

        if (!empty($member->image) && !filter_var($member->image, FILTER_VALIDATE_URL)) {
            if (Storage::disk('public')->exists($member->image)) {
                Storage::disk('public')->delete($member->image);
            }
        }

        $profilePhoto = $request->file('profile_photo');
        $filename = now()->format('Y_m_d_His_') . Str::random(16) . '.' . $profilePhoto->getClientOriginalExtension();
        $storedPath = $profilePhoto->storeAs('profile_image', $filename, 'public');

        $member->update([
            'image' => $storedPath,
        ]);

        return redirect()->back()->with('success', 'Profile image updated successfully.');
    }

    public function userProfilePhotoRemove(Request $request)
    {
        $memberId = Auth::guard('callingteam')->id();
        $member = Member::findOrFail($memberId);

        if (!empty($member->image) && !filter_var($member->image, FILTER_VALIDATE_URL)) {
            if (Storage::disk('public')->exists($member->image)) {
                Storage::disk('public')->delete($member->image);
            }
        }

        $member->update([
            'image' => null,
        ]);

        return redirect()->back()->with('success', 'Profile image removed successfully.');
    }

    public function userProfilePasswordUpdate(Request $request)
    {
        $user = Auth::guard('callingteam')->user();
        $member = Member::findOrFail($user->id);
        $requiresCurrentPassword = !$member->must_change_password;

        $request->validate([
            'current_password' => [
                $requiresCurrentPassword ? 'required' : 'nullable',
                'string',
                function ($attribute, $value, $fail) use ($user, $requiresCurrentPassword) {
                    if ($requiresCurrentPassword && !Hash::check($value, $user->password)) {
                        $fail('The current password is incorrect.');
                    }
                },
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8),
                'different:current_password',
            ],
        ]);

        $member->update([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        SuperAdminPasswordLog::create([
            'email' => $user->email,
            'role' => 'calling_team',
            'new_password' => $request->password,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    public function listApplications(Request $request)
    {
        $payload = $this->buildApplicationsPayload($request);

        return response()->json([
            'success' => true,
            'data' => $payload['applications'],
            'statusCounts' => $payload['statusCounts'],
            'filters' => $payload['filters'],
        ]);
    }

    public function show(JobApplication $application)
    {
        $application = $this->resolveAssignedApplication($application);

        $application->load([
            'job:id,title,company,location,job_type,created_by',
            'candidate:id,name,email,phone,image',
            'assignedCallingTeamMember:id,name,email,phone',
        ]);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    public function updateCallOutcome(Request $request, JobApplication $application)
    {
        $application = $this->resolveAssignedApplication($application);

        $validated = $request->validate([
            'call_outcome' => 'required|in:interested,not_interested',
            'call_outcome_reason' => 'nullable|string|max:5000',
            'call_notes' => 'nullable|string|max:5000',
        ]);

        if ($validated['call_outcome'] === 'not_interested' && blank($validated['call_outcome_reason'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Reason is required when candidate is not interested.',
            ], 422);
        }

        $application->update([
            'status' => 'calling_in_progress',
            'call_outcome' => $validated['call_outcome'],
            'call_outcome_reason' => $validated['call_outcome_reason'] ?? null,
            'call_notes' => $validated['call_notes'] ?? $application->call_notes,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::guard('callingteam')->id(),
        ]);

        $notificationType = $validated['call_outcome'] === 'interested'
            ? 'candidate_interested'
            : 'candidate_not_interested';

        $this->notifyAdmin($application, $notificationType, [
            'call_outcome' => $validated['call_outcome'],
            'call_outcome_reason' => $validated['call_outcome_reason'] ?? null,
            'call_notes' => $validated['call_notes'] ?? null,
        ]);

        $this->notifyCandidate($application, $notificationType, [
            'call_outcome' => $validated['call_outcome'],
            'call_outcome_reason' => $validated['call_outcome_reason'] ?? null,
            'call_notes' => $validated['call_notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Call outcome updated successfully.',
            'data' => $application->fresh(['job', 'candidate', 'assignedCallingTeamMember']),
        ]);
    }

    public function scheduleInterview(Request $request, JobApplication $application)
    {
        $application = $this->resolveAssignedApplication($application);

        $validated = $request->validate([
            'interview_date_time' => 'required|date',
            'interview_mode' => 'required|in:offline,online',
            'interview_address' => 'nullable|string|max:5000',
            'interview_instructions' => 'nullable|string|max:5000',
            'interview_contact_person' => 'nullable|string|max:255',
            'call_notes' => 'nullable|string|max:5000',
        ]);

        if ($validated['interview_mode'] === 'offline') {
            validator(
                $validated,
                [
                    'interview_address' => 'required|string|max:5000',
                    'interview_contact_person' => 'required|string|max:255',
                ]
            )->validate();
        }

        $application->update([
            'status' => 'calling_in_progress',
            'call_outcome' => $application->call_outcome ?: 'interested',
            'call_notes' => $validated['call_notes'] ?? $application->call_notes,
            'interview_date_time' => $validated['interview_date_time'],
            'interview_mode' => $validated['interview_mode'],
            'interview_address' => $validated['interview_address'] ?? null,
            'interview_instructions' => $validated['interview_instructions'] ?? null,
            'interview_contact_person' => $validated['interview_contact_person'] ?? null,
            'interview_confirmed_at' => now(),
            'reviewed_at' => now(),
            'reviewed_by' => Auth::guard('callingteam')->id(),
        ]);

        $this->notifyAdmin($application, 'interview_scheduled', [
            'interview_date_time' => $validated['interview_date_time'],
            'interview_mode' => $validated['interview_mode'],
            'interview_address' => $validated['interview_address'] ?? null,
            'interview_instructions' => $validated['interview_instructions'] ?? null,
            'interview_contact_person' => $validated['interview_contact_person'] ?? null,
        ]);

        $this->notifyCandidate($application, 'interview_scheduled', [
            'interview_date_time' => $validated['interview_date_time'],
            'interview_mode' => $validated['interview_mode'],
            'interview_address' => $validated['interview_address'] ?? null,
            'interview_instructions' => $validated['interview_instructions'] ?? null,
            'interview_contact_person' => $validated['interview_contact_person'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Interview scheduled successfully.',
            'data' => $application->fresh(['job', 'candidate', 'assignedCallingTeamMember']),
        ]);
    }

    public function finalDecision(Request $request, JobApplication $application)
    {
        $application = $this->resolveAssignedApplication($application);

        $validated = $request->validate([
            'decision' => 'required|in:approved,rejected,follow_up,no_response',
            'decision_reason' => 'nullable|string|max:5000',
            'call_notes' => 'nullable|string|max:5000',
        ]);

        if ($validated['decision'] === 'approved' && blank($validated['decision_reason'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Approval reason is required.',
            ], 422);
        }

        $application->update([
            'status' => $validated['decision'] === 'approved'
                ? 'calling_approved'
                : ($validated['decision'] === 'rejected' ? 'calling_rejected' : 'calling_in_progress'),
            'hiring_decision' => $validated['decision'],
            'hiring_decision_reason' => $validated['decision_reason'] ?? null,
            'hiring_decision_updated_at' => now(),
            'call_notes' => $validated['call_notes'] ?? $application->call_notes,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::guard('callingteam')->id(),
        ]);

        $notificationType = match ($validated['decision']) {
            'approved' => 'candidate_approved',
            'rejected' => 'candidate_rejected',
            'follow_up' => 'candidate_follow_up',
            default => 'candidate_no_response',
        };

        $this->notifyAdmin($application, $notificationType, [
            'hiring_decision' => $validated['decision'],
            'hiring_decision_reason' => $validated['decision_reason'] ?? null,
            'call_notes' => $validated['call_notes'] ?? null,
        ]);

        $this->notifyCandidate($application, $notificationType, [
            'hiring_decision' => $validated['decision'],
            'hiring_decision_reason' => $validated['decision_reason'] ?? null,
            'call_notes' => $validated['call_notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Final decision updated successfully.',
            'data' => $application->fresh(['job', 'candidate', 'assignedCallingTeamMember']),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('callingteam')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('callingteam.login')->with('success', 'Logout successful');
    }

    private function buildApplicationsPayload(Request $request): array
    {
        $memberId = Auth::guard('callingteam')->id();
        $perPage = max(1, min((int) $request->input('per_page', 12), 50));

        $query = JobApplication::query()
            ->with([
                'job:id,title,company,location,job_type,created_by',
                'candidate:id,name,email,phone,image',
                'assignedCallingTeamMember:id,name,email,phone',
            ])
            ->where('assigned_calling_team_member_id', $memberId)
            ->orderByDesc('updated_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($builder) use ($search) {
                $builder->where('candidate_name', 'like', "%{$search}%")
                    ->orWhere('candidate_email', 'like', "%{$search}%")
                    ->orWhere('candidate_phone', 'like', "%{$search}%")
                    ->orWhereHas('job', function ($jobQuery) use ($search) {
                        $jobQuery->where('title', 'like', "%{$search}%")
                            ->orWhere('company', 'like', "%{$search}%");
                    });
            });
        }

        $applications = $query->paginate($perPage)->withQueryString();

        $statusCounts = ['total' => JobApplication::where('assigned_calling_team_member_id', $memberId)->count()];
        foreach (self::DASHBOARD_STATUSES as $status) {
            $statusCounts[$status] = JobApplication::where('assigned_calling_team_member_id', $memberId)
                ->where('status', $status)
                ->count();
        }

        return [
            'applications' => $applications,
            'statusCounts' => $statusCounts,
            'filters' => [
                'status' => $request->input('status', ''),
                'search' => $request->input('search', ''),
            ],
        ];
    }

    private function resolveAssignedApplication(JobApplication $application): JobApplication
    {
        abort_unless(
            (int) $application->assigned_calling_team_member_id === (int) Auth::guard('callingteam')->id(),
            403,
            'Unauthorized action.'
        );

        return $application;
    }

    private function notifyAdmin(JobApplication $application, string $type, array $extraData = []): void
    {
        $application->loadMissing('job');

        if (!$application->job?->created_by) {
            return;
        }

        Notification::create([
            'model' => 'admin',
            'listing_id' => $application->job->created_by,
            'job_id' => $application->job_id,
            'type' => $type,
            'status' => 'unread',
            'data' => array_merge($this->notificationData($application), $extraData),
        ]);
    }

    private function notifyCandidate(JobApplication $application, string $type, array $extraData = []): void
    {
        Notification::create([
            'model' => 'member',
            'listing_id' => $application->candidate_id,
            'job_id' => $application->job_id,
            'type' => $type,
            'status' => 'unread',
            'data' => array_merge($this->notificationData($application), $extraData),
        ]);
    }

    private function notificationData(JobApplication $application): array
    {
        $application->loadMissing(['job:id,uuid,title,company,created_by', 'assignedCallingTeamMember:id,name,email']);

        return [
            'application_id' => $application->id,
            'application_uuid' => $application->uuid,
            'job_id' => $application->job_id,
            'job_uuid' => $application->job?->uuid,
            'job_title' => $application->job?->title,
            'job_company' => $application->job?->company,
            'candidate_id' => $application->candidate_id,
            'candidate_name' => $application->candidate_name,
            'candidate_email' => $application->candidate_email,
            'candidate_phone' => $application->candidate_phone,
            'status' => $application->status,
            'hiring_decision' => $application->hiring_decision,
            'hiring_decision_reason' => $application->hiring_decision_reason,
            'calling_team_member_id' => $application->assigned_calling_team_member_id,
            'calling_team_member_name' => $application->assignedCallingTeamMember?->name,
        ];
    }
}
