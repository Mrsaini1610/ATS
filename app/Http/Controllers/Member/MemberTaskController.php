<?php

namespace App\Http\Controllers\Member;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Department;
use App\Models\Member;
use App\Models\Task;
use App\Models\TaskInstance;
use App\Models\TaskActivityLog;
use App\Models\TaskAssignment;
use App\Models\Designation;
use App\Models\TaskComment;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;
use App\Models\TaskDocument;
use App\Models\SuperAdminPasswordLog;
use App\Models\SuperAdmin;
use App\Models\WhatsappLog;
use App\Services\InteraktServices;
use Carbon\Carbon;
use App\Models\CheckInOut;
use function App\createMessagePayload;

class MemberTaskController extends Controller
{
    public function dashboard(Request $request)
    {
        $authUser = Auth::guard('member')->user();
        $taskQuery = Task::with([
            'creator',
            'assignedMembers' => function ($query) use ($authUser) {
                $query
                    ->withPivot(['uuid as task_assignment_uuid', 'assigned_by', 'start_date', 'end_date', 'is_transferred', 'assigned_by'])
                    ->where('assigned_to', $authUser->id);
            }
        ])
            ->whereHas('assignedMembers', function ($query) use ($authUser) {
                $query->where('assigned_to', $authUser->id);
            });
        $filteredTasks = clone $taskQuery;
        $filteredTasks = $filteredTasks
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->when($request->created_by, fn($q) => $q->where('created_by', $request->created_by))
            ->latest()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();
        $filteredTasks->getCollection()->transform(function ($task) {
            $assignedByUser = null;
            foreach ($task->assignedMembers as $member) {
                if ($member->pivot->is_transferred == 0) {
                    $assignedByUser = SuperAdmin::find($member->pivot->assigned_by);
                } else {
                    $assignedByUser = Member::find($member->pivot->assigned_by);
                }
                break;
            }
            $task->assigned_by_user = $assignedByUser;
            return $task;
        });
        $taskCounts = [
            'total' => $taskQuery->count(),
            'pending' => $taskQuery->where('status', 'pending')->count(),
            'in_progress' => $taskQuery->where('status', 'in_progress')->count(),
            'completed' => $taskQuery->where('status', 'completed')->count(),
            'overdue' => $taskQuery->where('end_date', '<', now())->where('status', '!=', 'completed')->count(),
        ];
        $members = Member::where('status', 1)
            ->where('id', '!=', $authUser->id)
            ->where(function ($query) use ($authUser) {
                foreach ($authUser->departments ?? [] as $deptId) {
                    $query->orWhereJsonContains('departments', (string) $deptId);
                }
            })
            ->get()
            ->map(function ($member) {
                $member->departments_data = Department::whereIn('id', $member->departments ?? [])->get();
                $member->designations_data = Designation::whereIn('id', $member->designation ?? [])->get();
                return $member;
            });

        return Inertia::render('Member/Task/List', [
            'tasks' => $filteredTasks,
            'task_counts' => $taskCounts,
            'filters' => $request->only(['search', 'status', 'created_by', 'per_page']),
            'members' => $members,
            'auth_user' => $authUser,
        ]);
    }


    public function userProfilePhotoRemove(Request $request)
    {
        $memberId = Auth::guard('member')->id();
        $member = Member::findOrFail($memberId);
        $member->update([
            'image' => null,
        ]);
        return redirect()->back()->with('success', 'Profile image removed successfully.');
    }

