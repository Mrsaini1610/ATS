<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $admin = auth('admin')->user();
        $canViewAll = $admin && ($admin->isSuperAdmin() || in_array('view_all_applications', $admin->permissionList(), true));
        $scope = $request->query('scope', $canViewAll ? 'all' : 'your');
        if (! $canViewAll) {
            $scope = 'your';
        }

        $query = JobApplication::query()
            ->with(['jobPost.companyRelation', 'assignedCallingMember', 'candidate'])
            ->latest();

        if ($scope === 'your') {
            if ($admin->isAdmin()) {
                $teamMemberIds = Admin::where('created_by', $admin->id)->pluck('id')->toArray();
                $clusterIds = array_merge([$admin->id], $teamMemberIds);
                $clusterJobIds = \App\Models\JobPost::whereIn('created_by', $clusterIds)
                    ->orWhereIn('assigned_to', $clusterIds)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($clusterJobIds, $clusterIds) {
                    $q->whereIn('job_id', $clusterJobIds)
                      ->orWhereIn('assigned_calling_team_member_id', $clusterIds);
                });
            } else {
                $myJobIds = \App\Models\JobPost::where('created_by', $admin->id)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($myJobIds, $admin) {
                    $q->whereIn('job_id', $myJobIds)
                      ->orWhere('assigned_calling_team_member_id', $admin->id);
                });
            }
        }

        $applications = $query->get()->map(function ($app) {
            return [
                'id'             => $app->id,
                'uuid'           => $app->uuid,
                'userName'       => $app->candidate_name ?? ($app->candidate->full_name ?? 'Applicant'),
                'userPhone'      => $app->candidate_phone ?? ($app->candidate->phone ?? '—'),
                'userEmail'      => $app->candidate_email ?? ($app->candidate->email ?? null),
                'userCity'       => $app->candidate->city ?? 'India',
                'jobTitle'       => $app->jobPost->title ?? 'General Position',
                'company'        => $app->jobPost->company ?? ($app->jobPost->companyRelation->name ?? 'ATS Client'),
                'status'         => $app->status ?? 'applied',
                'appliedAt'      => $app->created_at ? $app->created_at->format('d M Y') : 'Recent',
                'assignedTo'     => $app->assigned_calling_team_member_id,
                'assignedToName' => $app->assignedCallingMember->name ?? null,
                'remark'         => $app->admin_notes ?? $app->call_notes ?? null,
                'interviewDate'  => $app->interview_date_time ? $app->interview_date_time->format('d M Y, h:i A') : null,
                'resumeUrl'      => $app->resume_url,
            ];
        });

        if ($admin->isSuperAdmin()) {
            $teamMembers = Admin::whereIn('role', ['team_member', 'admin'])
                ->where('status', 1)
                ->get(['id', 'name', 'role', 'phone', 'email']);
        } elseif ($admin->isAdmin()) {
            $teamMembers = Admin::where('created_by', $admin->id)
                ->where('role', 'team_member')
                ->where('status', 1)
                ->get(['id', 'name', 'role', 'phone', 'email']);
        } else {
            $teamMembers = collect([]);
        }

        return Inertia::render('Admin/Applications', [
            'applications' => $applications,
            'teamMembers'  => $teamMembers,
            'canViewAll'   => $canViewAll,
            'scope'        => $scope,
        ]);
    }

    public function updateStatus(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|string|max:100',
        ]);

        $adminId = auth('admin')->id();

        // Check if admin ID exists in `members` table to satisfy the foreign key constraint
        $isValidMember = $adminId && DB::table('members')->where('id', $adminId)->exists();

        $application->status = $validated['status'];
        $application->reviewed_at = now();
        $application->reviewed_by = $isValidMember ? $adminId : null;
        $application->save();

        return redirect()->back()->with('success', "Application status updated to {$validated['status']}.");
    }

    public function assign(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'team_member_id' => 'required|exists:admins,id',
        ]);

        $application->assigned_calling_team_member_id = $validated['team_member_id'];
        $application->assigned_to_calling_team_at = now();
        $application->save();

        return redirect()->back()->with('success', 'Application successfully assigned to team member.');
    }

    public function updateRemark(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'remark' => 'required|string',
        ]);

        $application->admin_notes = $validated['remark'];
        $application->save();

        return redirect()->back()->with('success', 'Remark saved successfully.');
    }

    public function saveOfferDetails(Request $request, JobApplication $application)
    {
        $validated = $request->validate([
            'salary'       => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
        ]);

        $application->offer_salary_package = $validated['salary'] ?? null;
        $application->offer_joining_date = $validated['joining_date'] ?? null;
        $application->offer_letter_triggered_at = now();
        $application->status = 'hired';
        $application->save();

        return redirect()->back()->with('success', 'Offer details recorded.');
    }
}
