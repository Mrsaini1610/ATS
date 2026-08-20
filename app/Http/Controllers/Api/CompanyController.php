<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\SavedJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    /**
     * Get Company Details via POST request using UUID
     */
    public function getCompanyDetail(Request $request)
    {
        // 1. UUID validation
        $validator = Validator::make($request->all(), [
            'uuid' => 'required|string|exists:companies,uuid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // 2. Fetch company data
        $company = Company::where('uuid', $request->uuid)
            ->where('status', 'active')
            ->first();

        if (!$company) {
            return response()->json([
                'status'  => false,
                'message' => 'Company not found or inactive.'
            ], 404);
        }

        // 3. User ke applied aur saved jobs fetch karein
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

        // 4. Company active jobs fetch karein
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

        // 5. Structure company data (jobs ko isse alag rakha gaya hai)
        $responseData = [
            'id'                => $company->id,
            'uuid'              => $company->uuid,
            'name'              => $company->name,
            'slug'              => $company->slug,
            'logo'              => $company->logo ? asset('storage/companies/' . $company->logo) : null,
            'website'           => $company->website,
            'location'          => $company->location,
            'description'       => $company->description,
            'status'            => $company->status,
            'created_at'        => $company->created_at,
            'updated_at'        => $company->updated_at,
            'total_active_jobs' => $companyJobs->count(),
        ];

        // 6. Return response with 'jobs' outside 'data'
        return response()->json([
            'status'  => true,
            'message' => 'Company detail fetched successfully',
            'data'    => $responseData,
            'jobs'    => $companyJobs
        ], 200);
    }
}
