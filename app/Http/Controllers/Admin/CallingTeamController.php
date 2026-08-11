<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendAccountCreationEmail;
use App\Models\EmailLog;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CallingTeamController extends Controller
{
    public function index(Request $request)
    {
        $adminId = Auth::guard('admin')->id();
        $perPage = max(1, min((int) $request->input('per_page', 10), 50));

        $query = Member::query()
            ->where('assigned_admin_id', $adminId)
            ->where('is_calling_team', true)
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return Inertia::render('Admin/CallingTeam/Index', [
            'members' => $query->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
            ],
            'email' => [
                'required',
                'email',
            ],
            'status' => ['nullable', 'in:0,1'],
            'dob' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);
        $temporaryPassword = $this->generateTemporaryPassword();

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('member-images', 'public');
        }

        $member = Member::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($temporaryPassword),
            'must_change_password' => true,
            'status' => (int) ($validated['status'] ?? 1),
            'roles' => [],
            'is_calling_team' => true,
            'created_by' => $admin->id,
            'assigned_admin_id' => $admin->id,
            'username' => $this->generateUsername($validated['name']),
            'slug' => Str::slug($validated['name'] . '-' . Str::random(4)),
            'dob' => $validated['dob'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'image' => $imagePath,
        ]);

        if (!empty($validated['email'])) {
            $loginUrl = route('callingteam.login');

            SendAccountCreationEmail::dispatchSync(
                $validated['email'],
                $validated['name'],
                $member->username,
                $temporaryPassword,
                '',
                '',
                $loginUrl,
                'calling_team'
            );

            EmailLog::create([
                'user_id' => $admin->id,
                'subject' => 'Account Creation Notification',
                'to' => $validated['email'],
                'from' => config('mail.from.address'),
                'body_html' => 'Calling team account created for ' . $validated['name']
                    . ' with username: ' . $member->username
                    . ' and login URL: ' . $loginUrl,
                'status' => 'sent',
                'sent_at' => now(),
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
            ]);
        }

        return redirect()->back()->with('success', 'Calling team member created successfully.');
    }

    public function updateStatus(Request $request, Member $member)
    {
        abort_unless(
            (int) $member->assigned_admin_id === (int) Auth::guard('admin')->id() && $member->is_calling_team,
            403
        );

        $request->validate([
            'status' => 'required|boolean',
        ]);

        $member->update([
            'status' => (int) $request->boolean('status'),
        ]);

        return redirect()->back()->with('success', 'Calling team member status updated successfully.');
    }

    public function membersList()
    {
        $members = Member::query()
            ->where('assigned_admin_id', Auth::guard('admin')->id())
            ->where('is_calling_team', true)
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'username']);

        return response()->json([
            'success' => true,
            'data' => $members,
        ]);
    }

    private function generateUsername(string $name): string
    {
        $cleanName = Str::lower(preg_replace('/[^a-z0-9]/', '', $name));
        $base = $cleanName ?: 'callingteam';
        $counter = 0;

        do {
            $username = $base . ($counter > 0 ? $counter : '');
            $exists = Member::query()
                ->where('username', $username)
                ->whereNull('deleted_at')
                ->exists();
            $counter++;
        } while ($exists);

        return $username;
    }

    private function generateTemporaryPassword(): string
    {
        return Str::random(12);
    }
}
