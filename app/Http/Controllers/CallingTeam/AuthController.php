<?php

namespace App\Http\Controllers\CallingTeam;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login()
    {
        if (Auth::guard('callingteam')->check()) {
            return redirect()->route('callingteam.dashboard');
        }

        return Inertia::render('CallingTeam/Auth/Login');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ]);

        $field = $this->determineLoginField($request->string('identifier')->toString());

        $member = Member::query()
            ->where($field, $request->string('identifier')->toString())
            ->where('is_calling_team', true)
            ->first();

        if (!$member) {
            return back()->withErrors([
                'login' => 'The provided credentials do not match our calling team records.',
            ]);
        }

        if ((int) ($member->status ?? 1) === 0) {
            return back()->withErrors([
                'login' => 'Your account is inactive. Please contact admin to activate your account.',
            ]);
        }

        if (!Auth::guard('callingteam')->attempt([
            $field => $request->string('identifier')->toString(),
            'password' => $request->string('password')->toString(),
            'status' => 1,
            'is_calling_team' => 1,
        ], (bool) $request->boolean('remember'))) {
            return back()->withErrors([
                'login' => 'The provided credentials do not match our calling team records.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->route('callingteam.dashboard');
    }

    protected function determineLoginField(string $identifier): string
    {
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return 'email';
        }

        if (is_numeric($identifier)) {
            return 'phone';
        }

        return 'username';
    }
}
