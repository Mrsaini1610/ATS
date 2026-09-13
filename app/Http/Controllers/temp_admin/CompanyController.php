<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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
                ->get(['uuid', 'title', 'status']);

            if ($jobs->isEmpty()) {
                $jobs = \App\Models\JobPost::where('company', 'LIKE', '%' . trim($comp->name) . '%')
                    ->get(['uuid', 'title', 'status']);
            }

            return [
                'uuid'         => $comp->uuid,
                'name'         => $comp->name,
                'slug'         => $comp->slug,
                'logo'         => $comp->logo,
                'website'      => $comp->website,
                'location'     => $comp->location,
                'company_size' => $comp->company_size, // <-- yahan map kiya gaya hai
                'description'  => $comp->description,
                'status'       => $comp->status,
                'jobs_count'   => $jobs->count(),
                'jobs'         => $jobs->map(fn($job) => [
                    'uuid'   => $job->uuid,
                    'title'  => $job->title,
                    'status' => $job->status,
                ]),
            ];
        });

    return Inertia::render('Admin/Companies', [
        'companies' => $companies,
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'name'         => 'required|string|max:255',
        'website'      => 'nullable|string|max:255',
        'location'     => 'nullable|string|max:255',
        'company_size' => 'nullable|string|max:255', // <-- Validation added
        'description'  => 'nullable|string',
        'status'       => 'required|string',
        'logo'         => 'nullable',
    ]);

    $logoPath = null;
    if ($request->hasFile('logo')) {
        $logoPath = $request->file('logo')->store('company-logos', 'public');
    } else {
        $logoPath = $request->input('logo');
    }

    Company::create([
        'name'         => $validated['name'],
        'slug'         => \Illuminate\Support\Str::slug($validated['name']),
        'website'      => $validated['website'] ?? null,
        'location'     => $validated['location'] ?? null,
        'company_size' => $validated['company_size'] ?? null, // <-- Saved here
        'description'  => $validated['description'] ?? null,
        'status'       => $validated['status'] ?? 'active',
        'logo'         => $logoPath,
    ]);

    return redirect()->route('admin.companies.index')->with('success', 'Company successfully created.');
}

public function update(Request $request, $uuid)
{
    $company = Company::where('uuid', $uuid)->firstOrFail();

    $validated = $request->validate([
        'name'         => 'required|string|max:255',
        'website'      => 'nullable|string|max:255',
        'location'     => 'nullable|string|max:255',
        'company_size' => 'nullable|string|max:255', // <-- Validation added
        'description'  => 'nullable|string',
        'status'       => 'required|string',
        'logo'         => 'nullable',
    ]);

    $logoPath = $company->logo;
    if ($request->hasFile('logo')) {
        $logoPath = $request->file('logo')->store('company-logos', 'public');
    } elseif ($request->filled('logo')) {
        $logoPath = $request->input('logo');
    }

    $company->update([
        'name'         => $validated['name'],
        'slug'         => \Illuminate\Support\Str::slug($validated['name']),
        'website'      => $validated['website'] ?? null,
        'location'     => $validated['location'] ?? null,
        'company_size' => $validated['company_size'] ?? null, // <-- Updated here
        'description'  => $validated['description'] ?? null,
        'status'       => $validated['status'] ?? 'active',
        'logo'         => $logoPath,
    ]);

    return redirect()->route('admin.companies.index')->with('success', 'Company successfully updated.');
}

    /**
     * Active/Inactive status toggle karein (via UUID)
     */
    public function toggleStatus(Company $company)
    {
        $company->status = ($company->status === 'active') ? 'inactive' : 'active';
        $company->save();

        return redirect()->back()->with('success', 'Company status update ho gaya.');
    }

    /**
     * Company delete karein (via UUID)
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return redirect()->back()->with('success', 'Company delete ho gayi.');
    }
}
