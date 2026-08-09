<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\SuperAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $creatorId = SuperAdmin::query()->value('id');
        if (! $creatorId) {
            return response()->json([
                'success' => false,
                'message' => 'Super admin not configured.',
            ], 500);
        }

        $usernameBase = 'user' . preg_replace('/\D+/', '', $validated['phone']);
        $username = $this->makeUnique('members', 'username', substr($usernameBase, 0, 20));

        $slugBase = 'member-' . preg_replace('/\D+/', '', $validated['phone']);
        $slug = $this->makeUnique('members', 'slug', Str::slug($slugBase));

        $member = Member::create([
            'uuid' => (string) Str::uuid(),
            'created_by' => $creatorId,
            'name' => $validated['name'],
            'username' => $username,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'],
            'password' => Str::random(32),
            'status' => '1',
            'roles' => [3],
            'slug' => $slug,
        ]);

        $this->issueOtp($member);

        $payload = [
            'success' => true,
            'message' => 'Registered. OTP sent.',
            'member_id' => $member->id,
        ];

        if (config('app.debug')) {
            $payload['otp'] = $member->otp;
            $payload['otp_expire_at'] = optional($member->otp_expire)->toISOString();
        }

        return response()->json($payload);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $identifier = $validated['identifier'];

        $member = Member::query()
            ->where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->orWhere('username', $identifier)
            ->first();

        if (! $member || $member->status != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], 422);
        }

        if (! Hash::check($validated['password'], $member->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], 422);
        }

        $tokenName = $validated['device_name'] ?? ($request->userAgent() ?: 'api');
        $token = $member->createToken($tokenName)->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'member' => $member,
        ]);
    }

    // public function sendOtp(Request $request)
    // {
    //     $validated = $request->validate([
    //         'phone' => ['required', 'string', 'max:20'],
    //     ]);

    //     $member = Member::query()->where('phone', $validated['phone'])->first();

    //     if (! $member || $member->status != 1) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Account not found.',
    //         ], 404);
    //     }

    //     $this->issueOtp($member);

    //     $payload = [
    //         'success' => true,
    //         'message' => 'OTP sent.',
    //         'member' => $member,
    //     ];

    //     if (config('app.debug')) {
    //         $payload['otp'] = $member->otp;
    //         $payload['otp_expire_at'] = optional($member->otp_expire)->toISOString();
    //     }

    //     return response()->json($payload);
    // }

    // public function verifyOtp(Request $request)
    // {
    //     $validated = $request->validate([
    //         'phone' => ['required', 'string', 'max:20'],
    //         'otp' => ['required', 'string', 'max:10'],
    //         'device_name' => ['nullable', 'string', 'max:255'],
    //     ]);

    //     $member = Member::query()->where('phone', $validated['phone'])->first();

    //     if (! $member || $member->status != 1) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Account not found.',
    //         ], 404);
    //     }

    //     if (! $member->otp || ! $member->otp_expire || $member->otp_expire->isPast()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'OTP expired.',
    //         ], 422);
    //     }

    //     if ((string) $member->otp !== (string) $validated['otp']) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Invalid OTP.',
    //         ], 422);
    //     }

    //     $member->forceFill([
    //         'otp' => null,
    //         'otp_expire' => null,
    //         'phone_verify_at' => now(),
    //     ])->save();

    //     $tokenName = $validated['device_name'] ?? ($request->userAgent() ?: 'api');
    //     $token = $member->createToken($tokenName)->plainTextToken;

    //     return response()->json([
    //         'success' => true,
    //         'token' => $token,
    //         'member' => $member,
    //     ]);
    // }


    public function sendOtp(Request $request)
{
    $validated = $request->validate([
        'phone' => ['required', 'string', 'max:20'],
    ]);

    // Find all active members with this phone number
    $members = Member::query()
        ->where('phone', $validated['phone'])
        ->where('status', 1)
        ->get();

    if ($members->isEmpty()) {
        return response()->json([
            'success' => false,
            'message' => 'Account not found.',
        ], 404);
    }

    // Issue OTP to all active members with this phone number
    foreach ($members as $member) {
        $this->issueOtp($member);
    }

    // Return the first member's info (or you can return a generic success message)
    $firstMember = $members->first();

    $payload = [
        'success' => true,
        'message' => 'OTP sent to all associated accounts.',
        'member_count' => $members->count(),
        'member' => $firstMember, // You might want to hide this if multiple members exist
    ];

    if (config('app.debug')) {
        $payload['otp'] = $firstMember->otp;
        $payload['otp_expire_at'] = optional($firstMember->otp_expire)->toISOString();
        $payload['all_otps'] = $members->map(function($member) {
            return [
                'id' => $member->id,
                'otp' => $member->otp,
                'otp_expire' => optional($member->otp_expire)->toISOString()
            ];
        });
    }

    return response()->json($payload);
}

