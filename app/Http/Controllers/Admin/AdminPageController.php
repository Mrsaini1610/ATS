<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminPageController extends Controller
{
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'regex:/^\d{10}$/'],
        ]);

        Auth::guard('admin')->user()->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:admin'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        Auth::guard('admin')->user()->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function profile(): Response
    {
        return Inertia::render('Admin/AdminProfile');
    }

    public function notifications(): Response
    {
        return Inertia::render('Admin/AdminNotifications');
    }

    public function applications(): Response
    {
        return Inertia::render('Admin/Applications');
    }

    public function interviews(): Response
    {
        return Inertia::render('Admin/Interviews');
    }

    public function tasks(): Response
    {
        return Inertia::render('Admin/Tasks');
    }

    public function jobs(): Response
    {
        return Inertia::render('Admin/Jobs');
    }

    public function createJob(): Response
    {
        return Inertia::render('Admin/CreateJob');
    }

    public function users(): Response
    {
        return Inertia::render('Admin/Users');
    }

    public function companies(): Response
    {
        return Inertia::render('Admin/Companies');
    }

    public function categories(): Response
    {
        return Inertia::render('Admin/Categories');
    }

    public function skills(): Response
    {
        return Inertia::render('Admin/Skills');
    }

    public function bulkNotifications(): Response
    {
        return Inertia::render('Admin/BulkNotifications');
    }

    public function permissions(): Response
    {
        return Inertia::render('Admin/Permissions');
    }
}
