<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display all candidate profiles
     */
    public function index(Request $request): Response
    {
        $admin = auth('admin')->user();
        $canViewAll = $admin && ($admin->isSuperAdmin() || in_array('view_all_users', $admin->permissionList(), true));
        $scope = $request->query('scope', $canViewAll ? 'all' : 'your');
        if (! $canViewAll) {
            $scope = 'your';
        }

        $query = User::query()
            ->withCount('jobApplications')
            ->latest();

        if ($scope === 'your') {
            if ($admin->isAdmin()) {
                $teamMemberIds = \App\Models\Admin::where('created_by', $admin->id)->pluck('id')->toArray();
                $clusterIds = array_merge([$admin->id], $teamMemberIds);
                $clusterJobIds = \App\Models\JobPost::whereIn('created_by', $clusterIds)
                    ->orWhereIn('assigned_to', $clusterIds)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($clusterIds, $clusterJobIds) {
                    $q->whereIn('created_by', $clusterIds)
                      ->orWhereHas('jobApplications', function ($sq) use ($clusterJobIds) {
                          $sq->whereIn('job_id', $clusterJobIds);
                      });
                });
            } else {
                $myJobIds = \App\Models\JobPost::where('created_by', $admin->id)
                    ->orWhere('assigned_to', $admin->id)
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($admin, $myJobIds) {
                    $q->where('created_by', $admin->id)
                      ->orWhereHas('jobApplications', function ($sq) use ($myJobIds) {
                          $sq->whereIn('job_id', $myJobIds);
                      });
                });
            }
        }

        $users = $query->get()->map(function ($user) {
            // Determine platform: web, app, or both
            $hasWeb = !empty($user->web_last_active) || ($user->registered_from ?? 'web') === 'web';
            $hasApp = !empty($user->app_last_active) || ($user->registered_from ?? null) === 'app';
            
            if (!empty($user->web_last_active) && !empty($user->app_last_active)) {
                $platform = 'both';
            } elseif (!empty($user->app_last_active) || ($user->registered_from ?? null) === 'app') {
                $platform = 'app';
            } else {
                $platform = 'web';
            }

            return [
                'id'             => $user->id,
                'uuid'           => $user->uuid,
                'name'           => $user->full_name ?? ($user->username ?? 'Candidate'),
                'phone'          => $user->phone ?? '—',
                'email'          => $user->email ?? '—',
                'dob'            => $user->dob ? $user->dob->format('d M Y') : '—',
                'dob_raw'        => $user->dob ? $user->dob->format('Y-m-d') : null,
                'qualification'  => $user->education ?? '—',
                'state'          => $user->state ?? '—',
                'city'           => $user->city ?? '—',
                'area'           => $user->area ?? '—',
                'jobTitle'       => $user->job_title ?? ($user->bio ?? 'General Candidate'),
                'experience'     => $user->total_experience_years ? "{$user->total_experience_years} Years" : 'Fresher',
                'status'         => $user->is_online ? 'active' : 'inactive',
                'registeredAt'   => $user->created_at ? $user->created_at->format('d M Y') : null,
                'appliedCount'   => $user->job_applications_count ?? 0,
                'platform'       => $platform, // 'web' | 'app' | 'both'
                'registeredFrom' => $user->registered_from ?? 'web',
                'webLastActive'  => $user->web_last_active ? $user->web_last_active->format('d M Y, h:i A') : null,
                'appLastActive'  => $user->app_last_active ? $user->app_last_active->format('d M Y, h:i A') : null,
                'presence'       => \App\Services\PresenceService::getUserPresence($user),
                'skills'         => is_array($user->skills) ? $user->skills : (json_decode($user->skills, true) ?: []),
            ];
        });

        $categories = \App\Models\Category::where('status', 'active')
            ->select('id', 'uuid', 'name', 'icon')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Users', [
            'users'      => $users,
            'categories' => $categories,
            'canViewAll' => $canViewAll,
            'scope'      => $scope,
        ]);
    }

    /**
     * Admin creates a candidate profile
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'phone'         => 'required|string|max:20|unique:users,phone',
            'dob'           => 'required|date|before:today',
            'qualification' => 'required|string|max:255',
            'state'         => 'required|string|max:255',
            'city'          => 'required|string|max:255',
            'area'          => 'required|string|max:255',
            'email'         => 'nullable|email|max:255|unique:users,email',
            'jobTitle'      => 'nullable|string|max:255',
            'experience'    => 'nullable|string|max:50',
            'category'      => 'nullable|string|max:255',
        ], [
            'name.required'          => 'Candidate full name is required.',
            'phone.required'         => 'Phone number is required.',
            'phone.unique'           => 'This phone number is already registered with another candidate.',
            'dob.required'           => 'Date of birth is required.',
            'dob.before'             => 'Date of birth must be a past date.',
            'qualification.required' => 'Qualification is required.',
            'state.required'         => 'State is required.',
            'city.required'          => 'City is required.',
            'area.required'          => 'Area is required.',
            'email.email'            => 'Please enter a valid email address.',
            'email.unique'           => 'This email address is already registered.',
        ]);

        $baseSlug = Str::slug($validated['name']) ?: 'candidate';
        $username = $baseSlug . '-' . rand(1000, 9999);
        while (User::where('username', $username)->exists()) {
            $username = $baseSlug . '-' . rand(10000, 99999);
        }

        $categoryModel = !empty($validated['category'])
            ? \App\Models\Category::where('name', $validated['category'])
                ->orWhere('id', $validated['category'])
                ->orWhere('uuid', $validated['category'])
                ->first()
            : null;

        $user = User::create([
            'uuid'                   => (string) Str::uuid(),
            'full_name'              => $validated['name'],
            'username'               => $username,
            'phone'                  => $validated['phone'],
            'email'                  => $validated['email'] ?? null,
            'dob'                    => $validated['dob'],
            'education'              => $validated['qualification'],
            'state'                  => $validated['state'],
            'city'                   => $validated['city'],
            'area'                   => $validated['area'],
            'category_id'            => $categoryModel?->id,
            'job_title'              => $validated['jobTitle'] ?? null,
            'bio'                    => $validated['jobTitle'] ?? null,
            'skills'                 => !empty($validated['category']) ? [$validated['category']] : null,
            'total_experience_years' => preg_replace('/[^0-9]/', '', $validated['experience'] ?? '0') ?: null,
            'registered_from'        => 'web',
            'is_online'              => true,
            'created_by'             => auth('admin')->id(),
            'password'               => Hash::make('Password@123'),
        ]);

        if (!empty($user->email)) {
            try {
                \App\Services\MailService::sendWelcomeCandidate($user);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Candidate welcome email error: " . $e->getMessage());
            }
        }

        AuditLogService::log(
            action: 'candidate_created_by_admin',
            description: "Admin registered candidate {$user->full_name} ({$user->phone}).",
            details: [
                'candidate_id' => $user->id,
                'phone'        => $user->phone,
                'city'         => $user->city,
                'qualification'=> $user->education,
            ],
            module: 'users',
            entity: $user,
            status: 'success'
        );

        return redirect()->back()->with('success', 'Candidate successfully registered.');
    }

    /**
     * Toggle candidate active/inactive state
     */
    public function toggleStatus(User $user)
    {
        $user->is_online = ! $user->is_online;
        $user->save();

        AuditLogService::log(
            action: 'candidate_status_toggled',
            description: "Admin toggled status for candidate {$user->full_name} to " . ($user->is_online ? 'Active' : 'Inactive'),
            details: [
                'candidate_id' => $user->id,
                'is_online'    => $user->is_online,
            ],
            module: 'users',
            entity: $user,
            status: 'success'
        );

        return redirect()->back()->with('success', 'Candidate status update ho gaya.');
    }
}