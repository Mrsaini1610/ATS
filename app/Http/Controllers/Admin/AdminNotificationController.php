<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class AdminNotificationController extends Controller
{
    public function index()
    {
        $adminId = Auth::guard('admin')->id();
        $notifications = AdminNotification::query()
            ->where('admin_id', $adminId)
            ->latest()
            ->take(100)
            ->get()
            ->map(fn (AdminNotification $notification) => $this->format($notification));

        if (request()->expectsJson()) {
            return response()->json([
                'data' => $notifications,
                'unread_count' => $notifications->where('read', false)->count(),
            ]);
        }

        return Inertia::render('Admin/AdminNotifications', ['notifications' => $notifications]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'admin_id' => ['nullable', 'exists:admins,id'],
            'type' => ['required', Rule::in(['job', 'application', 'task', 'interview', 'user', 'alert'])],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'data' => ['nullable', 'array'],
        ]);

        $admin = Auth::guard('admin')->user();
        if (!$admin->isSuperAdmin()) {
            $validated['admin_id'] = $admin->id;
        } elseif (!$validated['admin_id']) {
            $validated['admin_id'] = $admin->id;
        }

        $notification = AdminNotification::create($validated);

        return $this->respond($request, $this->format($notification), 'Notification created.');
    }

    public function markRead(Request $request, AdminNotification $notification)
    {
        $this->ensureOwner($notification);
        $notification->update(['read_at' => now()]);

        return $this->respond($request, $this->format($notification), 'Notification marked as read.');
    }

    public function markAllRead(Request $request)
    {
        AdminNotification::where('admin_id', Auth::guard('admin')->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->respond($request, null, 'All notifications marked as read.');
    }

    public function destroy(Request $request, AdminNotification $notification)
    {
        $this->ensureOwner($notification);
        $notification->delete();

        return $this->respond($request, null, 'Notification deleted.');
    }

    private function ensureOwner(AdminNotification $notification): void
    {
        abort_unless($notification->admin_id === Auth::guard('admin')->id(), Response::HTTP_NOT_FOUND);
    }

    private function format(AdminNotification $notification): array
    {
        return [
            'id' => $notification->uuid,
            'type' => $notification->type,
            'title' => $notification->title,
            'body' => $notification->body,
            'data' => $notification->data ?? [],
            'read' => $notification->read_at !== null,
            'time' => optional($notification->created_at)->toIso8601String(),
        ];
    }

    private function respond(Request $request, mixed $data, string $message)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'data' => $data,
            ]);
        }

        return back()->with('success', $message);
    }
}
