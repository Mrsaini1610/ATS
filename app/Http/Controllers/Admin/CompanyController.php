<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use App\Services\GeocodingService;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Companies list fetch karein
     */
public function index()
{
    $companies = Company::latest()
        ->get()
        ->map(function ($comp) {
            $jobs = \App\Models\JobPost::where('company_uuid', trim($comp->uuid))
                ->get(['uuid', 'title', 'status', 'openings', 'job_type', 'min_salary', 'max_salary', 'location']);

            if ($jobs->isEmpty()) {
                $jobs = \App\Models\JobPost::where('company', 'LIKE', '%' . trim($comp->name) . '%')
                    ->get(['uuid', 'title', 'status', 'openings', 'job_type', 'min_salary', 'max_salary', 'location']);
            }

            $logo = $comp->logo;
            if ($logo && !str_starts_with($logo, 'http') && (str_contains($logo, '/') || str_contains($logo, '.'))) {
                if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($logo)) {
                    $logo = null;
                }
            }

            return [
                'uuid'         => $comp->uuid,
                'name'         => $comp->name,
                'slug'         => $comp->slug,
                'logo'         => $logo,
                'website'      => $comp->website,
                'location'     => $comp->location,
                'address'      => $comp->address,
                'latitude'     => $comp->latitude,
                'longitude'    => $comp->longitude,
                'company_size' => $comp->company_size,
                'description'  => $comp->description,
                'status'       => $comp->status,
                'created_at'   => $comp->created_at ? $comp->created_at->format('d M Y') : null,
                'jobs_count'   => $jobs->count(),
                'jobs'         => $jobs->map(fn($job) => [
                    'uuid'       => $job->uuid,
                    'title'      => $job->title,
                    'status'     => $job->status,
                    'openings'   => $job->openings,
                    'job_type'   => $job->job_type,
                    'salary'     => ($job->min_salary && $job->max_salary) ? ("₹" . number_format($job->min_salary) . " - ₹" . number_format($job->max_salary)) : null,
                    'location'   => $job->location,
                ]),
            ];
        });

    return Inertia::render('Admin/Companies', [
        'companies' => $companies,
    ]);
}

public function store(Request $request, GeocodingService $geocodingService)
{
    // Sanitize string 'null' or empty string values from numeric and optional fields
    $lat = $request->input('latitude');
    if ($lat === 'null' || $lat === '' || !is_numeric($lat)) {
        $request->merge(['latitude' => null]);
    }
    $lng = $request->input('longitude');
    if ($lng === 'null' || $lng === '' || !is_numeric($lng)) {
        $request->merge(['longitude' => null]);
    }
    if ($request->input('website') === 'null' || $request->input('website') === '') {
        $request->merge(['website' => null]);
    }
    if ($request->input('location') === 'null' || $request->input('location') === '') {
        $request->merge(['location' => null]);
    }
    if ($request->input('company_size') === 'null' || $request->input('company_size') === '') {
        $request->merge(['company_size' => '1 - 10 employees']);
    }

    $validated = $request->validate([
        'name'         => 'required|string|max:255',
        'website'      => 'nullable|string|max:255',
        'location'     => 'nullable|string|max:255',
        'address'      => 'required|string|max:2000',
        'latitude'     => 'nullable|numeric|between:-90,90',
        'longitude'    => 'nullable|numeric|between:-180,180',
        'company_size' => 'nullable|string|max:255',
        'description'  => 'nullable|string',
        'status'       => 'required|string',
        'logo'         => 'nullable',
    ]);

    $logoPath = null;
    $coordinates = null;
    if (empty($validated['latitude']) || empty($validated['longitude'])) {
        $coordinates = $geocodingService->geocode($validated['address']);
    }
    if ($request->hasFile('logo')) {
        $logoPath = $request->file('logo')->store('company-logos', 'public');
    } elseif ($request->filled('logo') && is_string($request->input('logo')) && $request->input('logo') !== '[object File]') {
        $logoPath = $request->input('logo');
    }

    $company = Company::create([
        'name'         => $validated['name'],
        'slug'         => \Illuminate\Support\Str::slug($validated['name']),
        'website'      => $validated['website'] ?? null,
        'location'     => $validated['location'] ?? null,
        'address'      => $validated['address'],
        'latitude'     => $validated['latitude'] ?? $coordinates['latitude'] ?? null,
        'longitude'    => $validated['longitude'] ?? $coordinates['longitude'] ?? null,
        'company_size' => $validated['company_size'] ?? '1 - 10 employees',
        'description'  => $validated['description'] ?? null,
        'status'       => $validated['status'] ?? 'active',
        'logo'         => $logoPath,
    ]);

    AuditLogService::log(
        'company_created',
        "Admin created new employer company '{$company->name}'.",
        ['name' => $company->name, 'location' => $company->location, 'website' => $company->website, 'size' => $company->company_size],
        'companies',
        $company
    );

    return redirect()->route('admin.companies.index')->with('success', 'Company successfully created.');
}

