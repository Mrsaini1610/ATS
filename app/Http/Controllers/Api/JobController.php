<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Models\Category;
use App\Models\Company;
use App\Models\SavedJob;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;
use App\Services\GeocodingService;
use App\Services\PushNotificationService;
use App\Services\MailService;

class JobController extends Controller
{
    
    public function getHomeData(Request $request)
    {
        $user = $request->user();

        // 1. Candidate Location Coordinates (from request or saved profile)
        $lat = $request->input('latitude') ?? $user?->app_latitude ?? $user?->latitude;
        $lng = $request->input('longitude') ?? $user?->app_longitude ?? $user?->longitude;
        $hasCoords = !empty($lat) && !empty($lng);

        // 2. Candidate Profile Attributes for Recommended Jobs Matching (NO Resume)
        $userTitles     = [];
        $userSkills     = [];
        $userCity       = $user?->city ?? null;
        $userExp        = $user?->total_experience_years ?? null;
        $userAge        = !empty($user?->dob) ? Carbon::parse($user->dob)->age : null;

        if ($user) {
            // Titles from Profile & Experience
            $candidateTitles = [
                $user->job_title ?? null,
                $user->latestExperience?->job_title ?? null,
            ];
            foreach ($candidateTitles as $t) {
                if (!empty($t)) {
                    $cleaned = trim($t);
                    if ($cleaned !== '') {
                        $userTitles[] = $cleaned;
                    }
                }
            }
            $userTitles = array_values(array_unique($userTitles));

            // Skills from User Profile
            $rawSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
            if (!empty($rawSkills) && is_array($rawSkills)) {
                foreach ($rawSkills as $sk) {
                    $cleaned = trim((string)$sk);
                    if ($cleaned !== '') {
                        $userSkills[] = $cleaned;
                    }
                }
            }
            $userSkills = array_values(array_unique($userSkills));
        }

        // Title SQL Match
        $titleSql = "0";
        if (!empty($userTitles)) {
            $titleCases = [];
            foreach ($userTitles as $t) {
                $escapedTitle = addslashes(strtolower($t));
                $titleCases[] = "CASE WHEN LOWER(title) LIKE '%{$escapedTitle}%' OR LOWER(skills) LIKE '%{$escapedTitle}%' THEN 6 ELSE 0 END";
            }
            $titleSql = "(" . implode(" + ", $titleCases) . ")";
        }

        // Skill SQL Match
        $skillSql = "0";
        if (!empty($userSkills)) {
            $skillCases = [];
            foreach ($userSkills as $skill) {
                $escapedSkill = addslashes(strtolower($skill));
                $skillCases[] = "CASE WHEN LOWER(skills) LIKE '%{$escapedSkill}%' THEN 3 ELSE 0 END";
            }
            $skillSql = "(" . implode(" + ", $skillCases) . ")";
        }

        // Location SQL Match
        $locationSql = "0";
        if (!empty($userCity)) {
            $escapedCity = addslashes(strtolower($userCity));
            $locationSql = "CASE WHEN LOWER(location) LIKE '%{$escapedCity}%' THEN 5 ELSE 0 END";
        }

        // Experience SQL Match
        $expSql = "0";
        if (!empty($userExp)) {
            $escapedExp = addslashes((string)$userExp);
            $expSql = "CASE WHEN experience LIKE '%{$escapedExp}%' THEN 2 ELSE 0 END";
        }

        // Age SQL Match
        $ageSql = "0";
        if (!is_null($userAge)) {
            $ageSql = "CASE WHEN (min_age IS NULL OR min_age <= {$userAge}) AND (max_age IS NULL OR max_age >= {$userAge}) THEN 2 ELSE 0 END";
        }

        // Distance SQL (Haversine Formula)
        $distanceSelect = "NULL as distance_km";
        if ($hasCoords) {
            $distanceSelect = "(6371 * acos(least(1.0, greatest(-1.0, cos(radians({$lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians({$lng})) + sin(radians({$lat})) * sin(radians(latitude)))))) as distance_km";
        }

        $recommendedJobs = JobPost::with(['company', 'category'])
            ->whereIn('status', ['active', 'approved'])
            ->where(function ($q) {
                $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
            })
            ->select('*')
            ->selectRaw("({$titleSql} + {$skillSql} + {$locationSql} + {$expSql} + {$ageSql}) as raw_score")
            ->selectRaw($distanceSelect)
            ->orderByDesc('raw_score')
            ->orderByDesc('id')
            ->take(20)
            ->get();

        foreach ($recommendedJobs as $job) {
            $dist = !is_null($job->distance_km) ? round((float)$job->distance_km, 1) : null;
            $job->distance_km = $dist;
            $job->is_nearby = ($dist !== null && $dist <= 15);
            $score = 50;
            if ($job->is_nearby) $score += 25;
            if (!empty($job->raw_score) && $job->raw_score > 0) $score += min(23, (int)$job->raw_score * 3);
            $job->match_score = min(98, $score);
        }

        // 3. CATEGORIES WITH POSTS (Only categories that have active/approved jobs)
        $categories = Category::where('status', 'active')
            ->withCount(['jobPosts' => function ($query) {
                $query->whereIn('status', ['active', 'approved'])
                      ->where(function ($sub) {
                          $sub->whereNull('is_deleted')->orWhere('is_deleted', 0);
                      });
            }])
            ->having('job_posts_count', '>', 0)
            ->orderBy('job_posts_count', 'desc')
            ->get();

        // 4. COMPANIES WITH POSTS (Only companies that have active/approved jobs)
        $topCompanies = Company::where('status', 'active')
            ->withCount(['jobPosts' => function ($query) {
                $query->whereIn('status', ['active', 'approved'])
                      ->where(function ($sub) {
                          $sub->whereNull('is_deleted')->orWhere('is_deleted', 0);
                      });
            }])
            ->having('job_posts_count', '>', 0)
            ->orderBy('job_posts_count', 'desc')
            ->take(20)
            ->get();

        // 5. SKILLS WITH POSTS & TRENDING SKILLS
        $activeJobPosts = JobPost::whereIn('status', ['active', 'approved'])
            ->where(function ($q) {
                $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
            })
            ->whereNotNull('skills')
            ->get(['id', 'skills']);

        $skillCounts = [];
        foreach ($activeJobPosts as $jp) {
            $skillsArr = is_array($jp->skills) ? $jp->skills : json_decode($jp->skills ?? '[]', true);
            if (empty($skillsArr) && is_string($jp->skills)) {
                $skillsArr = array_map('trim', explode(',', $jp->skills));
            }
            if (is_array($skillsArr)) {
                foreach ($skillsArr as $sk) {
                    $cleanSk = trim((string)$sk);
                    if ($cleanSk !== '') {
                        $skillCounts[$cleanSk] = ($skillCounts[$cleanSk] ?? 0) + 1;
                    }
                }
            }
        }
        arsort($skillCounts);

        $skillNames = array_keys($skillCounts);
        $dbSkills = !empty($skillNames)
            ? DB::table('skills')
                ->whereIn('name', $skillNames)
                ->get()
                ->keyBy(function ($item) {
                    return strtolower(trim($item->name));
                })
            : collect();

        $skillsWithDetails = [];
        foreach ($skillCounts as $name => $count) {
            $matched = $dbSkills->get(strtolower(trim($name)));
            $skillsWithDetails[] = [
                'id'              => $matched?->id ?? null,
                'uuid'            => $matched?->uuid ?? null,
                'name'            => $matched?->name ?? $name,
                'category'        => $matched?->category ?? null,
                'demand'          => $matched?->demand ?? 'high',
                'status'          => $matched?->status ?? 1,
                'job_posts_count' => $count,
            ];
        }

        $trendingSkills = array_slice($skillNames, 0, 15);

        return response()->json([
            'status'  => true,
            'message' => 'Home data fetched successfully',
            'data'    => [
                'locations'        => [],
                'recommended_jobs' => $recommendedJobs,
                'categories'       => $categories,
                'top_companies'    => $topCompanies,
                'skills'           => $skillsWithDetails,
                'trending_skills'  => $trendingSkills,
            ],
        ], 200);
    }

