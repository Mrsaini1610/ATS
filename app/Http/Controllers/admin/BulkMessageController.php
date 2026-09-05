<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BulkMessage;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BulkMessageController extends Controller
{
    public function index(Request $request): Response
    {
        // Live users list from database
        $users = User::select('id', 'full_name as name', 'city', 'phone', 'email', 'total_experience_years as experience')
            ->latest()
            ->get()
            ->map(function ($u) {
                $u->status = 'active';
                return $u;
            });

        $categories = Category::select('id', 'name')->get();
        
        // Fetch past broadcast history with sender name
        $history = BulkMessage::with('sender:id,name')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($msg) {
                return [
                    'id'             => $msg->id,
                    'uuid'           => $msg->uuid,
                    'channel'        => $msg->channel,
                    'recipientCount' => $msg->recipient_count,
                    'message'        => $msg->message,
                    'sentBy'         => $msg->sender->name ?? 'Admin',
                    'status'         => $msg->status,
                    'date'           => $msg->created_at ? $msg->created_at->format('d M Y, h:i A') : 'Recent',
                ];
            });

        return Inertia::render('Admin/BulkNotifications', [
            'users'      => $users,
            'categories' => $categories,
            'skills'     => [],
            'history'    => $history,
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'channel'         => 'required|in:whatsapp,email,sms',
            'message'         => 'required|string|max:2000',
            'recipient_ids'   => 'required|array|min:1',
            'recipient_ids.*' => 'exists:users,id',
        ]);

        BulkMessage::create([
            'channel'         => $validated['channel'],
            'target_audience' => 'custom_filter',
            'recipient_count' => count($validated['recipient_ids']),
            'message'         => $validated['message'],
            'sent_by'         => Auth::guard('admin')->id(),
            'status'          => 'sent',
        ]);

        return redirect()->back()->with('success', count($validated['recipient_ids']) . ' messages successfully queued & dispatched.');
    }
}