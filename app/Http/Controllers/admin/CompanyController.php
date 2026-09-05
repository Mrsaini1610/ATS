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
    public function index(Request $request): Response
    {
        $companies = Company::query()
            ->latest()
            ->get()
            ->map(function ($comp) {
                return [
                    'uuid'        => $comp->uuid,
                    'name'        => $comp->name,
                    'slug'        => $comp->slug,
                    'logo'        => $comp->logo,
                    'website'     => $comp->website,
                    'location'    => $comp->location,
                    'description' => $comp->description,
                    'status'      => $comp->status,
                    'jobs'        => 0, // Jab job_posts link hogi tab withCount se bind hoga
                    'createdAt'   => $comp->created_at ? $comp->created_at->format('d M Y') : null,
                ];
            });

        return Inertia::render('Admin/Companies', [
            'companies' => $companies,
        ]);
    }

    /**
     * New company add karein
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'website'     => 'nullable|string|max:255',
            'location'    => 'nullable|string|max:255',
            'logo'        => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $slug = Str::slug($validated['name']);
        $count = Company::where('slug', 'like', "{$slug}%")->count();
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }

        Company::create([
            'uuid'        => (string) Str::uuid(),
            'name'        => $validated['name'],
            'slug'        => $slug,
            'website'     => $validated['website'] ?? null,
            'location'    => $validated['location'] ?? null,
            'logo'        => $validated['logo'] ?? strtoupper(substr($validated['name'], 0, 2)),
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'] ?? 'active',
        ]);

        return redirect()->back()->with('success', 'Company successfully create ho gayi.');
    }

    /**
     * Existing company update karein (via UUID)
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'website'     => 'nullable|string|max:255',
            'location'    => 'nullable|string|max:255',
            'logo'        => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:active,inactive',
        ]);

        if ($company->name !== $validated['name']) {
            $slug = Str::slug($validated['name']);
            $count = Company::where('slug', 'like', "{$slug}%")->where('id', '!=', $company->id)->count();
            if ($count > 0) {
                $slug .= '-' . ($count + 1);
            }
            $company->slug = $slug;
        }

        $company->update([
            'name'        => $validated['name'],
            'website'     => $validated['website'] ?? null,
            'location'    => $validated['location'] ?? null,
            'logo'        => $validated['logo'] ?? strtoupper(substr($validated['name'], 0, 2)),
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'] ?? $company->status,
        ]);

        return redirect()->back()->with('success', 'Company profile successfully update ho gayi.');
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
