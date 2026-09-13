<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResumeController extends Controller
{
    public function index(Request $request)
    {
        $query = Resume::query()->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%");
            });
        }

        $perPage = (int)($request->input('per_page', 10));
        $resumes = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Resume/Index', [
            'filters' => $request->only(['search', 'per_page']),
            'resumes' => $resumes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Resume/Form', [
            'mode' => 'create',
            'resume' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        return DB::transaction(function () use ($request, $validated) {
            $data = $validated;
            unset(
                $data['skills'],
                $data['experiences'],
                $data['educations'],
                $data['projects'],
                $data['certifications'],
                $data['achievements'],
                $data['languages']
            );

            if ($request->hasFile('profile_photo')) {
                $data['profile_photo'] = $request->file('profile_photo')->store('resume_photos', 'public');
            }

            $resume = Resume::create($data);
            $this->syncNested($resume, $validated);

            return redirect()
                ->route('admin.resumes.index')
                ->with('success', 'Resume created successfully.');
        });
    }

    public function show(Resume $resume)
    {
        $resume->load([
            'skills',
            'experiences',
            'educations',
            'projects',
            'certifications',
            'achievements',
            'languages',
        ]);

        return Inertia::render('Admin/Resume/Show', [
            'resume' => $resume,
        ]);
    }

    public function edit(Resume $resume)
    {
        $resume->load([
            'skills',
            'experiences',
            'educations',
            'projects',
            'certifications',
            'achievements',
            'languages',
        ]);

        return Inertia::render('Admin/Resume/Form', [
            'mode' => 'edit',
            'resume' => $resume,
        ]);
    }

    public function update(Request $request, Resume $resume)
    {
        $validated = $this->validatePayload($request, $resume->id);

        return DB::transaction(function () use ($request, $resume, $validated) {
            $data = $validated;
            unset(
                $data['skills'],
                $data['experiences'],
                $data['educations'],
                $data['projects'],
                $data['certifications'],
                $data['achievements'],
                $data['languages']
            );

            if ($request->hasFile('profile_photo')) {
                if ($resume->profile_photo) {
                    Storage::disk('public')->delete($resume->profile_photo);
                }
                $data['profile_photo'] = $request->file('profile_photo')->store('resume_photos', 'public');
            }

            $resume->update($data);
            $this->syncNested($resume, $validated, true);

            return redirect()
                ->route('admin.resumes.index')
                ->with('success', 'Resume updated successfully.');
        });
    }

    public function destroy(Resume $resume)
    {
        return DB::transaction(function () use ($resume) {
            if ($resume->profile_photo) {
                Storage::disk('public')->delete($resume->profile_photo);
            }
            $resume->delete();

            return redirect()
                ->route('admin.resumes.index')
                ->with('success', 'Resume deleted successfully.');
        });
    }

    private function validatePayload(Request $request, ?int $resumeId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'github' => ['nullable', 'string', 'max:255'],
            'portfolio' => ['nullable', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],

            'skills' => ['nullable', 'array'],
            'skills.*.skill_name' => ['required_with:skills', 'nullable', 'string', 'max:255'],
            'skills.*.skill_type' => ['required_with:skills.*.skill_name', 'nullable', 'in:technical,soft'],

            'experiences' => ['nullable', 'array'],
            'experiences.*.company_name' => ['required_with:experiences', 'nullable', 'string', 'max:255'],
            'experiences.*.job_title' => ['required_with:experiences', 'nullable', 'string', 'max:255'],
            'experiences.*.start_date' => ['nullable', 'date'],
            'experiences.*.end_date' => ['nullable', 'date'],
            'experiences.*.location' => ['nullable', 'string', 'max:255'],
            'experiences.*.description' => ['nullable', 'string'],

            'educations' => ['nullable', 'array'],
            'educations.*.degree' => ['required_with:educations', 'nullable', 'string', 'max:255'],
            'educations.*.institute' => ['nullable', 'string', 'max:255'],
            'educations.*.start_year' => ['nullable', 'string', 'max:20'],
            'educations.*.end_year' => ['nullable', 'string', 'max:20'],
            'educations.*.percentage' => ['nullable', 'string', 'max:50'],

            'projects' => ['nullable', 'array'],
            'projects.*.title' => ['required_with:projects', 'nullable', 'string', 'max:255'],
            'projects.*.technologies' => ['nullable', 'string', 'max:255'],
            'projects.*.project_link' => ['nullable', 'string', 'max:255'],
            'projects.*.description' => ['nullable', 'string'],

            'certifications' => ['nullable', 'array'],
            'certifications.*.title' => ['required_with:certifications', 'nullable', 'string', 'max:255'],
            'certifications.*.platform' => ['nullable', 'string', 'max:255'],
            'certifications.*.year' => ['nullable', 'string', 'max:20'],

            'achievements' => ['nullable', 'array'],
            'achievements.*.title' => ['required_with:achievements', 'nullable', 'string', 'max:255'],
            'achievements.*.description' => ['nullable', 'string'],

            'languages' => ['nullable', 'array'],
            'languages.*.language' => ['required_with:languages', 'nullable', 'string', 'max:100'],
        ]);
    }

    private function syncNested(Resume $resume, array $validated, bool $isUpdate = false): void
    {
        $skills = $this->filterRows($validated['skills'] ?? [], ['skill_name', 'skill_type']);
        $experiences = $this->filterRows($validated['experiences'] ?? [], ['company_name', 'job_title', 'start_date', 'end_date', 'location', 'description']);
        $educations = $this->filterRows($validated['educations'] ?? [], ['degree', 'institute', 'start_year', 'end_year', 'percentage']);
        $projects = $this->filterRows($validated['projects'] ?? [], ['title', 'technologies', 'project_link', 'description']);
        $certifications = $this->filterRows($validated['certifications'] ?? [], ['title', 'platform', 'year']);
        $achievements = $this->filterRows($validated['achievements'] ?? [], ['title', 'description']);
        $languages = $this->filterRows($validated['languages'] ?? [], ['language']);

        if ($isUpdate) {
            $resume->skills()->delete();
            $resume->experiences()->delete();
            $resume->educations()->delete();
            $resume->projects()->delete();
            $resume->certifications()->delete();
            $resume->achievements()->delete();
            $resume->languages()->delete();
        }

        if (!empty($skills)) $resume->skills()->createMany($skills);
        if (!empty($experiences)) $resume->experiences()->createMany($experiences);
        if (!empty($educations)) $resume->educations()->createMany($educations);
        if (!empty($projects)) $resume->projects()->createMany($projects);
        if (!empty($certifications)) $resume->certifications()->createMany($certifications);
        if (!empty($achievements)) $resume->achievements()->createMany($achievements);
        if (!empty($languages)) $resume->languages()->createMany($languages);
    }

    private function filterRows(array $rows, array $keys): array
    {
        $filtered = [];

        foreach ($rows as $row) {
            if (!is_array($row)) continue;

            $hasAnyValue = false;
            foreach ($keys as $key) {
                $value = $row[$key] ?? null;
                if (is_string($value)) $value = trim($value);
                if ($value !== null && $value !== '') {
                    $hasAnyValue = true;
                    break;
                }
            }

            if (!$hasAnyValue) continue;

            $filtered[] = array_intersect_key($row, array_flip($keys));
        }

        return $filtered;
    }
}

