<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\NotificationLog;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Exception\Messaging\RegistrationTokenNotRegistered;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Throwable;

class PushNotificationService
{
    /**
     * Send push notification to a user, record in in-app notifications and log audit trail.
     *
     * @param User|int $userOrId
     * @param string $title
     * @param string $body
     * @param array $data
     * @param string $type
     * @param string|null $actionUrl
     * @param int|null $senderId
     * @return array Result summary ['in_app' => bool, 'fcm_sent' => int, 'fcm_failed' => int]
     */
    public static function sendToUser(
        $userOrId,
        string $title,
        string $body,
        array $data = [],
        string $type = 'general',
        ?string $actionUrl = null,
        ?int $senderId = null
    ): array {
        $user = $userOrId instanceof User ? $userOrId : User::find($userOrId);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        // 1. Always create the in-app notification record so it appears in the app
        $inApp = null;
        try {
            $inApp = UserNotification::create([
                'user_id'    => $user->id,
                'type'       => $type,
                'title'      => $title,
                'body'       => $body,
                'action_url' => $actionUrl ?: '/my-applications',
                'data'       => $data,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to create in-app UserNotification: ' . $e->getMessage());
        }

        // 2. Fetch all active device FCM tokens for this user
        $fcmTokens = DB::table('fcm_tokens')
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->whereNotNull('token')
            ->get();

        $sentCount   = 0;
        $failedCount = 0;

        // If user has no active tokens, record in notification_logs as in-app only
        if ($fcmTokens->isEmpty()) {
            NotificationLog::create([
                'receiver_id'  => $user->id,
                'sender_id'    => $senderId,
                'type'         => $type,
                'channel'      => 'in_app',
                'title'        => $title,
                'message'      => $body,
                'data'         => $data,
                'status'       => 'sent',
                'sent_at'      => now(),
                'redirect_url' => $actionUrl,
            ]);

            return [
                'success'      => true,
                'in_app'       => (bool)$inApp,
                'fcm_sent'     => 0,
                'fcm_failed'   => 0,
                'tokens_count' => 0,
            ];
        }

        // 3. Dispatch FCM Push Notifications to all user device tokens
        $messaging = null;
        try {
            $messaging = app('firebase.messaging');
        } catch (Throwable $e) {
            Log::warning('Firebase messaging initialization failed: ' . $e->getMessage());
        }

        foreach ($fcmTokens as $tokenRecord) {
            $deviceToken = trim((string)$tokenRecord->token);
            if (empty($deviceToken)) {
                continue;
            }

            // Stringify data payload for FCM compatibility
            $fcmData = array_merge([
                'type'       => $type,
                'title'      => $title,
                'body'       => $body,
                'action_url' => (string)($actionUrl ?? ''),
            ], array_map(fn($v) => is_array($v) ? json_encode($v) : (string)$v, $data));

            if (!$messaging) {
                // Record failure due to messaging service unavailable
                NotificationLog::create([
                    'receiver_id'  => $user->id,
                    'sender_id'    => $senderId,
                    'type'         => $type,
                    'channel'      => 'fcm',
                    'token'        => $deviceToken,
                    'device_id'    => $tokenRecord->device_id,
                    'title'        => $title,
                    'message'      => $body,
                    'data'         => $data,
                    'status'       => 'failed',
                    'error'        => 'Firebase messaging service not configured',
                    'redirect_url' => $actionUrl,
                ]);
                $failedCount++;
                continue;
            }

            try {
                $cloudMessage = CloudMessage::withTarget('token', $deviceToken)
                    ->withNotification(Notification::create($title, $body))
                    ->withData($fcmData);

                $response = $messaging->send($cloudMessage);

                // Record successful delivery in notification_logs
                NotificationLog::create([
                    'receiver_id'      => $user->id,
                    'sender_id'        => $senderId,
                    'type'             => $type,
                    'channel'          => 'fcm',
                    'token'            => $deviceToken,
                    'device_id'        => $tokenRecord->device_id,
                    'title'            => $title,
                    'message'          => $body,
                    'data'             => $data,
                    'status'           => 'delivered',
                    'sent_at'          => now(),
                    'redirect_url'     => $actionUrl,
                    'response_payload' => ['fcm_response' => $response],
                ]);

                $sentCount++;

            } catch (RegistrationTokenNotRegistered|NotFound $e) {
                // Token is stale or invalid; soft delete from fcm_tokens
                DB::table('fcm_tokens')->where('id', $tokenRecord->id)->update(['deleted_at' => now()]);

                NotificationLog::create([
                    'receiver_id'  => $user->id,
                    'sender_id'    => $senderId,
                    'type'         => $type,
                    'channel'      => 'fcm',
                    'token'        => $deviceToken,
                    'device_id'    => $tokenRecord->device_id,
                    'title'        => $title,
                    'message'      => $body,
                    'data'         => $data,
                    'status'       => 'failed',
                    'error'        => 'Device token unregistered or expired: ' . $e->getMessage(),
                    'redirect_url' => $actionUrl,
                ]);

                $failedCount++;

            } catch (Throwable $e) {
                Log::warning("FCM send failed to user {$user->id}: " . $e->getMessage());

                NotificationLog::create([
                    'receiver_id'  => $user->id,
                    'sender_id'    => $senderId,
                    'type'         => $type,
                    'channel'      => 'fcm',
                    'token'        => $deviceToken,
                    'device_id'    => $tokenRecord->device_id,
                    'title'        => $title,
                    'message'      => $body,
                    'data'         => $data,
                    'status'       => 'failed',
                    'error'        => $e->getMessage(),
                    'redirect_url' => $actionUrl,
                ]);

                $failedCount++;
            }
        }

        return [
            'success'      => true,
            'in_app'       => (bool)$inApp,
            'fcm_sent'     => $sentCount,
            'fcm_failed'   => $failedCount,
            'tokens_count' => $fcmTokens->count(),
        ];
    }

    /**
     * Send push notification to multiple users.
     */
    public static function sendToMultipleUsers(
        array $userIds,
        string $title,
        string $body,
        array $data = [],
        string $type = 'general',
        ?string $actionUrl = null,
        ?int $senderId = null
    ): array {
        $totalSent = 0;
        $totalFailed = 0;

        foreach ($userIds as $uid) {
            $res = self::sendToUser($uid, $title, $body, $data, $type, $actionUrl, $senderId);
            $totalSent += $res['fcm_sent'] ?? 0;
            $totalFailed += $res['fcm_failed'] ?? 0;
        }

        return [
            'users_count'  => count($userIds),
            'total_sent'   => $totalSent,
            'total_failed' => $totalFailed,
        ];
    }

    /**
     * Trigger for Application Submitted event.
     */
    public static function notifyApplicationSubmitted(JobApplication $application): array
    {
        $candidate = $application->candidate ?? User::find($application->candidate_id);
        if (!$candidate) return ['success' => false];

        $job = $application->jobPost ?? JobPost::find($application->job_id);
        $jobTitle = $job?->title ?: 'your selected position';
        $companyName = $job?->company ?: 'the employer';

        return self::sendToUser(
            $candidate,
            "Application Submitted Successfully 🎉",
            "Your application for '{$jobTitle}' at {$companyName} has been received.",
            [
                'application_id' => $application->id,
                'job_id'         => $application->job_id,
                'status'         => $application->status,
                'ref'            => "app_{$application->id}_applied",
            ],
            'application',
            '/my-applications'
        );
    }

    /**
     * Trigger for Application Status Changed event.
     */
    public static function notifyApplicationStatusChange(JobApplication $application, string $newStatus): array
    {
        $candidate = $application->candidate ?? User::find($application->candidate_id);
        if (!$candidate) return ['success' => false];

        $job = $application->jobPost ?? JobPost::find($application->job_id);
        $jobTitle = $job?->title ?: 'your applied position';
        $companyName = $job?->company ?: 'the employer';

        $title = "Application Status Update";
        $body  = "Your application status for {$jobTitle} at {$companyName} was updated to {$newStatus}.";
        $type  = 'application';

        switch ($newStatus) {
            case 'shortlisted':
            case 'calling_approved':
            case 'offer_letter_generated':
                $type  = 'shortlisted';
                $title = "You've been Shortlisted! 🎉";
                $body  = "{$companyName} has shortlisted you for the {$jobTitle} role. Check your applications for next steps.";
                break;
            case 'interview_scheduled':
            case 'interview':
                $type  = 'interview';
                $title = "Interview Scheduled 📅";
                $body  = "An interview has been scheduled with {$companyName} for {$jobTitle}.";
                break;
            case 'viewed':
            case 'reviewed':
                $type  = 'application';
                $title = "Application Viewed 👀";
                $body  = "{$companyName} viewed your application for {$jobTitle}.";
                break;
            case 'hired':
                $type  = 'shortlisted';
                $title = "Congratulations! Hired 🏆";
                $body  = "Congratulations! You have been hired by {$companyName} for {$jobTitle}.";
                break;
            case 'rejected':
            case 'calling_rejected':
            case 'not_selected':
                $type  = 'application';
                $title = "Application Status Update";
                $body  = "{$companyName} reviewed your application for {$jobTitle} and decided to move forward with other candidates.";
                break;
        }

        return self::sendToUser(
            $candidate,
            $title,
            $body,
            [
                'application_id' => $application->id,
                'job_id'         => $application->job_id,
                'status'         => $newStatus,
                'ref'            => "app_{$application->id}_{$newStatus}",
            ],
            $type,
            '/my-applications'
        );
    }

    /**
     * Trigger for New Job Matching Candidate Profile.
     */
    public static function notifyJobMatch(User $user, JobPost $job): array
    {
        $salary = $job->min_salary ? " (₹" . number_format($job->min_salary) . "+)" : "";

        return self::sendToUser(
            $user,
            "New Job Match: {$job->title}",
            "{$job->company} is hiring in {$job->location}{$salary}. Apply before applications close!",
            [
                'job_id'   => $job->id,
                'job_uuid' => $job->uuid,
                'ref'      => "job_match_{$job->id}",
            ],
            'job_match',
            "/job-search?city=" . urlencode($job->location ?: '')
        );
    }
}