    /**
     * Search & Filter Jobs (Supports both Sectioned View and Paginated View)
     */
    public function filterJobs(Request $request)
    {
        $user = $request->user();

        // 1. Capture Inputs
        $search       = $request->input('search');
        $location     = $request->input('location');
        $categoryUuid = $request->input('category_uuid');
        $jobType      = $request->input('job_type');
        $experience   = $request->input('experience');
        $salary       = $request->input('salary');

        // 2. Base Query Setup
        $query = JobPost::with([
            'company:id,uuid,name,logo,location',
            'category:id,uuid,name',
        ])->whereIn('status', ['active', 'approved'])
          ->where(function ($q) {
              $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
          });

        // 3. Keyword Search (Title, Skills, Description, Company)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('skills', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('company', function ($comp) use ($search) {
                      $comp->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // 4. Location Filter
        if ($request->filled('location')) {
            $query->where('location', 'LIKE', "%{$location}%");
        }

        // 5. Category Filter
        if ($request->filled('category_uuid')) {
            $query->whereHas('category', function ($q) use ($categoryUuid) {
                $q->where('uuid', $categoryUuid);
            });
        }

        // 6. Job Type Filter
        if ($request->filled('job_type')) {
            $query->where('job_type', $jobType);
        }

        // 7. Experience Filter
        if ($request->filled('experience')) {
            $expInput = trim($request->input('experience'));

            if (strpos($expInput, '-') !== false) {
                $parts = explode('-', $expInput);
                $reqMinExp = (float) preg_replace('/[^0-9.]/', '', $parts[0] ?? 0);
                $reqMaxExp = (float) preg_replace('/[^0-9.]/', '', $parts[1] ?? 0);

                $query->where(function ($q) use ($reqMinExp, $reqMaxExp) {
                    $q->whereRaw("CAST(SUBSTRING_INDEX(experience, '-', 1) AS DECIMAL(10,2)) <= ?", [$reqMaxExp])
                      ->whereRaw("CAST(SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(experience, '-', -1)), ' ', 1) AS DECIMAL(10,2)) >= ?", [$reqMinExp]);
                });
            } else {
                $valExp = (float) preg_replace('/[^0-9.]/', '', $expInput);
                if ($valExp >= 0) {
                    $query->where(function ($q) use ($valExp) {
                        $q->whereRaw("CAST(SUBSTRING_INDEX(experience, '-', 1) AS DECIMAL(10,2)) <= ?", [$valExp])
                          ->whereRaw("CAST(SUBSTRING_INDEX(TRIM(SUBSTRING_INDEX(experience, '-', -1)), ' ', 1) AS DECIMAL(10,2)) >= ?", [$valExp]);
                    });
                }
            }
        }

        // 8. Salary Range Match
        if ($request->filled('salary')) {
            $salaryInput = trim($request->input('salary'));

            if (strpos($salaryInput, '-') !== false) {
                $parts = explode('-', $salaryInput);
                $reqMin = (float) preg_replace('/[^0-9.]/', '', $parts[0] ?? 0);
                $reqMax = (float) preg_replace('/[^0-9.]/', '', $parts[1] ?? 0);

                $query->where(function ($q) use ($reqMin, $reqMax) {
                    if ($reqMin > 0) {
                        $q->whereRaw("CAST(min_lpa AS DECIMAL(10,2)) >= ?", [$reqMin]);
                    }
                    if ($reqMax > 0) {
                        $q->whereRaw("CAST(max_lpa AS DECIMAL(10,2)) <= ?", [$reqMax]);
                    }
                });
            } else {
                $val = (float) preg_replace('/[^0-9.]/', '', $salaryInput);
                if ($val > 0) {
                    $query->where(function ($q) use ($val) {
                        $q->whereRaw("CAST(min_lpa AS DECIMAL(10,2)) <= ?", [$val])
                          ->whereRaw("CAST(max_lpa AS DECIMAL(10,2)) >= ?", [$val]);
                    });
                }
            }
        }

        // 9. Fetch Saved & Applied Status for Current User
        $savedJobUuids = [];
        $userApplications = collect();

        if ($user) {
            $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
                ->pluck('job_uuid')
                ->toArray();

            $userApplications = JobApplication::where('candidate_id', $user->id)
                ->latest()
                ->get()
                ->groupBy('job_id');
        }

        // 10. Fetch Results with Sorting (latest, popular/most_applied, salary_high, salary_low)
        $sort = strtolower((string) ($request->input('sort') ?? $request->query('sort') ?? 'latest'));
        if ($sort === 'popular' || $sort === 'most_applied') {
            $query->orderByDesc('applicants')->orderByDesc('id');
        } elseif ($sort === 'salary_high') {
            $query->orderByDesc('max_salary')->orderByDesc('id');
        } elseif ($sort === 'salary_low') {
            $query->orderBy('min_salary')->orderByDesc('id');
        } else {
            // Default: 'latest' (newest posts first)
            $query->latest('id');
        }

        $jobs = $query->get()->map(function ($job) use ($userApplications, $savedJobUuids) {
            $applications = $userApplications->get($job->id);
            $latestApplication = $applications ? $applications->first() : null;

            $canApply = true;
            $reapplyAt = null;
            $status = null;

            if ($latestApplication) {
                $status = strtolower($latestApplication->status);

                switch ($status) {
                    case 'pending':
                    case 'applied':
                    case 'selected':
                    case 'cancelled':
                        $canApply = false;
                        break;

                    case 'rejected':
                        $reapplyAt = Carbon::parse($latestApplication->updated_at)->addDays(60);
                        $canApply  = now()->gte($reapplyAt);
                        break;
                }
            }

            $jobArray = $job->toArray();
            $jobArray['has_applied']        = !is_null($latestApplication);
            $jobArray['is_saved']          = in_array($job->uuid, $savedJobUuids);
            $jobArray['can_apply']         = $canApply;
            $jobArray['application_status'] = $status;
            $jobArray['reapply_at']         = $reapplyAt?->toISOString();

            return $jobArray;
        });

        // 11. Final Response
        return response()->json([
            'status'     => true,
            'message'    => 'Jobs searched successfully',
            'total_jobs' => $jobs->count(),
            'data'       => $jobs
        ], 200);
    }

