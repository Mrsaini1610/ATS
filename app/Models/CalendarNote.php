<?php

namespace App\Http\Controllers\Admin;

class BulkMessageController extends Controller
{
    public function index(Request $request): Response
    {
        // Yahan table columns ke mutabiq select fields update karein
        $users = User::select('id', 'first_name as name', 'city', 'phone', 'email', 'experience', 'status')
            ->latest()
            ->get();

        // Agar aapke table me 'name' single column hi hai, toh check karein ki table ka naam 'users' hi hai ya kuch aur.
        // Agar table me columns 'name', 'email', 'phone' hain hi nahi, toh pehle migration check karein.