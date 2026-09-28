<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display candidate notifications list.
     */
    public function index(Request $request)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return redirect()->route('login');
        }

        // Auto-sync dynamic notifications for candidate
        $this->syncCandidateNotifications($user);

        $notifications = UserNotification::where('user_id', $user->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($n) {
                return [
                    'id'          => $n->uuid,
                    'uuid'        => $n->uuid,
                    'type'        => $n->type,
                    'title'       => $n->title,
                    'body'        => $n->body,
                    'time'        => $n->created_at ? $n->created_at->diffForHumans() : 'Just now',
                    'created_at'  => $n->created_at ? $n->created_at->toISOString() : null,
                    'read'        => !is_null($n->read_at),
                    'read_at'     => $n->read_at ? $n->read_at->toISOString() : null,
                    'action_url'  => $n->action_url ?: '/my-applications',
                    'data'        => $n->data,
                ];
            });

        $unreadCount = $notifications->where('read', false)->count();

        $counts = [
            'all'          => $notifications->count(),
            'unread'       => $unreadCount,
            'jobs'         => $notifications->filter(fn($n) => in_array($n['type'], ['job_match', 'saved_alert']))->count(),
            'applications' => $notifications->filter(fn($n) => in_array($n['type'], ['application', 'shortlisted', 'interview', 'message']))->count(),
            'tips'         => $notifications->filter(fn($n) => $n['type'] === 'tip')->count(),
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'notifications' => $notifications,
                'unread_count'  => $unreadCount,
                'counts'        => $counts,
            ]);
        }

        return Inertia::render('Candidate/Notifications', [
            'initialNotifications' => $notifications,
            'initialUnreadCount'   => $unreadCount,
            'initialCounts'        => $counts,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, $id)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $notification = UserNotification::where('user_id', $user->id)
            ->where(function ($q) use ($id) {
                $q->where('uuid', $id)->orWhere('id', $id);
            })
            ->first();

        if ($notification && is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        UserNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $notification = UserNotification::where('user_id', $user->id)
            ->where(function ($q) use ($id) {
                $q->where('uuid', $id)->orWhere('id', $id);
            })
            ->first();

        if ($notification) {
            $notification->delete();
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Notification removed.');
    }

    /**
     * Clear all notifications for current candidate.
     */
    public function clearAll(Request $request)
    {
        $user = Auth::guard('web')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        UserNotification::where('user_id', $user->id)->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'All notifications cleared.');
    }

    /**
     * Automatically sync / populate dynamic notifications from actual user records.
     */
    protected function syncCandidateNotifications($user): void
    {
        // 1. Applications updates
        $applications = JobApplication::with(['jobPost'])
            ->where('candidate_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        foreach ($applications as $app) {
            $jobTitle = $app->jobPost?->title ?: 'your applied position';
            $companyName = $app->jobPost?->company ?: 'the employer';
            $refKey = "app_{$app->id}_{$app->status}";

            // Check if we already created this notification
            $exists = UserNotification::where('user_id', $user->id)
                ->where('data->ref', $refKey)
                ->exists();

            if (!$exists) {
                $type = 'application';
                $title = "Application Submitted Successfully";
                $body = "Your application for '{$jobTitle}' at {$companyName} has been submitted.";

                if (in_array($app->status, ['shortlisted', 'calling_approved', 'offer_letter_generated'])) {
                    $type = 'shortlisted';
                    $title = "You've been Shortlisted! 🎉";
                    $body = "{$companyName} has shortlisted you for the {$jobTitle} role. Check your applications for next steps.";
                } elseif (in_array($app->status, ['interview_scheduled', 'interview'])) {
                    $type = 'interview';
                    $title = "Interview Scheduled 📅";
                    $body = "An interview has been scheduled with {$companyName} for {$jobTitle}.";
                } elseif (in_array($app->status, ['viewed', 'reviewed'])) {
                    $type = 'application';
                    $title = "Application Viewed 👀";
                    $body = "{$companyName} viewed your application for {$jobTitle}.";
                } elseif (in_array($app->status, ['hired'])) {
                    $type = 'shortlisted';
                    $title = "Congratulations! Hired 🏆";
                    $body = "Congratulations! You have been marked as hired by {$companyName} for {$jobTitle}.";
                } elseif (in_array($app->status, ['rejected', 'calling_rejected', 'not_selected'])) {
                    $type = 'application';
                    $title = "Application Status Update";
                    $body = "{$companyName} reviewed your application for {$jobTitle} and decided to move forward with other candidates.";
                }

                UserNotification::create([
                    'user_id'    => $user->id,
                    'type'       => $type,
                    'title'      => $title,
                    'body'       => $body,
                    'action_url' => '/my-applications',
                    'data'       => ['ref' => $refKey, 'application_id' => $app->id, 'job_id' => $app->job_id],
                    'created_at' => $app->updated_at ?: now(),
                ]);
            }
        }

        // 2. Profile completion tip (if profile has incomplete fields)
        if (!$user->isProfileComplete()) {
            $profileRef = "profile_tip_" . $user->id;
            $exists = UserNotification::where('user_id', $user->id)
                ->where('data->ref', $profileRef)
                ->exists();

            if (!$exists) {
                UserNotification::create([
                    'user_id'    => $user->id,
                    'type'       => 'tip',
                    'title'      => 'Profile Tip: Complete Your Profile',
                    'body'       => 'Candidates with a complete work history, verified city, and resume receive 3x more recruiter interview calls.',
                    'action_url' => '/profile',
                    'data'       => ['ref' => $profileRef],
                ]);
            }
        }

        // 3. Matched jobs in user city or category
        $matchedJobs = JobPost::whereIn('status', ['active', 'approved'])
            ->when($user->city, fn($q) => $q->where('location', 'like', "%{$user->city}%"))
            ->latest()
            ->take(2)
            ->get();

        if ($matchedJobs->isEmpty()) {
            $matchedJobs = JobPost::whereIn('status', ['active', 'approved'])
                ->latest()
                ->take(2)
                ->get();
        }

        foreach ($matchedJobs as $job) {
            $jobRef = "job_match_{$job->id}";
            $exists = UserNotification::where('user_id', $user->id)
                ->where('data->ref', $jobRef)
                ->exists();

            if (!$exists) {
                $salary = $job->min_salary ? " (₹" . number_format($job->min_salary) . "+)" : "";
                UserNotification::create([
                    'user_id'    => $user->id,
                    'type'       => 'job_match',
                    'title'      => "New Job Match: {$job->title}",
                    'body'       => "{$job->company} is hiring in {$job->location}{$salary}. Apply before applications close!",
                    'action_url' => "/job-search?city=" . urlencode($job->location ?: ''),
                    'data'       => ['ref' => $jobRef, 'job_id' => $job->id],
                ]);
            }
        }

        // 4. Welcome notification if candidate has no notifications yet
        if (UserNotification::where('user_id', $user->id)->count() === 0) {
            UserNotification::create([
                'user_id'    => $user->id,
                'type'       => 'system',
                'title'      => 'Welcome to ATS.com! 🚀',
                'body'       => 'Discover verified employers across India with 100% direct hiring and zero consultancy fees. Start exploring matching jobs today.',
                'action_url' => '/job-search',
                'data'       => ['ref' => "welcome_{$user->id}"],
            ]);
        }
    }
}