public function verifyOtp(Request $request)
{
    $validated = $request->validate([
        'phone' => ['required', 'string', 'max:20'],
        'otp' => ['required', 'string', 'max:10'],
        'device_name' => ['nullable', 'string', 'max:255'],
    ]);

    // Find all members with this phone number that have matching OTP
    $members = Member::query()
        ->where('phone', $validated['phone'])
        ->where('status', 1)
        ->where('otp', $validated['otp'])
        ->where('otp_expire', '>', now())
        ->get();

    if ($members->isEmpty()) {
        // Check if any member exists but OTP is expired or invalid
        $hasActiveMember = Member::query()
            ->where('phone', $validated['phone'])
            ->where('status', 1)
            ->exists();

        if (!$hasActiveMember) {
            return response()->json([
                'success' => false,
                'message' => 'Account not found.',
            ], 404);
        }

        // Check if OTP expired for any member
        $hasExpiredOtp = Member::query()
            ->where('phone', $validated['phone'])
            ->where('status', 1)
            ->whereNotNull('otp')
            ->where('otp_expire', '<=', now())
            ->exists();

        if ($hasExpiredOtp) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired.',
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid OTP.',
        ], 422);
    }

    // Handle multiple members with the same valid OTP
    $verifiedMembers = [];
    $tokens = [];

    foreach ($members as $member) {
        // Clear OTP for each verified member
        $member->forceFill([
            'otp' => null,
            'otp_expire' => null,
            'phone_verify_at' => now(),
        ])->save();

        // Generate token for each member
        $tokenName = $validated['device_name'] ?? ($request->userAgent() ?: 'api');
        $token = $member->createToken($tokenName . '_' . $member->id)->plainTextToken;

        $verifiedMembers[] = $member;
        $tokens[] = [
            'member_id' => $member->id,
            'token' => $token,
        ];
    }

    // If only one member, return single token for backward compatibility
    if ($members->count() === 1) {
        return response()->json([
            'success' => true,
            'token' => $tokens[0]['token'],
            'member' => $members->first(),
        ]);
    }

    // If multiple members, return multiple tokens
    return response()->json([
        'success' => true,
        'message' => 'Multiple accounts verified.',
        'tokens' => $tokens,
        'members' => $verifiedMembers,
        'member_count' => $members->count(),
    ]);
}
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'member' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out.',
        ]);
    }

    private function issueOtp(Member $member): void
    {
        $member->forceFill([
            'otp' => (string) random_int(100000, 999999),
            'otp_expire' => now()->addMinutes(5),
        ])->save();
    }

    private function makeUnique(string $table, string $column, string $base): string
    {
        $value = $base;
        $i = 1;

        while (\Illuminate\Support\Facades\DB::table($table)->where($column, $value)->exists()) {
            $suffix = (string) $i;
            $value = substr($base, 0, max(0, 255 - strlen($suffix) - 1)) . '-' . $suffix;
            $i++;
        }

        return $value;
    }
}

