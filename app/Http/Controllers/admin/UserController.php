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
        $users = User::query()
            ->latest()
            ->get()
            ->map(function ($user) {
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
                    'appliedCount' => 0, // Applications module integrate hone par dynamic count attach hoga
                ];
            });

        return Inertia::render('Admin/Users', [
            'users' => $users,
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
        ]);

        User::create([
            'uuid'                   => (string) Str::uuid(),
            'full_name'              => $validated['name'],
            'username'               => Str::slug($validated['name']) . '-' . rand(100, 999),
            'phone'                  => $validated['phone'],
            'email'                  => $validated['email'] ?? null,
            'city'                   => $validated['city'] ?? null,
            'bio'                    => $validated['jobTitle'] ?? null,
            'total_experience_years' => preg_replace('/[^0-9]/', '', $validated['experience'] ?? '0') ?: null,
            'is_online'              => true,
            'password'               => Hash::make('Password@123'), // Default candidate login password
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