    public function taskList(Request $request)
    {
        $authUser = Auth::guard('member')->user();
        $perPage = $request->per_page ?? 10;
        $taskQuery = Task::with([
            'creator',
            'assignedMembers' => function ($query) use ($authUser) {
                $query
                    ->withPivot(['uuid as task_assignment_uuid', 'assigned_by', 'start_date', 'end_date', 'assigned_by', 'is_transferred'])
                    ->where('assigned_to', $authUser->id);
            }
        ])
            ->whereHas('assignedMembers', function ($query) use ($authUser) {
                $query->where('assigned_to', $authUser->id);
            });
        $tasks = $taskQuery
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->when($request->created_by, fn($q) => $q->where('created_by', $request->created_by))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
        $tasks->getCollection()->transform(function ($task) {
            $assignedByUser = null;
            foreach ($task->assignedMembers as $member) {
                if ($member->pivot->is_transferred == 0) {
                    $assignedByUser = SuperAdmin::find($member->pivot->assigned_by);
                } else {
                    $assignedByUser = Member::find($member->pivot->assigned_by);
                }
                break;
            }

            $task->assigned_by_user = $assignedByUser;
            return $task;
        });
        $taskInstances = TaskInstance::with(['assignee', 'task'])
            ->whereIn('task_id', $tasks->pluck('id'))
            ->where('assigned_to', $authUser->id)
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($perPage, ['*'], 'instances_page')
            ->withQueryString();

        return Inertia::render('Member/Task/TaskInstancesList', [
            'tasks' => $tasks,
            'taskInstances' => $taskInstances,
            'filters' => $request->only(['search', 'status', 'created_by', 'per_page']),
        ]);
    }

