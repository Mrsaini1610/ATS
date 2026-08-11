<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
     public function index()
    {
        $candidate = Auth::guard('web')->user();

        $applications = JobApplication::with('job')
            ->where('candidate_id', $candidate->id)
            ->latest()
            ->get();
        $savedJobs = SavedJob::with('job')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();
            
        return Inertia::render('Candidate/Profile/Index', [
            'candidate' => $candidate,
            'applications' => $applications,
             'savedJobs' => $savedJobs,
        ]);
    }

    public function edit()
    {
        return Inertia::render('Candidate/Profile/Edit', [
            'candidate' => Auth::guard('web')->user(),
        ]);
    }

    public function update(Request $request)
    {
        $candidate = Auth::guard('web')->user();

        $data = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|max:20',
            'dob' => 'nullable|date',
            'city' => 'nullable|max:255',
            'job_title' => 'nullable|max:255',
            'experience' => 'nullable|max:255',
            'education' => 'nullable|max:255',
        ]);

        $candidate->update($data);

        return back()->with('success', 'Profile updated.');
    }

    public function show($id)
    {
        $application = JobApplication::with('job')
                        ->findOrFail($id);

        return Inertia::render(
            'Candidate/Profile/ApplicationDetails',
            [
                'application' => $application,
            ]
        );
    }

    public function saveJob(Job $job)
    {
        SavedJob::firstOrCreate([
            'user_id' => auth()->id(),
            'job_id' => $job->id,
        ]);

        return back();
    }
    public function unsaveJob(Job $job)
    {
        SavedJob::where('user_id', auth()->id())
            ->where('job_id', $job->id)
            ->delete();

        return back();
    }
   
}
