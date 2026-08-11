<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user();

        $query = Task::query()
            ->with([
                'creator',
                'assignedMembers' => function ($q) use ($member) {
                    $q->select('members.id', 'members.name', 'members.email', 'members.phone')
                        ->where('assigned_to', $member->id)
                        ->withPivot(['uuid', 'assigned_by', 'start_date', 'end_date', 'is_transferred']);
                },
            ])
            ->whereHas('assignedMembers', function ($q) use ($member) {
                $q->where('assigned_to', $member->id);
            });

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $perPage = (int) $request->input('per_page', 10);
        $tasks = $query->latest()->paginate(max(1, min($perPage, 50)))->withQueryString();

        return response()->json([
            'success' => true,
            'tasks' => $tasks,
        ]);
    }

    public function show(Request $request, Task $task)
    {
        $member = $request->user();

        $assigned = TaskAssignment::query()
            ->where('task_id', $task->id)
            ->where('assigned_to', $member->id)
            ->exists();

        if (! $assigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $task->load(['creator', 'instances' => function ($q) use ($member) {
            $q->where('assigned_to', $member->id)->latest();
        }]);

        return response()->json([
            'success' => true,
            'task' => $task,
        ]);
    }

    public function notesIndex(Request $request, Task $task)
    {
        $member = $request->user();

        $assigned = TaskAssignment::query()
            ->where('task_id', $task->id)
            ->where('assigned_to', $member->id)
            ->exists();

        if (! $assigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $notes = TaskComment::with(['task', 'commenter', 'replies.commenter'])
            ->where('task_id', $task->id)
            ->whereNull('reply_note_id')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'notes' => $notes,
        ]);
    }

    public function notesStore(Request $request, Task $task)
    {
        $member = $request->user();

        $assigned = TaskAssignment::query()
            ->where('task_id', $task->id)
            ->where('assigned_to', $member->id)
            ->exists();

        if (! $assigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
            'reply_note_id' => ['nullable', 'exists:task_comments,id'],
        ]);

        if (! empty($validated['reply_note_id'])) {
            $parent = TaskComment::query()->where('id', $validated['reply_note_id'])->first();
            if (! $parent || (int) $parent->task_id !== (int) $task->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid reply note.',
                ], 422);
            }
        }

        $note = TaskComment::create([
            'uuid' => (string) Str::uuid(),
            'task_id' => $task->id,
            'reply_note_id' => $validated['reply_note_id'] ?? null,
            'commented_by' => $member->id,
            'comment' => $validated['note'],
        ]);

        return response()->json([
            'success' => true,
            'note' => $note->load(['commenter', 'parent']),
        ]);
    }

    public function notesDestroy(Request $request, TaskComment $note)
    {
        $member = $request->user();

        if ((int) $note->commented_by !== (int) $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note deleted.',
        ]);
    }
}