    /**
     * Get Jobs List (Matched against User Profile & 15km Current App Location)
     */
    public function getJobs(Request $request)
    {
        $user = $request->user();
        $tab  = $request->query('tab', 'recommended');

        // 1. Resolve Candidate Location (App GPS coordinates or User DB coordinates)
        $lat = $request->input('latitude') ?? $request->input('lat');
        $lng = $request->input('longitude') ?? $request->input('lng');

        if (($lat === null || $lng === null) && $user) {
            $lat = $user->app_latitude ?? $user->latitude;
            $lng = $user->app_longitude ?? $user->longitude;
        }

        $lat = is_numeric($lat) ? (float) $lat : null;
        $lng = is_numeric($lng) ? (float) $lng : null;
        $hasCoords = ($lat !== null && $lng !== null);

        // Update app location on user record if provided
        if ($user && $hasCoords && ($user->app_latitude != $lat || $user->app_longitude != $lng)) {
            $user->updateQuietly([
                'app_latitude'    => $lat,
                'app_longitude'   => $lng,
                'app_last_active' => now(),
            ]);
        }

        // 2. Extract Candidate Profile Attributes
        $userTitles     = [];
        $userSkills     = [];
        $userEducations = [];
        $userCity       = null;
        $userArea       = null;
        $userCategoryId = null;

        if ($user) {
            $userCity       = !empty($user->city) ? trim($user->city) : null;
            $userArea       = !empty($user->area) ? trim($user->area) : null;
            $userCategoryId = $user->category_id;

            // Titles from Profile, Active Resume, and Latest Experience
            $activeResume = $user->defaultResume ?? $user->resumes()->latest()->first();
            $latestExp    = $user->latestExperience;

            $candidateTitles = [
                $user->job_title ?? null,
                $activeResume?->title ?? null,
                $latestExp?->job_title ?? null,
            ];
            foreach ($candidateTitles as $t) {
                if (!empty($t)) {
                    $cleaned = trim($t);
                    if ($cleaned !== '') {
                        $userTitles[] = $cleaned;
                    }
                }
            }
            $userTitles = array_values(array_unique($userTitles));

            // Skills from User Profile & Resume
            $rawSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
            if (!empty($rawSkills) && is_array($rawSkills)) {
                foreach ($rawSkills as $sk) {
                    $cleaned = trim((string)$sk);
                    if ($cleaned !== '') {
                        $userSkills[] = $cleaned;
                    }
                }
            }
            $userSkills = array_values(array_unique($userSkills));

            // Educations from User table and user_educations relation
            if (!empty($user->education)) {
                $userEducations[] = trim($user->education);
            }
            try {
                $eduRows = $user->educations()->get(['degree', 'field_of_study']);
                foreach ($eduRows as $er) {
                    if (!empty($er->degree)) {
                        $userEducations[] = trim($er->degree);
                    }
                    if (!empty($er->field_of_study)) {
                        $userEducations[] = trim($er->field_of_study);
                    }
                }
            } catch (\Throwable $e) {
                // Ignore relation error
            }
            $userEducations = array_values(array_unique(array_filter($userEducations)));
        }

        // 3. Base Query: Only Active / Approved & Non-deleted Jobs
        $baseQuery = JobPost::with(['company', 'category'])
            ->whereIn('status', ['active', 'approved'])
            ->where(function ($q) {
                $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
            });

        // 4. Recommended Matching Query
        // Match: Within 15km OR Title Match OR Skills Match OR Education Match OR City/Area Match OR Category Match
        $hasAnyCriteria = $hasCoords || !empty($userTitles) || !empty($userSkills) || !empty($userEducations) || !empty($userCity) || !empty($userCategoryId);

        $recommendedQuery = (clone $baseQuery);

        if ($hasAnyCriteria) {
            $recommendedQuery->where(function ($q) use ($hasCoords, $lat, $lng, $userTitles, $userSkills, $userEducations, $userCity, $userArea, $userCategoryId) {
                // Criterion A: Within 15 km of user's current coordinates
                if ($hasCoords) {
                    $haversine = "(6371 * acos(least(1.0, greatest(-1.0, cos(radians({$lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians({$lng})) + sin(radians({$lat})) * sin(radians(latitude))))))";
                    $q->orWhere(function ($nearQ) use ($haversine) {
                        $nearQ->whereNotNull('latitude')
                              ->whereNotNull('longitude')
                              ->whereRaw("{$haversine} <= 15");
                    });
                }

                // Criterion B: City / Area Match
                if (!empty($userCity)) {
                    $q->orWhere('location', 'LIKE', '%' . $userCity . '%');
                }
                if (!empty($userArea)) {
                    $q->orWhere('location', 'LIKE', '%' . $userArea . '%');
                }

                // Criterion C: Job Title / Role Match
                foreach ($userTitles as $t) {
                    $escaped = addslashes($t);
                    $q->orWhere('title', 'LIKE', '%' . $escaped . '%')
                      ->orWhere('skills', 'LIKE', '%' . $escaped . '%');
                }

                // Criterion D: Skills Match
                foreach ($userSkills as $s) {
                    $escaped = addslashes($s);
                    $q->orWhereJsonContains('skills', $s)
                      ->orWhere('skills', 'LIKE', '%' . $escaped . '%')
                      ->orWhere('title', 'LIKE', '%' . $escaped . '%');
                }

                // Criterion E: Education / Qualifications Match
                foreach ($userEducations as $edu) {
                    $escaped = addslashes($edu);
                    $q->orWhere('qualifications', 'LIKE', '%' . $escaped . '%')
                      ->orWhere('description', 'LIKE', '%' . $escaped . '%');
                }

                // Criterion F: Category Match
                if (!empty($userCategoryId)) {
                    $q->orWhere('category_id', $userCategoryId);
                }
            });
        }

        $jobsCollection = $recommendedQuery->latest('id')->get();

        // Fallback: If recommended matching returned fewer than 5 jobs, supplement with general active jobs
        // so candidate never sees a blank page while still seeing recommended jobs first!
        if ($jobsCollection->count() < 10) {
            $existingIds = $jobsCollection->pluck('id')->toArray();
            $fallbackJobs = (clone $baseQuery)
                ->whereNotIn('id', $existingIds)
                ->latest('id')
                ->limit(20)
                ->get();

            $jobsCollection = $jobsCollection->concat($fallbackJobs);
        }

        // 5. User Applications & Saved Status Maps
        $savedJobUuids = [];
        $userApplications = collect();

        if ($user) {
            $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
                ->pluck('job_uuid')
                ->toArray();

            $userApplications = JobApplication::where('candidate_id', $user->id)
                ->latest()
                ->get()
                ->groupBy('job_id');
        }

        // 6. Map jobs, calculate Distance & Dynamic Match Score (0 - 100%)
        $processedJobs = $jobsCollection->map(function ($job) use ($userApplications, $savedJobUuids, $hasCoords, $lat, $lng, $userTitles, $userSkills, $userEducations, $userCity, $userCategoryId) {
            $applications = $userApplications->get($job->id);
            $latestApplication = $applications ? $applications->first() : null;

            $canApply = true;
            $reapplyAt = null;
            $status = null;

            if ($latestApplication) {
                $status = strtolower($latestApplication->status);
                switch ($status) {
                    case 'pending':
                    case 'applied':
                    case 'selected':
                    case 'cancelled':
                        $canApply = false;
                        break;
                    case 'rejected':
                        $reapplyAt = Carbon::parse($latestApplication->updated_at)->addDays(60);
                        $canApply  = now()->gte($reapplyAt);
                        break;
                }
            }

            // A. Calculate Distance
            $distanceKm = null;
            $isNearby15km = false;
            if ($hasCoords && $job->latitude !== null && $job->longitude !== null) {
                $distanceKm = GeocodingService::haversineDistance($lat, $lng, (float)$job->latitude, (float)$job->longitude);
                $isNearby15km = ($distanceKm <= 15.0);
            }

            // B. Calculate Match Score (Weighted)
            $score = 50; // Base score
            $matchReasons = [];

            // 15km proximity boost
            if ($isNearby15km) {
                $score += ($distanceKm <= 5.0) ? 35 : 25;
                $matchReasons[] = "Within 15km";
            } elseif ($distanceKm !== null && $distanceKm <= 30.0) {
                $score += 10;
            }

            // Title match boost
            $jobTitleLower = strtolower($job->title ?? '');
            foreach ($userTitles as $t) {
                $tLower = strtolower($t);
                if (str_contains($jobTitleLower, $tLower) || str_contains($tLower, $jobTitleLower)) {
                    $score += 20;
                    $matchReasons[] = "Title matched";
                    break;
                }
            }

            // Skills match boost
            $jobSkills = is_array($job->skills) ? $job->skills : json_decode($job->skills ?? '[]', true);
            if (!is_array($jobSkills)) {
                $jobSkills = [];
            }
            $jobSkillsLower = array_map('strtolower', array_map('trim', $jobSkills));

            $matchedSkillsCount = 0;
            foreach ($userSkills as $us) {
                $usLower = strtolower($us);
                if (in_array($usLower, $jobSkillsLower) || str_contains(implode(' ', $jobSkillsLower), $usLower)) {
                    $matchedSkillsCount++;
                }
            }
            if ($matchedSkillsCount > 0) {
                $score += min(25, $matchedSkillsCount * 10);
                $matchReasons[] = "{$matchedSkillsCount} skills matched";
            }

            // Education match boost
            $qualStr = is_array($job->qualifications) ? implode(' ', $job->qualifications) : (string)($job->qualifications ?? '');
            $descStr = is_array($job->description) ? implode(' ', $job->description) : (string)($job->description ?? '');
            $qualLower = strtolower($qualStr . ' ' . $descStr);
            foreach ($userEducations as $ue) {
                if (is_string($ue) && $ue !== '' && str_contains($qualLower, strtolower($ue))) {
                    $score += 15;
                    $matchReasons[] = "Education matched";
                    break;
                }
            }

            // Category boost
            if (!empty($userCategoryId) && $job->category_id == $userCategoryId) {
                $score += 10;
            }

            // City boost
            if (!empty($userCity) && str_contains(strtolower($job->location ?? ''), strtolower($userCity))) {
                $score += 10;
            }

            $finalScore = min(98, max(50, $score));

            $jobArray = $job->toArray();
            $jobArray['has_applied']        = !is_null($latestApplication);
            $jobArray['is_saved']          = in_array($job->uuid, $savedJobUuids);
            $jobArray['can_apply']         = $canApply;
            $jobArray['application_status'] = $status;
            $jobArray['reapply_at']         = $reapplyAt?->toISOString();
            $jobArray['distance_km']        = $distanceKm !== null ? round($distanceKm, 1) : null;
            $jobArray['is_nearby']          = $isNearby15km;
            $jobArray['match_score']        = $finalScore;
            $jobArray['match_reasons']      = $matchReasons;

            return $jobArray;
        });

        // 7. Sort: Based on user requested sort ('latest', 'popular' / 'most_applied', 'recommended', 'salary_high', 'salary_low')
        $sort = strtolower((string) ($request->input('sort') ?? $request->query('sort') ?? 'latest'));
        $sortedJobs = $processedJobs->sort(function ($a, $b) use ($sort) {
            // Popular / Most Applied: highest applicants count first
            if ($sort === 'popular' || $sort === 'most_applied') {
                $appA = (int) ($a['applicants'] ?? 0);
                $appB = (int) ($b['applicants'] ?? 0);
                if ($appA !== $appB) {
                    return $appB <=> $appA;
                }
                return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
            }

            // Recommended / Match Score: highest match score first, then distance
            if ($sort === 'recommended' || $sort === 'match') {
                if ($a['match_score'] !== $b['match_score']) {
                    return $b['match_score'] <=> $a['match_score'];
                }
                if ($a['distance_km'] !== null && $b['distance_km'] !== null) {
                    return $a['distance_km'] <=> $b['distance_km'];
                }
                return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
            }

            // Salary High to Low
            if ($sort === 'salary_high') {
                $salA = (float) ($a['max_salary'] ?? $a['min_salary'] ?? 0);
                $salB = (float) ($b['max_salary'] ?? $b['min_salary'] ?? 0);
                if ($salA !== $salB) {
                    return $salB <=> $salA;
                }
                return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
            }

            // Salary Low to High
            if ($sort === 'salary_low') {
                $salA = (float) ($a['min_salary'] ?? $a['max_salary'] ?? 0);
                $salB = (float) ($b['min_salary'] ?? $b['max_salary'] ?? 0);
                if ($salA !== $salB) {
                    return $salA <=> $salB;
                }
                return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
            }

            // Default: 'latest' -> Most recently posted jobs first!
            return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
        })->values();

        // 8. Dynamic Filter Options for App
        $metaFilters = [
            'categories'  => Category::whereIn('id', function ($q) {
                $q->select('category_id')
                  ->from('job_posts')
                  ->whereIn('status', ['active', 'approved'])
                  ->where(function ($sub) {
                      $sub->whereNull('is_deleted')->orWhere('is_deleted', 0);
                  })
                  ->whereNotNull('category_id');
            })->select('id', 'name', 'uuid')->get(),

            'locations'   => JobPost::whereIn('status', ['active', 'approved'])
                ->where(function ($q) {
                    $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
                })
                ->whereNotNull('location')
                ->distinct()
                ->pluck('location')
                ->values(),

            'job_types'   => JobPost::whereIn('status', ['active', 'approved'])
                ->where(function ($q) {
                    $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
                })
                ->whereNotNull('job_type')
                ->distinct()
                ->pluck('job_type')
                ->values(),

            'experiences' => JobPost::whereIn('status', ['active', 'approved'])
                ->where(function ($q) {
                    $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
                })
                ->whereNotNull('experience')
                ->distinct()
                ->pluck('experience')
                ->values(),
        ];

        return response()->json([
            'status'        => true,
            'message'       => 'Recommended jobs fetched successfully',
            'active_tab'    => $tab,
            'user_location' => [
                'latitude'  => $lat,
                'longitude' => $lng,
                'radius_km' => 15,
            ],
            'filters'       => $metaFilters,
            'total_jobs'    => $sortedJobs->count(),
            'data'          => $sortedJobs,
        ], 200);
    }

