<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\SavedJob;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Get Company Details along with its Active Jobs
     */
    public function getCompanyDetail(Request $request, $uuid)
    {
        $user = $request->user();

        // 1. Company fetch karein
        $company = Company::where('uuid', $uuid)
            ->where('status', 'active')
            ->first();

        if (!$company) {
            return response()->json([
                'status'  => false,
                'message' => 'Company not found.'
            ], 404);
        }

        // 2. User ke applied aur saved jobs fetch karein
        $appliedJobIds = [];
        $savedJobUuids = [];

        if ($user) {
            $appliedJobIds = JobApplication::where('candidate_id', $user->id)
                ->pluck('job_id')
                ->toArray();

            $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
                ->pluck('job_uuid')
                ->toArray();
        }

        // 3. Is company ki saari active job posts (subCategory se uuid hata diya gaya hai)
        $companyJobs = JobPost::with([
                'category:id,uuid,name',
                'subCategory'
            ])
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($job) use ($appliedJobIds, $savedJobUuids) {
                $job->has_applied = in_array($job->id, $appliedJobIds);
                $job->is_saved    = in_array($job->uuid, $savedJobUuids);
                return $job;
            });

        // 4. Company stats calculate karein
        $company->total_active_jobs = $companyJobs->count();
        $company->jobs = $companyJobs;

        return response()->json([
            'status'  => true,
            'message' => 'Company detail fetched successfully',
            'data'    => $company
        ], 200);
    }
}
