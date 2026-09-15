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
use Illuminate\Validation\Rule;

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
            'is_draft'           => ['nullable', 'boolean'],
            'activeFields'       => ['nullable', 'array'],
            'activeFields.age'   => ['nullable', 'boolean'],
            'activeFields.language' => ['nullable', 'boolean'],
            'activeFields.assets' => ['nullable', 'boolean'],
            'activeFields.degree' => ['nullable', 'boolean'],
            'activeFields.certification' => ['nullable', 'boolean'],
            'activeFields.industry' => ['nullable', 'boolean'],
            'title'              => ['required_unless:is_draft,true', 'string', 'max:255', 'regex:/[A-Za-z]/', 'regex:/^[A-Za-z0-9\s&\'().,+\/-]+$/'],
            'company_uuid'       => ['required_unless:is_draft,true', 'nullable', 'exists:companies,uuid'],
            'location'           => ['required_unless:is_draft,true', 'nullable', 'string', 'max:255'],
            'categoryId'         => ['required_unless:is_draft,true', 'nullable', 'exists:categories,id'],
            'subCategoryId'      => ['nullable', 'exists:subcategories,id'],
            'type'               => ['nullable', 'string', 'max:50'],
            'openings'           => ['required_unless:is_draft,true', 'nullable', 'integer', 'min:1'],
            'lastDate'           => ['required_unless:is_draft,true', 'nullable', 'date', 'after_or_equal:today'],
            'exp'                => ['nullable', Rule::in(['Any', 'Fresher Only', 'Experienced Only'])],
            'minExp'             => ['nullable', 'numeric', 'min:0'],
            'maxExp'             => ['nullable', 'numeric', 'min:0', 'gte:minExp'],
            'salaryMin'          => ['required_unless:is_draft,true', 'nullable', 'numeric', 'gt:0'],
            'salaryMax'          => ['required_unless:is_draft,true', 'nullable', 'numeric', 'gt:0', 'gte:salaryMin'],
            'salaryType'         => ['nullable', 'string', 'max:30'],
            'desc'               => ['required_unless:is_draft,true', 'nullable', 'string', 'max:350'],
            'skills'             => ['required_unless:is_draft,true', 'array', 'min:1'],
            'languages'          => ['nullable', 'array', 'required_if:activeFields.language,true', 'min:1'],
            'qualifications'     => ['nullable', 'array', 'required_if:activeFields.degree,true', 'min:1'],
            'assets'             => ['nullable', 'array', 'required_if:activeFields.assets,true', 'min:1'],
            'certifications'     => ['nullable', 'array', 'required_if:activeFields.certification,true', 'min:1'],
            'preferredIndustry'  => ['nullable', 'array', 'required_if:activeFields.industry,true', 'min:1'],
            'minAge'             => ['nullable', 'integer', 'min:0', 'required_if:activeFields.age,true'],
            'maxAge'             => ['nullable', 'integer', 'min:0', 'gte:minAge', 'required_if:activeFields.age,true'],
            'shiftTiming'        => ['required_unless:is_draft,true', 'nullable', 'string', 'max:255'],
            'interviewDetails'   => ['required_unless:is_draft,true', 'nullable', 'string', 'max:1000'],
            'contactPersonName'  => ['required_unless:is_draft,true', 'nullable', 'string', 'max:255'],
            'contactPhone'       => ['required_unless:is_draft,true', 'nullable', 'regex:/^\d{10}$/'],
            'contactEmail'       => ['required_unless:is_draft,true', 'nullable', 'email', 'max:255'],
            'companyAddress'     => ['required_unless:is_draft,true', 'nullable', 'string'],
            'assignedToId'       => ['nullable', 'exists:admins,id'],
        ]);

        $company = Company::where('uuid', $validated['company_uuid'])->first();

        JobPost::create([
            'title'                => $validated['title'] ?? null,
            'company_uuid'         => $company?->uuid,
            'company_id'           => $company?->id,
            'company'             => $company?->name,
            'company_about'       => $company?->description,
            'company_size'        => $company?->company_size ?? '1 - 10 employees',
            'company_address'     => $validated['companyAddress'] ?? $validated['location'] ?? null,
            'location'            => $validated['location'] ?? null,
            'category_id'         => $validated['categoryId'] ?? null,
            'sub_category_id'     => $validated['subCategoryId'] ?? null,
            'description'         => $validated['desc'] ?? null,
            'min_salary'          => $validated['salaryMin'] ?? null,
            'max_salary'          => $validated['salaryMax'] ?? null,
            'job_type'            => $validated['type'] ?? 'Full Time',
            'salary_type'         => $validated['salaryType'] ?? 'monthly',
            'bonus_offered'        => $request->input('bonusOffered', 'no'),
            'working_days'         => $request->input('workingDays', 'Mon - Sat'),
            'shift_timing'         => $validated['shiftTiming'] ?? null,
            'interview_details'    => $validated['interviewDetails'] ?? null,
            'experience'           => $validated['exp'] ?? 'Any',
            'min_experience'       => $validated['minExp'] ?? null,
            'max_experience'       => $validated['maxExp'] ?? null,
            'min_age'              => $validated['minAge'] ?? null,
            'max_age'              => $validated['maxAge'] ?? null,
            'openings'             => $validated['openings'] ?? 1,
            'last_date'            => $validated['lastDate'] ?? null,
            'badge'                => $request->input('isHot') ? 'hot' : 'standard',
            'skills'               => $validated['skills'] ?? [],
            'languages'            => $validated['languages'] ?? [],
            'qualifications'       => $validated['qualifications'] ?? [],
            'assets'               => $validated['assets'] ?? [],
            'certifications'       => $validated['certifications'] ?? [],
            'preferred_industries' => $validated['preferredIndustry'] ?? [],
            'contact_person'       => $validated['contactPersonName'] ?? null,
            'contact_phone'        => $validated['contactPhone'] ?? null,
            'contact_email'        => $validated['contactEmail'] ?? null,
            'assigned_to'          => $validated['assignedToId'] ?? null,
            'status'               => $request->boolean('is_draft') ? 'inactive' : 'pending',
            'created_by'           => auth('admin')->id(),
        ]);

        return redirect()->route('admin.jobs.index')->with('success', 'Job post successfully created.');
    }

    public function updateStatus(Request $request, $uuid)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'active', 'rejected', 'hold', 'inactive'])],
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
            'team_member_uuid' => 'nullable|exists:admins,id',
        ]);

        $job = JobPost::where('uuid', $uuid)->firstOrFail();

        $adminId = null;
        if (!empty($validated['team_member_uuid'])) {
            $admin = Admin::where('id', $validated['team_member_uuid'])->first();
            $adminId = $admin?->id;
        }

        $job->update(['assigned_to' => $adminId]);

        return redirect()->back()->with('success', $adminId ? 'Team member assigned successfully.' : 'Assignment removed.');
    }
}