    /**
     * Get Single Job Detail by UUID
     */
    public function getJobDetail(Request $request, $uuid)
    {
        $user = $request->user();

        $job = JobPost::with(['company', 'category'])
            ->where('uuid', $uuid)
            ->first();

        if (!$job || $job->is_deleted == 1 || !in_array($job->status, ['active', 'approved'])) {
            return response()->json([
                'status'    => false,
                'message'   => 'This job has been closed or removed by the employer.',
                'is_closed' => true,
            ], 404);
        }

        $application = JobApplication::where('candidate_id', $user->id)
            ->where('job_id', $job->id)
            ->first();

        $isSaved = SavedJob::where('user_uuid', $user->uuid)
            ->where('job_uuid', $job->uuid)
            ->exists();

        $job->has_applied         = !is_null($application);
        $job->is_saved            = $isSaved;
        $job->application_details = $application;

        return response()->json([
            'status'  => true,
            'message' => 'Job detail fetched successfully',
            'data'    => $job
        ], 200);
    }

    /**
     * Apply for a Job (Direct resume_url or active default resume fallback)
     */
    public function applyJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_uuid'       => 'required|exists:job_posts,uuid',
            'candidate_uuid' => 'nullable|exists:users,uuid',
            'resume_url'     => 'nullable|string',
            'cover_letter'   => 'nullable|string',
            'full_name'      => 'nullable|string|max:255',
            'email'          => 'nullable|email|max:255',
            'phone'          => 'nullable|string|max:50',
            'city'           => 'nullable|string|max:255',
            'current_title'  => 'nullable|string|max:255',
            'experience'     => 'nullable|string|max:255',
            'current_salary' => 'nullable|string|max:255',
            'expected_salary'=> 'nullable|string|max:255',
            'last_company'   => 'nullable|string|max:255',
            'notice_period'  => 'nullable|string|max:255',
            'last_working_day'=> 'nullable|string|max:255',
            'qualification'  => 'nullable|string|max:255',
            'education_degree'=> 'nullable|string|max:255',
            'education_institute'=> 'nullable|string|max:255',
            'portfolio'      => 'nullable|string|max:255',
            'linkedin'       => 'nullable|string|max:255',
            'why_apply'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user() ?? User::where('uuid', $request->candidate_uuid)->first();
        $job  = JobPost::where('uuid', $request->job_uuid)->first();

