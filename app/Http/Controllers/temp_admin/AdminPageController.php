<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPageController extends Controller
{
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