public function update(Request $request, $uuid, GeocodingService $geocodingService)
{
    $company = Company::where('uuid', $uuid)->firstOrFail();

    // Sanitize string 'null' or empty string values from numeric and optional fields
    $lat = $request->input('latitude');
    if ($lat === 'null' || $lat === '' || !is_numeric($lat)) {
        $request->merge(['latitude' => null]);
    }
    $lng = $request->input('longitude');
    if ($lng === 'null' || $lng === '' || !is_numeric($lng)) {
        $request->merge(['longitude' => null]);
    }
    if ($request->input('website') === 'null' || $request->input('website') === '') {
        $request->merge(['website' => null]);
    }
    if ($request->input('location') === 'null' || $request->input('location') === '') {
        $request->merge(['location' => null]);
    }
    if ($request->input('company_size') === 'null' || $request->input('company_size') === '') {
        $request->merge(['company_size' => '1 - 10 employees']);
    }

    $validated = $request->validate([
        'name'         => 'required|string|max:255',
        'website'      => 'nullable|string|max:255',
        'location'     => 'nullable|string|max:255',
        'address'      => 'required|string|max:2000',
        'latitude'     => 'nullable|numeric|between:-90,90',
        'longitude'    => 'nullable|numeric|between:-180,180',
        'company_size' => 'nullable|string|max:255',
        'description'  => 'nullable|string',
        'status'       => 'required|string',
        'logo'         => 'nullable',
    ]);

    $logoPath = $company->logo;
    $coordinates = null;
    if (empty($validated['latitude']) || empty($validated['longitude'])) {
        $coordinates = $geocodingService->geocode($validated['address']);
    }
    if ($request->hasFile('logo')) {
        $logoPath = $request->file('logo')->store('company-logos', 'public');
    } elseif ($request->filled('logo') && is_string($request->input('logo')) && $request->input('logo') !== '[object File]') {
        $logoPath = $request->input('logo');
    }

    $oldName = $company->name;
    $company->update([
        'name'         => $validated['name'],
        'slug'         => \Illuminate\Support\Str::slug($validated['name']),
        'website'      => $validated['website'] ?? null,
        'location'     => $validated['location'] ?? null,
        'address'      => $validated['address'],
        'latitude'     => $validated['latitude'] ?? $coordinates['latitude'] ?? null,
        'longitude'    => $validated['longitude'] ?? $coordinates['longitude'] ?? null,
        'company_size' => $validated['company_size'] ?? '1 - 10 employees',
        'description'  => $validated['description'] ?? null,
        'status'       => $validated['status'] ?? 'active',
        'logo'         => $logoPath,
    ]);

    AuditLogService::log(
        'company_updated',
        "Admin updated employer company '{$oldName}'.",
        ['old_name' => $oldName, 'new_name' => $company->name, 'location' => $company->location, 'status' => $company->status],
        'companies',
        $company
    );

    return redirect()->route('admin.companies.index')->with('success', 'Company successfully updated.');
}

    /**
     * Active/Inactive status toggle karein (via UUID)
     */
    public function toggleStatus(Company $company)
    {
        $company->status = ($company->status === 'active') ? 'inactive' : 'active';
        $company->save();

        AuditLogService::log(
            'company_status_updated',
            "Admin changed company '{$company->name}' status to {$company->status}.",
            ['status' => $company->status],
            'companies',
            $company
        );

        return redirect()->back()->with('success', 'Company status update ho gaya.');
    }

    /**
     * Company delete karein (via UUID)
     */
    public function destroy(Company $company)
    {
        $compName = $company->name;
        $company->delete();

        AuditLogService::log(
            'company_deleted',
            "Admin deleted employer company '{$compName}'.",
            ['name' => $compName],
            'companies'
        );

        return redirect()->back()->with('success', 'Company delete ho gayi.');
    }
}
