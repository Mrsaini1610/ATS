<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            return [
                'uuid'         => $user->uuid,
                'name'         => $user->full_name ?? ($user->username ?? 'Candidate'),
                'phone'        => $user->phone ?? '—',
                'email'        => $user->email ?? '—',
                'city'         => $user->city ?? '—',
                'jobTitle'     => $user->bio ?? 'General Candidate',
                'experience'   => $user->total_experience_years ? "{$user->total_experience_years} Years" : 'Fresher',
                'status'       => $user->is_online ? 'active' : 'inactive',
                'registeredAt' => $user->created_at ? $user->created_at->format('d M Y') : null,
                'appliedCount' => $user->job_applications_count ?? 0,
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
            'name'       => 'required|string|max:255',
            'phone'      => 'required|string|max:20|unique:users,phone',
            'email'      => 'nullable|email|max:255|unique:users,email',
            'city'       => 'nullable|string|max:255',
            'jobTitle'   => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:50',
            'category'   => 'nullable|string|max:255',
        ]);

        $baseSlug = Str::slug($validated['name']) ?: 'candidate';
        $username = $baseSlug . '-' . rand(1000, 9999);
        while (User::where('username', $username)->exists()) {
            $username = $baseSlug . '-' . rand(10000, 99999);
        }

        $categoryModel = !empty($validated['category'])
            ? \App\Models\Category::where('name', $validated['category'])->orWhere('id', $validated['category'])->first()
            : null;

        User::create([
            'uuid'                   => (string) Str::uuid(),
            'full_name'              => $validated['name'],
            'username'               => $username,
            'phone'                  => $validated['phone'],
            'email'                  => $validated['email'] ?? null,
            'category_id'            => $categoryModel?->id,
            'city'                   => $validated['city'] ?? null,
            'bio'                    => $validated['jobTitle'] ?? null,
            'skills'                 => !empty($validated['category']) ? [$validated['category']] : null,
            'total_experience_years' => preg_replace('/[^0-9]/', '', $validated['experience'] ?? '0') ?: null,
            'is_online'              => true,
            'created_by'             => auth('admin')->id(),
            'password'               => Hash::make('Password@123'),
        ]);

        return redirect()->back()->with('success', 'Candidate successfully registered.');
    }

    /**
     * Toggle candidate active/inactive state
     */
    public function toggleStatus(User $user)
    {
        $user->is_online = ! $user->is_online;
        $user->save();

        return redirect()->back()->with('success', 'Candidate status update ho gaya.');
    }
}