        if (!$user || !$job) {
            return response()->json([
                'status'  => false,
                'message' => 'User or Job not found.'
            ], 404);
        }

        // 1. Resolve Resume (Direct File Upload, Selected Resume ID, URL, or Profile Default)
        $resumeUrl = null;
        if ($request->hasFile('cv_file') || $request->hasFile('resume_file')) {
            $file = $request->file('cv_file') ?? $request->file('resume_file');
            $stored = $file->store('resumes', 'public');
            $resumeUrl = asset('storage/' . $stored);

            try {
                \App\Models\UserResume::create([
                    'user_uuid'  => $user->uuid,
                    'title'      => $file->getClientOriginalName(),
                    'file_path'  => 'storage/' . $stored,
                    'file_type'  => $file->getClientOriginalExtension(),
                    'is_default' => true,
                ]);
            } catch (\Throwable $e) {
                // Ignore resume table error
            }
        } elseif ($request->filled('resume_id') || $request->filled('selected_resume_id')) {
            $rId = $request->input('resume_id') ?: $request->input('selected_resume_id');
            $selectedResume = \App\Models\UserResume::where('user_uuid', $user->uuid)
                ->where(function ($q) use ($rId) {
                    $q->where('id', $rId)->orWhere('uuid', $rId);
                })->first();

            if ($selectedResume && $selectedResume->file_path) {
                $fp = $selectedResume->file_path;
                $resumeUrl = str_starts_with($fp, 'http') ? $fp : asset(str_starts_with($fp, 'storage/') ? $fp : 'storage/' . $fp);
            }
        } elseif (!empty($request->resume_url)) {
            $resumeUrl = $request->resume_url;
        } else {
            $defaultResume = $user->defaultResume ?? $user->resumes()->where('is_delete', 0)->latest()->first();
            if ($defaultResume && $defaultResume->file_path) {
                $fp = $defaultResume->file_path;
                $resumeUrl = str_starts_with($fp, 'http') ? $fp : asset(str_starts_with($fp, 'storage/') ? $fp : 'storage/' . $fp);
            }
        }