    public function notes(Request $request, $taskId = null)
    {
        $member = Auth::guard('member')->user();
        if ($request->isMethod('get')) {
            $taskId = $request->task;
            $notes = TaskComment::with(['task', 'commenter', 'replies.commenter'])
                ->when($taskId, fn($query) => $query->where('task_id', $taskId))
                ->whereNull('reply_note_id')
                ->orderBy('created_at', 'DESC')
                ->get();
            return response()->json([
                'notes' => $notes,
                'success' => true
            ]);
        }
        if ($request->isMethod('post')) {
            $request->validate([
                'task_id' => 'required|exists:tasks,id',
                'note' => 'required|string|max:2000',
                'reply_note_id' => 'nullable|exists:task_comments,id',
            ]);
            $task = Task::findOrFail($request->task_id);
            $isReply = !empty($request->reply_note_id);
            $message = $isReply
                ? "replied to a note on task: '{$task->title}'"
                : "added a note to task: '{$task->title}'";
            $note = TaskComment::create([
                'task_id' => $request->task_id,
                'reply_note_id' => $request->reply_note_id,
                'commented_by' => $member->id,
                'comment' => $request->note,
            ]);

            //Send Message
            $taskMembers = $task->assignedMembers;
            if (!empty($taskMembers)) {
                foreach ($taskMembers as $member) {
                    $phoneNumber = $member->phone;
                    $templateName = "task_note_added_message";
                    $languageCode = "en";
                    $bodyParameters = [
                        $member->name ?? '--',
                        $task->title ?? '--',
                        $note->comment ?? '--',
                        $task->created_at ? Carbon::parse($note->created_at)->format('Y-m-d') : '--',
                    ];
                    $buttonParameters = ["1" => ["/member/login"]];
                    $payload = createMessagePayload($phoneNumber, $templateName, $languageCode, null, $bodyParameters, $buttonParameters);
                    $int = new InteraktServices();
                    $resp = $int->sendMessage($payload);

                    if ($resp['status'] == true) {
                        $status = 'success';
                    } else {
                        $status = 'failed';
                    }
                    WhatsappLog::create([
                        'member_id' => $member->id,
                        'phone' => $phoneNumber,
                        'error' => $resp,
                        'error_message' => $resp['result']['message'],
                        'status' => $status
                    ]);
                }
            }

            TaskActivityLog::create([
                'uuid' => Str::uuid(),
                'task_id' => $request->task_id,
                'performed_by' => $member->id,
                'action' => $isReply ? 'replied_to_note' : 'created_note',
                'changes' => [
                    'task_title' => $task->title,
                    'note_id' => $note->id,
                    'is_reply' => $isReply,
                    'content_preview' => Str::limit($request->note, 100)
                ],
                'remarks' => "{$member->name} {$message}",

                'performed_at' => now()
            ]);
            return response()->json([
                'note' => $note->load(['commenter', 'parent']),
                'success' => true,
                'message' => $isReply ? 'Reply added successfully' : 'Note added successfully'
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Method not allowed'
        ], 405);
    }
    public function noteDestroy($noteId)
    {
        try {
            $member = Auth::guard('member')->user();
            $note = TaskComment::with(['task', 'commenter'])->findOrFail($noteId);
            if ($note->commented_by !== $member->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: You can only delete your own notes'
                ], 403);
            }
            $taskTitle = $note->task->title ?? 'Deleted Task';
            $commentPreview = Str::limit($note->comment, 50);
            $commenterName = optional($note->commenter)->name ?? 'Unknown User';
            $note->delete();
            TaskActivityLog::create([
                'uuid' => Str::uuid(),
                'task_id' => $note->task_id,
                'performed_by' => $member->id,
                'action' => 'deleted_note',
                'changes' => [
                    'task_title' => $taskTitle,
                    'original_commenter_id' => $note->commented_by,
                    'content_preview' => $commentPreview
                ],
                'remarks' => sprintf(
                    "%s deleted a note: '%s' by %s",
                    Auth::guard('member')->user()->name,
                    $commentPreview,
                    $commenterName
                ),
                'performed_at' => now()
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Note deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Note not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete note. Please try again.'
            ], 500);
        }
    }
    public function updateInstancesStatus(Request $request, $uuid)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,overdue'
        ]);
        $instance = TaskInstance::where('uuid', $uuid)->firstOrFail();
        $admin = Auth::guard('member')->user();
        $previousStatus = $instance->status;
        $updateData = ['status' => $request->status];
        $updateData['completed_at'] = $request->status == 'completed' ? now() : null;
        $instance->update($updateData);
        TaskActivityLog::create([
            'task_id' => $instance->task_id,
            'performed_by' => $admin->id,
            'action' => 'status_update',
            'changes' => [
                'from' => $previousStatus,
                'to' => $request->status,
            ],
            'remarks' => $this->generateStatusRemarks(
                performer: 'Admin',
                taskTitle: $instance->task->title,
                fromStatus: $previousStatus,
                toStatus: $request->status
            ),
            'performed_at' => now(),
        ]);
        return redirect()->back()->with([
            'success' => 'Status updated successfully',
            'updatedInstance' => $instance->fresh()
        ]);
    }
    private function getStatusDisplayText(string $status): string
    {
        return match ($status) {
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'overdue' => 'Overdue',
            default => ucfirst(str_replace('_', ' ', $status))
        };
    }
    private function generateStatusRemarks(
        string $performer,
        string $taskTitle,
        string $fromStatus,
        string $toStatus
    ): string {
        return sprintf(
            "%s changed the status of task '%s' from %s to %s",
            $performer,
            $taskTitle,
            $this->getStatusDisplayText($fromStatus),
            $this->getStatusDisplayText($toStatus)
        );
    }

    public function updateStatus(Request $request, $uuid)
    {
        $taskDetails = Task::where('uuid', $uuid)->first();
        $validated = $request->validate([
            'status' => 'required|in:running,closed',
        ]);

        $taskDetails->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] == 'closed' ? now() : null,
        ]);

        if ($taskDetails->assignedMembers) {
            foreach ($taskDetails->assignedMembers as $member) {
                $phoneNumber = $member->phone;
                if ($phoneNumber) {
                    $templateName = $request->status == 'closed' ? 'task_closed_message' : 'task_running_message';
                    $languageCode = "en";
                    $bodyParameters = [
                        $member->name ?? '--',
                        $taskDetails->title ?? '--',
                        $taskDetails->start_date ? Carbon::parse($taskDetails->start_date)->format('Y-m-d') : '--',
                        $taskDetails->end_date ? Carbon::parse($taskDetails->end_date)->format('Y-m-d') : '--',
                    ];
                    $buttonParameters = ["1" => ["/member/login"]];
                    $payload = createMessagePayload($phoneNumber, $templateName, $languageCode, null, $bodyParameters, $buttonParameters);

                    $int = new InteraktServices();
                    $resp = $int->sendMessage($payload);

                    if ($resp['status'] == true) {
                        $status = 'success';
                    } else {
                        $status = 'failed';
                    }
                    WhatsappLog::create([
                        'member_id' => $member->id,
                        'phone' => $phoneNumber,
                        'error' => $resp,
                        'error_message' => $resp['result']['message'],
                        'status' => $status
                    ]);
                }
            }
        }


        return back()->with('success', 'Task status updated successfully');
    }

    public function userProfile(Request $request)
    {
        return Inertia::render('Member/UserProfile');
    }

    public function userProfileUpdate(Request $request)
    {
        $user = Auth::guard('member')->user();
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:members,username,' . $user->id,
            'email' => 'required|email|unique:members,email,' . $user->id,
        ]);
        $user->update([
            'name' => $validatedData['name'],
            'username' => $validatedData['username'],
            'email' => $validatedData['email'],
        ]);
        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function userProfilePhotoUpdate(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);
        $auth = Auth::guard('member')->user();
        $member = Member::findOrFail($auth->id);

        if (!empty($member->image) && !filter_var($member->image, FILTER_VALIDATE_URL)) {
            if (Storage::disk('public')->exists($member->image)) {
                Storage::disk('public')->delete($member->image);
            }
        }

        $profilePhoto = $request->file('profile_photo');
        $filename = now()->format('Y_m_d_His_') . Str::random(16) . '.' . $profilePhoto->getClientOriginalExtension();
        $storedPath = $profilePhoto->storeAs('profile_image', $filename, 'public');

        $member->update([
            'image' => $storedPath,
        ]);


        return redirect()->back()->with('success', 'Profile image updated successfully.');
    }

    public function userProfilePasswordUpdate(Request $request)
    {
        $user = Auth::guard('member')->user();
        $superAdmin = Member::find($user->id);
        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($user) {
                    if (!Hash::check($value, $user->password)) {
                        $fail('The current password is incorrect.');
                    }
                }
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8),
                'different:current_password'
            ],
        ]);
        $superAdmin->update([
            'password' => Hash::make($request->password),
        ]);
        SuperAdminPasswordLog::create([
            'email'        => $user->email,
            'role'         => 'member',
            'new_password' => $request->password,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    public function uploadDocuments(Request $request)
    {
        $request->validate([
            'documents.*' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240',
            'task_id' => 'required|exists:tasks,id'
        ]);

        $uploadedDocuments = [];

        try {
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $filename = now()->format('Y_m_d_His_') . Str::random(12) . '.' . $file->getClientOriginalExtension();
                    $storedPath = $file->storeAs('task_documents', $filename, 'public');
                    $document = TaskDocument::create([
                        'uuid' => Str::uuid(),
                        'task_id' => $request->task_id,
                        'uploaded_by' => Auth::guard('member')->id(),
                        'link' => null,
                        'path' => $storedPath,
                        'type' => $file->getMimeType(),
                    ]);

                    $uploadedDocuments[] = [
                        'id' => $document->id,
                        'type' => $document->type,
                        'url' => $document->url,
                        'uploaded_at' => $document->created_at->diffForHumans()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Documents uploaded successfully',
                'documents' => $uploadedDocuments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
            ], 500);
        }
    }

    public function deleteDocument(Request $request, $id)
    {
        try {
            $document = TaskDocument::find($id);
            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }
            $document->deleted_at = now();
            $document->save();
            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
