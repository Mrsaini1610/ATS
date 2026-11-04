<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\UserNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationLiveSyncController extends Controller
{
    /**
     * Real-time notification synchronization for Web & App clients.
     * Polls new unread notifications without requiring page refresh.
     */
    public function sync(Request $request): JsonResponse
    {
        $since = $request->input('since');
        $notifications = [];
        $unreadCount = 0;
        $userType = 'guest';

        if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();
            $userType = 'admin';

            $query = AdminNotification::where('admin_id', $admin->id)
                ->whereNull('read_at')
                ->latest();

            if (!empty($since)) {
                try {
                    $query->where('created_at', '>', Carbon::parse($since));
                } catch (\Throwable $e) {
                    $query->where('created_at', '>=', now()->subSeconds(60));
                }
            } else {
                $query->where('created_at', '>=', now()->subSeconds(45));
            }

            $items = $query->limit(5)->get();
            $unreadCount = AdminNotification::where('admin_id', $admin->id)->whereNull('read_at')->count();

            foreach ($items as $item) {
                $actionUrl = $item->data['action_url'] ?? url('/admin');
                $notifications[] = [
                    'id'         => $item->uuid ?: (string) $item->id,
                    'title'      => $item->title,
                    'body'       => $item->body,
                    'type'       => $item->type ?? 'info',
                    'action_url' => $actionUrl,
                    'created_at' => $item->created_at ? $item->created_at->toIso8601String() : now()->toIso8601String(),
                    'time_ago'   => $item->created_at ? $item->created_at->diffForHumans() : 'Just now',
                ];
            }
        } elseif (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            $userType = 'candidate';

            $query = UserNotification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->latest();

            if (!empty($since)) {
                try {
                    $query->where('created_at', '>', Carbon::parse($since));
                } catch (\Throwable $e) {
                    $query->where('created_at', '>=', now()->subSeconds(60));
                }
            } else {
                $query->where('created_at', '>=', now()->subSeconds(45));
            }

            $items = $query->limit(5)->get();
            $unreadCount = UserNotification::where('user_id', $user->id)->whereNull('read_at')->count();

            foreach ($items as $item) {
                $actionUrl = $item->action_url ?: ($item->data['action_url'] ?? url('/my-applications'));
                $notifications[] = [
                    'id'         => $item->uuid ?: (string) $item->id,
                    'title'      => $item->title,
                    'body'       => $item->body,
                    'type'       => $item->type ?? 'info',
                    'action_url' => $actionUrl,
                    'created_at' => $item->created_at ? $item->created_at->toIso8601String() : now()->toIso8601String(),
                    'time_ago'   => $item->created_at ? $item->created_at->diffForHumans() : 'Just now',
                ];
            }
        }

        return response()->json([
            'success'       => true,
            'user_type'     => $userType,
            'server_time'   => now()->toIso8601String(),
            'unread_count'  => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();
            AdminNotification::where('admin_id', $admin->id)
                ->where(function ($q) use ($id) {
                    $q->where('uuid', $id)->orWhere('id', $id);
                })
                ->update(['read_at' => now()]);
        } elseif (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            UserNotification::where('user_id', $user->id)
                ->where(function ($q) use ($id) {
                    $q->where('uuid', $id)->orWhere('id', $id);
                })
                ->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }
}