        if (empty($resumeUrl)) {
            return response()->json([
                'status'  => false,
                'message' => 'Please provide a resume or set an active default resume first.'
            ], 400);
        }

        // 2. Duplicate Application Check
        $alreadyApplied = JobApplication::where('candidate_id', $user->id)
            ->where('job_id', $job->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'status'  => false,
                'message' => 'You have already applied for this job.'
            ], 400);
        }

        // 3. Parse Skills
        $skillsInput = $request->input('skills');
        $candidateSkills = is_array($skillsInput)
            ? $skillsInput
            : (is_string($skillsInput) && !empty($skillsInput)
                ? array_filter(array_map('trim', explode(',', $skillsInput)))
                : ($user->skills ?? []));

        // 4. Construct Answers Snapshot
        $answers = $request->input('answers') ?: [
            'currentTitle'       => $request->input('current_title') ?: ($user->job_title ?? ''),
            'city'               => $request->input('city') ?: ($user->city ?? ''),
            'experience'         => $request->input('experience') ?: ($user->total_experience_years ?? ''),
            'qualification'      => $request->input('qualification') ?: '',
            'educationDegree'    => $request->input('education_degree') ?: ($user->education ?? ''),
            'educationInstitute' => $request->input('education_institute') ?: '',
            'skills'             => array_values($candidateSkills),
            'currentSalary'      => $request->input('current_salary') ?: ($user->current_ctc ?? ''),
            'expectedSalary'     => $request->input('expected_salary') ?: ($user->expected_ctc ?? ''),
            'lastCompany'        => $request->input('last_company') ?: '',
            'notice'             => $request->input('notice_period') ?: ($user->notice_period_days ?? ''),
            'lastWorkingDay'     => $request->input('last_working_day') ?: '',
            'portfolio'          => $request->input('portfolio') ?: ($user->portfolio ?? ''),
            'linkedin'           => $request->input('linkedin') ?: ($user->linkedin ?? ''),
            'whyApply'           => $request->input('why_apply') ?: '',
        ];

        try {
            $appData = [
                'candidate_id'         => $user->id,
                'job_id'               => $job->id,
                'candidate_uuid'       => $user->uuid,
                'resume_url'           => $resumeUrl,
                'cover_letter'         => $request->input('cover_letter') ?: $request->input('why_apply'),
                'candidate_name'       => $request->input('full_name') ?: ($request->input('candidate_name') ?: ($user->full_name ?? $user->name)),
                'candidate_email'      => $request->input('email') ?: ($request->input('candidate_email') ?: $user->email),
                'candidate_phone'      => $request->input('phone') ?: ($request->input('candidate_phone') ?: $user->phone),
                'candidate_skills'     => array_values($candidateSkills),
                'candidate_experience' => $request->input('experience') ?: $user->total_experience_years,
                'current_salary'       => $request->input('current_salary') ?: $user->current_ctc,
                'expected_salary'      => $request->input('expected_salary') ?: $user->expected_ctc,
                'last_company'         => $request->input('last_company'),
                'notice_period'        => $request->input('notice_period') ?: $user->notice_period_days,
                'last_working_day'     => $request->input('last_working_day'),
                'city'                 => $request->input('city') ?: $user->city,
                'answers'              => is_array($answers) ? json_encode($answers) : $answers,
                'status'               => 'applied'
            ];

            // Filter columns to avoid db exceptions if any column is pending
            try {
                $existingCols = \Illuminate\Support\Facades\Schema::getColumnListing('job_applications');
                if (!empty($existingCols)) {
                    $appData = array_intersect_key($appData, array_flip($existingCols));
                }
            } catch (\Throwable $e) {}

            $application = JobApplication::create($appData);

            $job->increment('applicants');

            // 5. Update Candidate Profile with newly submitted details
            try {
                $userUpdateData = array_filter([
                    'full_name'              => $request->input('full_name') ?: $request->input('candidate_name'),
                    'city'                   => $request->input('city'),
                    'job_title'              => $request->input('current_title'),
                    'total_experience_years' => $request->input('experience'),
                    'current_ctc'            => $request->input('current_salary'),
                    'expected_ctc'           => $request->input('expected_salary'),
                    'notice_period_days'     => $request->input('notice_period'),
                    'portfolio'              => $request->input('portfolio'),
                    'linkedin'               => $request->input('linkedin'),
                    'education'              => $request->input('education_degree') ?: $request->input('qualification'),
                ]);
                if (!empty($candidateSkills)) {
                    $userUpdateData['skills'] = array_values($candidateSkills);
                }
                if (!empty($userUpdateData)) {
                    $user->update($userUpdateData);
                }

                // Auto-create education entry if missing
                if ($request->filled('education_degree') || $request->filled('qualification')) {
                    $deg = $request->input('education_degree') ?: $request->input('qualification');
                    $inst = $request->input('education_institute') ?: 'University/College';
                    if (!$user->educations()->where('is_delete', 0)->exists()) {
                        \App\Models\UserEducation::create([
                            'user_uuid'   => $user->uuid,
                            'degree'      => $deg,
                            'institution' => $inst,
                            'start_year'  => date('Y') - 3,
                            'end_year'    => date('Y'),
                            'is_delete'   => 0,
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                // Ignore profile update error
            }

            // Trigger MailService: sends confirmation email to candidate, in-app + push,
            // and notifies Creator Admin, Assigned Team Member, and Super Admin via Email + In-App!
            try {
                MailService::sendJobApplied($application);
            } catch (Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Failed sending application email/notifications: ' . $e->getMessage());
            }

            $responseData = $application->toArray();
            $responseData['candidate_uuid'] = $user->uuid;
            $responseData['job_uuid']       = $job->uuid;

            unset($responseData['candidate_id'], $responseData['job_id']);

            return response()->json([
                'status'      => true,
                'message'     => 'Application submitted successfully',
                'application' => $responseData
            ], 201);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save ya Unsave Job (Toggle)
     */
    public function toggleSaveJob(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_uuid' => 'required|string|exists:job_posts,uuid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $jobUuid = $request->job_uuid;

        $savedJob = SavedJob::where('user_uuid', $user->uuid)
            ->where('job_uuid', $jobUuid)
            ->first();

        if ($savedJob) {
            $savedJob->delete();

            return response()->json([
                'status'   => true,
                'is_saved' => false,
                'message'  => 'Job removed from saved list successfully.'
            ], 200);
        }

        SavedJob::create([
            'user_uuid' => $user->uuid,
            'job_uuid'  => $jobUuid,
        ]);

        return response()->json([
            'status'   => true,
            'is_saved' => true,
            'message'  => 'Job saved successfully.'
        ], 201);
    }

    /**
     * Saved Jobs ki list fetch karna:
     * - Deleted jobs (is_deleted = 1) filter out
     * - Status active / approved only
     * - Candidate profile se match hone wali jobs hi show karein
     */
    public function getSavedJobs(Request $request)
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);

        // 1. Candidate ke saved job UUIDs
        $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
            ->pluck('job_uuid')
            ->toArray();

        if (empty($savedJobUuids)) {
            return response()->json([
                'status'  => true,
                'message' => 'Saved jobs retrieved successfully.',
                'data'    => new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage)
            ], 200);
        }

        // 2. Base Query: Only Active / Approved & Non-deleted JobPosts
        $savedQuery = JobPost::with(['company:id,uuid,name,logo,location', 'category:id,uuid,name'])
            ->whereIn('uuid', $savedJobUuids)
            ->whereIn('status', ['active', 'approved'])
            ->where(function ($q) {
                $q->whereNull('is_deleted')->orWhere('is_deleted', 0);
            });

        // 3. Candidate Profile Match Filter (Skills, Title, City, Education, Category)
        $lat = $request->input('latitude') ?? $request->input('lat');
        $lng = $request->input('longitude') ?? $request->input('lng');
        if (($lat === null || $lng === null) && $user) {
            $lat = $user->app_latitude ?? $user->latitude;
            $lng = $user->app_longitude ?? $user->longitude;
        }
        $lat = is_numeric($lat) ? (float) $lat : null;
        $lng = is_numeric($lng) ? (float) $lng : null;
        $hasCoords = ($lat !== null && $lng !== null);

        $userCity       = !empty($user->city) ? trim($user->city) : null;
        $userArea       = !empty($user->area) ? trim($user->area) : null;
        $userCategoryId = $user->category_id;

        $activeResume = $user->defaultResume ?? $user->resumes()->latest()->first();
        $latestExp    = $user->latestExperience;
        $candidateTitles = [
            $user->job_title ?? null,
            $activeResume?->title ?? null,
            $latestExp?->job_title ?? null,
        ];
        $userTitles = [];
        foreach ($candidateTitles as $t) {
            if (!empty($t) && trim($t) !== '') {
                $userTitles[] = trim($t);
            }
        }
        $userTitles = array_values(array_unique($userTitles));

        $rawSkills = is_array($user->skills) ? $user->skills : json_decode($user->skills ?? '[]', true);
        $userSkills = [];
        if (!empty($rawSkills) && is_array($rawSkills)) {
            foreach ($rawSkills as $sk) {
                if (!empty($sk) && trim((string)$sk) !== '') {
                    $userSkills[] = trim((string)$sk);
                }
            }
        }
        $userSkills = array_values(array_unique($userSkills));

        $userEducations = [];
        if (!empty($user->education)) {
            $userEducations[] = trim($user->education);
        }
        try {
            $eduRows = $user->educations()->get(['degree', 'field_of_study']);
            foreach ($eduRows as $er) {
                if (!empty($er->degree)) $userEducations[] = trim($er->degree);
                if (!empty($er->field_of_study)) $userEducations[] = trim($er->field_of_study);
            }
        } catch (\Throwable $e) {}
        $userEducations = array_values(array_unique(array_filter($userEducations)));

        $hasAnyCriteria = $hasCoords || !empty($userTitles) || !empty($userSkills) || !empty($userEducations) || !empty($userCity) || !empty($userCategoryId);

        if ($hasAnyCriteria) {
            $savedQuery->where(function ($q) use ($hasCoords, $lat, $lng, $userTitles, $userSkills, $userEducations, $userCity, $userArea, $userCategoryId) {
                if ($hasCoords) {
                    $haversine = "(6371 * acos(least(1.0, greatest(-1.0, cos(radians({$lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians({$lng})) + sin(radians({$lat})) * sin(radians(latitude))))))";
                    $q->orWhere(function ($nearQ) use ($haversine) {
                        $nearQ->whereNotNull('latitude')
                              ->whereNotNull('longitude')
                              ->whereRaw("{$haversine} <= 15");
                    });
                }
                if (!empty($userCity)) {
                    $q->orWhere('location', 'LIKE', '%' . $userCity . '%');
                }
                if (!empty($userArea)) {
                    $q->orWhere('location', 'LIKE', '%' . $userArea . '%');
                }
                foreach ($userTitles as $t) {
                    $escaped = addslashes($t);
                    $q->orWhere('title', 'LIKE', '%' . $escaped . '%')
                      ->orWhere('skills', 'LIKE', '%' . $escaped . '%');
                }
                foreach ($userSkills as $s) {
                    $escaped = addslashes($s);
                    $q->orWhereJsonContains('skills', $s)
                      ->orWhere('skills', 'LIKE', '%' . $escaped . '%')
                      ->orWhere('title', 'LIKE', '%' . $escaped . '%');
                }
                foreach ($userEducations as $edu) {
                    $escaped = addslashes($edu);
                    $q->orWhere('qualifications', 'LIKE', '%' . $escaped . '%')
                      ->orWhere('description', 'LIKE', '%' . $escaped . '%');
                }
                if (!empty($userCategoryId)) {
                    $q->orWhere('category_id', $userCategoryId);
                }
            });
        }

        $appliedJobIds = JobApplication::where('candidate_id', $user->id)
            ->pluck('job_id')
            ->toArray();

        $paginatedJobs = $savedQuery->latest('id')->paginate($perPage);

        $paginatedJobs->getCollection()->transform(function ($job) use ($appliedJobIds) {
            $job->has_applied = in_array($job->id, $appliedJobIds);
            $job->is_saved    = true;
            return [
                'job_uuid' => $job->uuid,
                'job'      => $job,
            ];
        });

        return response()->json([
            'status'  => true,
            'message' => 'Saved jobs retrieved successfully.',
            'data'    => $paginatedJobs
        ], 200);
    }

    /**
     * Get All Applied Jobs with summary counts and categorized list (Using UUIDs)
     */
    public function getAppliedJobs(Request $request)
    {
        $user = $request->user();
        $tab = strtolower($request->input('tab', 'all'));

        $baseQuery = JobApplication::with([
            'candidate:id,uuid',
            'jobPost' => function ($q) {
                $q->with([
                    'company:id,uuid,name,logo,location',
                    'category:id,uuid,name'
                ]);
            }
        ])->where(function ($q) use ($user) {
            $q->where('candidate_id', $user->id);
            if (!empty($user->uuid)) {
                $q->orWhere('candidate_uuid', $user->uuid);
            }
        });

        $allApplications = (clone $baseQuery)->latest()->get();

        $savedJobUuids = SavedJob::where('user_uuid', $user->uuid)
            ->pluck('job_uuid')
            ->toArray();

        $counts = [
            'total_applied' => $allApplications->count(),
            'under_review'  => $allApplications->whereIn('status', ['applied', 'pending', 'under_review'])->count(),
            'shortlisted'   => $allApplications->whereIn('status', ['shortlisted', 'interview'])->count(),
            'selected'      => $allApplications->where('status', 'selected')->count(),
            'rejected'      => $allApplications->where('status', 'rejected')->count(),
        ];

        $formattedApplications = $allApplications->map(function ($app) use ($user, $savedJobUuids) {
            $job = $app->jobPost;
            $reapplyAt = null;
            $canApply = false;

            if (strtolower($app->status) === 'rejected') {
                $reapplyAt = Carbon::parse($app->updated_at)->addDays(60);
                $canApply = now()->gte($reapplyAt);
            }

            $candidateUuid = $app->candidate?->uuid ?? $user->uuid;
            $jobUuid = $job?->uuid ?? null;

            // Check if job is closed or deleted
            $isJobClosed = !$job || $job->is_deleted == 1 || !in_array($job->status, ['active', 'approved']);

            $appData = $app->toArray();
            $appData['candidate_uuid'] = $candidateUuid;
            $appData['job_uuid']       = $jobUuid;
            $appData['is_job_closed']  = $isJobClosed;

            unset(
                $appData['id'],
                $appData['candidate_id'],
                $appData['job_id'],
                $appData['candidate'],
                $appData['job_post']
            );

            if ($job) {
                $jobData = $job->toArray();
                $jobData['is_saved']           = in_array($job->uuid, $savedJobUuids);
                $jobData['has_applied']        = true;
                $jobData['application_status'] = $app->status;
                $jobData['reapply_at']         = $reapplyAt?->toISOString();
                $jobData['can_apply']          = $canApply;
                $jobData['is_closed']          = $isJobClosed;
                $jobData['is_deleted']         = (bool) ($job->is_deleted ?? false);
                $jobData['job_status']         = $isJobClosed ? 'closed' : $job->status;

                unset(
                    $jobData['id'],
                    $jobData['company_id'],
                    $jobData['category_id'],
                    $jobData['sub_category_id']
                );

                if (isset($jobData['company']['id'])) {
                    unset($jobData['company']['id']);
                }

                if (isset($jobData['category']['id'])) {
                    unset($jobData['category']['id']);
                }

                $appData['job_details'] = $jobData;
            } else {
                $appData['job_details'] = [
                    'title'      => 'Closed Position',
                    'company'    => 'Employer',
                    'is_closed'  => true,
                    'is_deleted' => true,
                    'status'     => 'closed',
                    'job_status' => 'closed',
                    'location'   => 'Not available',
                    'job_type'   => 'Closed',
                    'skills'     => [],
                ];
            }

            return $appData;
        });

        if ($tab !== 'all') {
            $filteredData = $formattedApplications->filter(function ($item) use ($tab) {
                $status = strtolower($item['status'] ?? '');
                if ($tab === 'under_review') return in_array($status, ['applied', 'pending', 'under_review']);
                if ($tab === 'shortlisted')  return in_array($status, ['shortlisted', 'interview']);
                if ($tab === 'selected')     return $status === 'selected';
                if ($tab === 'rejected')     return $status === 'rejected';
                return true;
            })->values();

            return response()->json([
                'status'     => true,
                'message'    => 'Applied jobs fetched successfully',
                'active_tab' => $tab,
                'counts'     => $counts,
                'data'       => $filteredData,
            ], 200);
        }

        $categorized = [
            'all'          => $formattedApplications->values(),
            'under_review' => $formattedApplications->whereIn('status', ['applied', 'pending', 'under_review'])->values(),
            'shortlisted'  => $formattedApplications->whereIn('status', ['shortlisted', 'interview'])->values(),
            'selected'     => $formattedApplications->where('status', 'selected')->values(),
            'rejected'     => $formattedApplications->where('status', 'rejected')->values(),
        ];

        return response()->json([
            'status'     => true,
            'message'    => 'Applied jobs fetched successfully',
            'active_tab' => $tab,
            'counts'     => $counts,
            'data'       => $categorized,
        ], 200);
    }
}
