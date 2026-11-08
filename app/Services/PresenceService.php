<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class PresenceService
{
    /**
     * Threshold in minutes after which an inactive connection is marked offline.
     */
    public const ONLINE_THRESHOLD_MINUTES = 3;

    /**
     * WhatsApp-style "last seen" relative formatting.
     *
     * Examples:
     * - "last seen just now"
     * - "last seen 5m ago"
     * - "last seen today at 04:30 PM"
     * - "last seen yesterday at 11:15 AM"
     * - "last seen 14 Oct at 02:45 PM"
     * - "last seen 14 Oct 2025"
     */
    public static function formatLastSeen(?CarbonInterface $datetime): string
    {
        if (!$datetime) {
            return 'Never active';
        }

        $now = Carbon::now();
        $diffSeconds = $datetime->diffInSeconds($now);

        if ($diffSeconds < 60) {
            return 'last seen just now';
        }

        $diffMinutes = $datetime->diffInMinutes($now);
        if ($diffMinutes < 60) {
            return "last seen {$diffMinutes}m ago";
        }

        if ($datetime->isToday()) {
            return 'last seen today at ' . $datetime->format('h:i A');
        }

        if ($datetime->isYesterday()) {
            return 'last seen yesterday at ' . $datetime->format('h:i A');
        }

        if ($datetime->isCurrentYear()) {
            return 'last seen ' . $datetime->format('d M \a\t h:i A');
        }

        return 'last seen ' . $datetime->format('d M Y');
    }

    /**
     * Get real-time WhatsApp-style presence for a Candidate (User).
     * Distinguishes between Web and App presence.
     */
    public static function getUserPresence(?User $user): array
    {
        if (!$user) {
            return [
                'is_online'        => false,
                'status_text'      => 'Offline',
                'badge'            => 'offline',
                'web_is_online'    => false,
                'web_last_seen'    => 'Never active',
                'web_last_active'  => null,
                'app_is_online'    => false,
                'app_last_seen'    => 'Never active',
                'app_last_active'  => null,
                'last_active_raw'  => null,
                'primary_platform' => 'web',
            ];
        }

        $threshold = Carbon::now()->subMinutes(self::ONLINE_THRESHOLD_MINUTES);

        // Web Online Check (active within threshold)
        $webOnline = (bool) $user->web_is_online && $user->web_last_active && $user->web_last_active >= $threshold;

        // App Online Check (active within threshold)
        $appOnline = (bool) $user->app_is_online && $user->app_last_active && $user->app_last_active >= $threshold;

        // Overall Online State
        $isOnline = $webOnline || $appOnline;

        // Determine human-readable WhatsApp status text
        if ($webOnline && $appOnline) {
            $statusText = 'Online (Web & App)';
            $badge = 'online_both';
            $primaryPlatform = 'both';
        } elseif ($appOnline) {
            $statusText = 'Online on App';
            $badge = 'online_app';
            $primaryPlatform = 'app';
        } elseif ($webOnline) {
            $statusText = 'Online on Web';
            $badge = 'online_web';
            $primaryPlatform = 'web';
        } else {
            // Both are offline: determine latest between web_last_active and app_last_active
            $webActive = $user->web_last_active;
            $appActive = $user->app_last_active;
            $generalActive = $user->last_active;

            $latest = $webActive;
            $platformTag = 'Web';

            if ($appActive && (!$latest || $appActive > $latest)) {
                $latest = $appActive;
                $platformTag = 'App';
            }

            if (!$latest && $generalActive) {
                $latest = $generalActive;
                $platformTag = ($user->registered_from === 'app') ? 'App' : 'Web';
            }

            if ($latest) {
                $statusText = self::formatLastSeen($latest) . " ({$platformTag})";
                $primaryPlatform = strtolower($platformTag);
            } else {
                $statusText = 'Never active';
                $primaryPlatform = $user->platform ?? 'web';
            }

            $badge = 'offline';
        }

        $latestTimestamp = $user->last_active ?: ($user->web_last_active ?: $user->app_last_active);

        return [
            'is_online'        => $isOnline,
            'status_text'      => $statusText,
            'badge'            => $badge,
            'web_is_online'    => $webOnline,
            'web_last_seen'    => $webOnline ? 'Online' : self::formatLastSeen($user->web_last_active),
            'web_last_active'  => $user->web_last_active ? $user->web_last_active->toIso8601String() : null,
            'app_is_online'    => $appOnline,
            'app_last_seen'    => $appOnline ? 'Online' : self::formatLastSeen($user->app_last_active),
            'app_last_active'  => $user->app_last_active ? $user->app_last_active->toIso8601String() : null,
            'last_active_raw'  => $latestTimestamp ? $latestTimestamp->toIso8601String() : null,
            'primary_platform' => $primaryPlatform,
        ];
    }

    /**
     * Get real-time WhatsApp-style presence for an Admin / Staff member.
     */
    public static function getAdminPresence(?Admin $admin): array
    {
        if (!$admin) {
            return [
                'is_online'       => false,
                'status_text'     => 'Offline',
                'badge'           => 'offline',
                'web_is_online'   => false,
                'last_seen'       => 'Never active',
                'last_active_raw' => null,
            ];
        }

        $threshold = Carbon::now()->subMinutes(self::ONLINE_THRESHOLD_MINUTES);

        $lastActive = $admin->last_active ?: $admin->web_last_active;
        $isOnline = (bool) $admin->is_online && $lastActive && $lastActive >= $threshold;

        if ($isOnline) {
            $statusText = 'Online';
            $badge = 'online';
        } else {
            $statusText = self::formatLastSeen($lastActive);
            $badge = 'offline';
        }

        return [
            'is_online'       => $isOnline,
            'status_text'     => $statusText,
            'badge'           => $badge,
            'web_is_online'   => $isOnline,
            'last_seen'       => $statusText,
            'last_active_raw' => $lastActive ? $lastActive->toIso8601String() : null,
        ];
    }
}

