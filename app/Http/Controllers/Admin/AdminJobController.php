<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Company;
use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminJobController extends Controller
{
    public function index()
    {
        $jobs = JobPost::with(['assignedMember:id,name', 'category:id,name', 'companyRelation:uuid,name,location'])
            ->latest()
            ->get()
            ->map(function ($job) {
                $salary = ($job->min_lpa && $job->max_lpa)
                    ? "₹{$job->min_lpa} - ₹{$job->max_lpa} LPA"
                    : ($job->min_lpa ? "₹{$job->min_lpa} LPA" : "Not Disclosed");

                return [
                    'id'                        => $job->id,
                    'uuid'                      => $job->uuid,
                    'title'                     => $job->title,
                    'company'                   => $job->companyRelation?->name ?? $job->company ?? 'N/A',
                    'location'                  => $job->location ?? 'Remote',
                    'salary'                    => $salary,
                    'status'                    => $job->status ?? 'pending',
                    'work_mode'                 => $job->job_type,
                    'type'                      => $job->job_type ?? 'Full Time',
                    'exp'                       => $job->experience ?? '0-1 yr',
                    'openings'                  => $job->openings ?? 1,
                    'applicants'                => $job->applicants ?? 0,
                    'is_hot'                    => $job->badge === 'hot' || $job->badge === 'featured',
                    'posted_at'                 => $job->created_at ? $job->created_at->format('d M Y') : 'Recent',
                    'category'                  => $job->category?->name ?? 'General',
                    'desc'                      => $job->description ?? '',
                    'remark'                    => $job->rejection_reason,
                    'skills'                    => is_array($job->skills) ? $job->skills : [],
                    'languages'                 => is_array($job->languages) ? $job->languages : [],
                    'responsibilities'          => is_array($job->key_responsibilities) ? $job->key_responsibilities : [],
                    'requirements'              => is_array($job->qualifications) ? $job->qualifications : [],
                    'benefits'                  => is_array($job->perks) ? $job->perks : [],
                    'assigned_team_member_uuid' => $job->assignedMember ? (string) $job->assignedMember->id : null,
                    'assigned_team_member_name' => $job->assignedMember?->name,
                ];
            });

        $teamMembers = Admin::select('id', 'name', 'email', 'phone', 'role')->get();

        return Inertia::render('Admin/Jobs', [
            'jobs'        => $jobs,
            'teamMembers' => $teamMembers,
        ]);
    }

    public function create()
    {
        $categories = Category::with('subcategories')
            ->where('status', 'active')
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'icon'          => $c->icon ?? '📁',
                'subcategories' => $c->subcategories->map(fn($s) => ['id' => $s->id, 'name' => $s->name])
            ]);

        $companies = Company::where('status', 'active')->select('uuid', 'name', 'location')->get();

        $skills = Skill::where('status', 1)->select('id', 'name')->get()->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'demand' => 'high'
        ]);

        $teamMembers = Admin::select('id', 'name', 'email', 'phone', 'role')->get()->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'phone' => $m->phone,
            'role' => $m->role,
            'activeTask' => str_replace('_', ' ', ucwords($m->role, '_'))
        ]);

        return Inertia::render('Admin/CreateJob', [
            'categories'  => $categories,
            'companies'   => $companies,
            'skills'      => $skills,
            'teamMembers' => $teamMembers,
        ]);
    }

public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'company_uuid' => 'required|exists:companies,uuid',
            'location'     => 'required|string|max:255',
            'desc'         => 'required|string',
            'salaryMin'    => 'required|numeric',
            'salaryMax'    => 'required|numeric',
        ]);

        $company = Company::where('uuid', $validated['company_uuid'])->first();

        JobPost::create([
            'title'                => $validated['title'],
            'company_uuid'         => $company->uuid,
            'company_id'           => $company->id ?? null,
            'company'              => $company->name,
            'company_about'        => $company->description ?? null,
            'company_size'         => $company->company_size ?? '1 - 10 employees',
            'company_address'      => $request->input('companyAddress', $validated['location']),
            'location'             => $validated['location'],
            'category_id'          => $request->input('categoryId') ?: null,
            'sub_category_id'      => $request->input('subCategoryId') ?: null,
            'description'          => $validated['desc'],
            'min_salary'           => $validated['salaryMin'], // <-- Updated to min_salary
            'max_salary'           => $validated['salaryMax'], // <-- Updated to max_salary
            'job_type'             => $request->input('type', 'Full Time'),
            'salary_type'          => $request->input('salaryType', 'monthly'),
            'bonus_offered'        => $request->input('bonusOffered', 'no'),
            'working_days'         => $request->input('workingDays', 'Mon - Sat'),
            'shift_timing'         => $request->input('shiftTiming', '9:30 AM - 6:30 PM'),
            'interview_details'    => $request->input('interviewDetails', ''),
            'experience'           => $request->input('exp', 'Any'),
            'min_age'              => $request->input('minAge') ?: null,
            'max_age'              => $request->input('maxAge') ?: null,
            'openings'             => $request->input('openings', 1),
            'last_date'            => $request->input('lastDate') ?: null,
            'badge'                => $request->input('isHot') ? 'hot' : 'standard',
            'skills'               => $request->input('skills', []),
            'languages'            => $request->input('languages', []),
            'qualifications'       => $request->input('qualifications', []),
            'assets'               => $request->input('assets', []),
            'contact_person'       => $request->input('contactPersonName'),
            'contact_phone'        => $request->input('contactPhone'),
            'contact_email'        => $request->input('contactEmail'),
            'assigned_to'          => null,
            'status'               => $request->input('is_draft') ? 'deactivated' : 'pending',
            'created_by'           => auth('admin')->id(),
        ]);

        return redirect()->route('admin.jobs.index')->with('success', 'Job post successfully created.');
    }

    public function updateStatus(Request $request, $uuid)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'remark' => 'nullable|string|max:1000',
        ]);

        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'rejected' || $validated['status'] === 'hold') {
            $updateData['rejection_reason'] = $validated['remark'] ?? $job->rejection_reason;
        } elseif ($validated['status'] === 'approved' || $validated['status'] === 'active') {
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = auth('admin')->id();
        }

        $job->update($updateData);

        return redirect()->back()->with('success', "Job status changed to {$validated['status']}.");
    }

    public function assignTeam(Request $request, $uuid)
    {
        $validated = $request->validate([
            'team_member_uuid' => 'nullable',
        ]);

        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        $adminId = null;
        if (!empty($validated['team_member_uuid'])) {
            $admin = Admin::where('id', $validated['team_member_uuid'])->first();
            $adminId = $admin?->id;
        }

        $job->update(['approved_by' => $adminId]);

        return redirect()->back()->with('success', $adminId ? 'Team member assigned successfully.' : 'Assignment removed.');
    }
}
