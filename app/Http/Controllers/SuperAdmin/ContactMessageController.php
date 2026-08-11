<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->string('status')->toString();

        $messages = ContactMessage::query()
            ->when($status === 'unread', fn ($q) => $q->where('is_read', false))
            ->when($status === 'read', fn ($q) => $q->where('is_read', true))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $counts = [
            'total' => ContactMessage::count(),
            'unread' => ContactMessage::where('is_read', false)->count(),
            'read' => ContactMessage::where('is_read', true)->count(),
        ];

        return Inertia::render('SuperAdmin/ContactMessages/Index', [
            'messages' => $messages,
            'filters' => [
                'status' => $status,
            ],
            'counts' => $counts,
        ]);
    }

    public function toggleRead(ContactMessage $message)
    {
        $message->update(['is_read' => !$message->is_read]);

        return back()->with('success', 'Status updated successfully.');
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return back()->with('success', 'Message deleted successfully.');
    }
}

