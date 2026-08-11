<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Inertia\Inertia;
use App\Models\Job;
use App\Models\Member;
use App\Models\JobApplication;
use App\Models\ContactMessage;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Jobs\SendPasswordResetEmail;
use App\Jobs\SuperSendPasswordResetEmail;
use App\Models\EmailLog;
use App\Models\ActivityLog;
use App\Enums\ActionTypeEnum;
use App\Models\SuperAdmin;
use App\Models\SuperAdminPasswordLog;

class HomeController extends Controller
{
    /**
     * Display Lohin Page
     * @return mixed
     */
    public function login()
    {
        $routeName = request()->route()->getName();
        if (Auth::guard('admin')->check()) {
            return Redirect::route('admin.dashboard');
        }
        if (Auth::guard('member')->check()) {
            return Redirect::route('member.dashboard');
        }
        if (Auth::guard('callingteam')->check()) {
            return Redirect::route('callingteam.dashboard');
        }
        $roles = Role::where('status', 1)->where('id', '!=', 2)->get();
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
            'routeName' => $routeName,
            'roles'  => $roles,
        ]);
    }
    /**
     * Handle authentication login request.
     *
     * Validates the request credentials and attempts to authenticate the user
     * using the appropriate guard based on the selected role.
     * Supports login via email, phone, or username as identifier.
     *
     * @param \Illuminate\Http\Request $request
     *      - 'identifier': (string) Required. Can be an email, phone, or username.
     *      - 'password': (string) Required. User's password.
     *      - 'remember': (boolean|null) Optional. If set, remembers login.
     *
     * @return \Illuminate\Http\RedirectResponse
     *      Redirects back with errors on failure or proceeds to the authenticated action on success.
     */
    public function AuthLogin(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'password' => 'required',
        ]);

        $fieldType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $guards = ['admin', 'member', 'web'];
        $authenticatedGuard = null;
        $authenticatedUser = null;
            $inactiveUser = null;
       foreach ($guards as $guard) {
        // First check if user exists with this identifier
        $userModel = $this->getUserModelForGuard($guard);
        $user = $userModel::where($fieldType, $request->identifier)->first();

        if ($user) {
            if ($guard === 'member' && $user->is_calling_team) {
                continue;
            }

            // Check if account is inactive
            if ($user->status == 0) {
                $inactiveUser = $user;
                continue; // Skip authentication attempt for inactive users
            }

            // Attempt authentication for active users
            if (Auth::guard($guard)->attempt([
                $fieldType => $request->identifier,
                'password' => $request->password,
                'status' => 1,
            ], $request->remember)) {
                $authenticatedGuard = $guard;
                $authenticatedUser = Auth::guard($guard)->user();
                break;
            }
        }
    }

    // If we found an inactive user but no active authenticated user
    if ($inactiveUser && !$authenticatedUser) {
        return back()->withErrors([
            'identifier' => 'Your account is inactive. Please contact admin to activate your account.',
        ]);
    }

    if (!$authenticatedUser) {
        return back()->withErrors([
            'identifier' => 'The provided credentials do not match our records.',
        ]);
    }
        $userRoles = is_array($authenticatedUser->roles) ? $authenticatedUser->roles : [];
        $correctGuard = $this->determineGuardFromRoles($userRoles);
        if ($authenticatedGuard !== $correctGuard) {
            Auth::guard($authenticatedGuard)->logout();
            if (!Auth::guard($correctGuard)->attempt([
                $fieldType => $request->identifier,
                'password' => $request->password,
                 'status'   => 1,
            ], $request->remember)) {
                return back()->withErrors([
                    'identifier' => 'Authentication failed for required role.',
                ]);
            }

            $authenticatedUser = Auth::guard($correctGuard)->user();
        }

        if ($authenticatedUser) {
            $request->session()->regenerate();
            ActivityLog::create([
            'user_id'     => $authenticatedUser->id,
            'user_role'   => $authenticatedUser->user_role ?? 'doer',
            'action_type' => ActionTypeEnum::LOGIN,
            'description' => 'User logged in via ' . $authenticatedGuard . ' guard',
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'action_time' => now(),
        ]);
            return $this->authenticated($request, $authenticatedUser, $authenticatedGuard);
        }

        return back()->withErrors([
            'identifier' => 'The provided credentials do not match our records.',
        ]);
    }

    protected function getUserModelForGuard($guard)
{
    $providers = [
        'admin' => Member::class, // Replace with your actual admin model
        'member' => Member::class, // Replace with your actual member model
        'web' => Member::class, // Replace with your actual user model
    ];

    return $providers[$guard] ?? \App\Models\Member::class;
}
    protected function determineGuardFromRoles(array $roles): string
    {

        if (in_array(1, $roles)) {
            return 'admin';
        }
        if (in_array(3, $roles)) {
            return 'member';
        }
        return 'web';
    }

    public function authRoles(Request $request)
    {
        $roles = Role::where('status', 1)
            ->where('id', '!=', 2)
            ->get();

        if ($request->inertia()) {
            return inertia()->render('Auth/Login', [
                'roles' => $roles
            ]);
        }
        return response()->json([
            'roles' => $roles
        ]);
    }

    protected function authenticated(Request $request, $user, $guard)
    {
        $userRoles = is_array($user->roles) ? $user->roles : [];
        $roleId = $this->getFirstValidRoleId($user);
        if (!$roleId) {
            Auth::guard($guard)->logout();
            return redirect()->route('login')->withErrors([
                'role_id' => 'You do not have access to any valid roles'
            ]);
        }
        session(['current_role' => $roleId]);
        return match ((int)$roleId) {
            1 => redirect()->route('admin.dashboard'),
            3 => redirect()->route('member.dashboard'),
            default => redirect()->intended('/'),
        };
    }

    protected function getFirstValidRoleId($user): ?int
    {
        $userRoles = is_array($user->roles) ? $user->roles : [];

        // Admin has priority if user has both roles
        if (in_array(1, $userRoles)) {
            return 1;
        }
        // Then check for member role
        elseif (in_array(3, $userRoles)) {
            return 3;
        }

        return null;
    }

    public function authShowPage(Request $request)
    {
        if (Auth::guard('admin')->check()) {
            return Redirect::route('admin.dashboard');
        }
        if (Auth::guard('member')->check()) {
            return Redirect::route('member.dashboard');
        }
        if (Auth::guard('callingteam')->check()) {
            return Redirect::route('callingteam.dashboard');
        }
        if (Auth::guard('superadmin')->check()) {
            return Redirect::route('super.dashboard');
        }

        // Default: Redirect to public homepage
        return Redirect::route('homepage');
    }

    /**
     * Display the public homepage with stats and featured jobs
     */
    public function showHomepage(Request $request)
    {
        // Get stats for the homepage
        $stats = [
            'activeJobs' => where('status', 'active')->count(),
            'companies' => Job::distinct('company')->count('company'),
            'jobSeekers' => Member::where('status', 1)
                ->hasRoleBySlug('candidate')
                ->count(),
            'successRate' => 94,
        ];

        // Get featured jobs for homepage (limit to 6)
        $featuredJobs = Job::with(['creator'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        return Inertia::render('Homepage', [
            'stats' => $stats,
            'jobs' => $featuredJobs,
        ]);
    }

    public function jobs(Request $request)
    {
        $query = Job::with(['creator' => function ($q) {
                $q->select('id', 'name', 'email');
            }])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        return Inertia::render('Public/JobListings', [
            'jobs' => $query->get(),
            'filters' => [
                'search' => $request->search ?? '',
                'job_type' => $request->job_type ?? '',
                'location' => $request->location ?? '',
            ],
        ]);
    }

    public function companies(Request $request)
    {
        $companies = Job::query()
            ->whereNotNull('company')
            ->where('company', '!=', '')
            ->where('status', 'active')
            ->select([
                'company',
                DB::raw('COUNT(*) as jobs_count'),
                DB::raw('MAX(company_image) as company_image'),
            ])
            ->groupBy('company')
            ->orderBy('company')
            ->get();

        return Inertia::render('Public/Companies', [
            'companies' => $companies,
        ]);
    }

    public function about(Request $request)
    {
        return Inertia::render('Public/About');
    }

    public function contact(Request $request)
    {
        return Inertia::render('Public/Contact');
    }

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        ContactMessage::create([
            ...$validated,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Message submitted successfully.');
    }


    public function emailDetails(Request $request, $name)
    {
        return view('emails.account_creation');
    }

    public function forgetPassword(Request $request)
    {
        return Inertia::render('Auth/ForgetPassword', []);
    }
    public function superForgetPassword(Request $request)
    {
        return Inertia::render('Auth/SuperForgetPassword', []);
    }
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $exists = Member::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }
    public function superCheckEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $exists =
            SuperAdmin::where('email', $request->email)->exists()
            || Member::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $member = Member::where('email', $request->email)->first();
        if (!$member) {
            return back()->with('error', 'If that email address exists in our system, we\'ve sent a password reset link to it.');
        }
        $token = $member->generatePasswordResetToken();
        $resetUrl = route('password.reset', [
            'token' => $token,
        ]);
        SendPasswordResetEmail::dispatchSync($member, $resetUrl);
        EmailLog::create([
            'user_id' => $member->id,
            'subject' => 'Password Reset Request',
            'to' => $member->email,
            'from' => config('mail.from.address'),
            'body_html' => 'Password reset link sent to ' . $member->name,
            'status' => 'sent',
            'sent_at' => now(),
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);
        return back()->with('success', 'We\'ve sent a password reset link to your email address.');
    }

    public function superSendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $superAdmin = SuperAdmin::where('email', $request->email)->first();
        if ($superAdmin) {
            $token = $superAdmin->generatePasswordResetToken();
            $resetUrl = route('super.password.reset', ['token' => $token]);
            dispatch(new SuperSendPasswordResetEmail($superAdmin, $resetUrl));
            EmailLog::create([
                'user_id'    => $superAdmin->id,
                'subject'    => 'Password Reset Request',
                'to'         => $superAdmin->email,
                'from'       => config('mail.from.address'),
                'body_html'  => 'Password reset link sent to ' . $superAdmin->name,
                'status'     => 'sent',
                'sent_at'    => now(),
                'ip'         => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
            ]);

            return back()->with('success', 'We\'ve sent a password reset link to your email address.');
        }

        $member = Member::where('email', $request->email)->first();
        if ($member) {
            $token = $member->generatePasswordResetToken();
            $resetUrl = route('password.reset', [
                'token' => $token,
            ]);
            SendPasswordResetEmail::dispatchSync($member, $resetUrl);
            EmailLog::create([
                'user_id' => $member->id,
                'subject' => 'Password Reset Request',
                'to' => $member->email,
                'from' => config('mail.from.address'),
                'body_html' => 'Password reset link sent to ' . $member->name,
                'status' => 'sent',
                'sent_at' => now(),
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
            ]);
        }

        return back()->with('success', 'We\'ve sent a password reset link to your email address.');
    }

    public function showResetForm(Request $request, $token = null)
    {
        $member = Member::where('reset_password_token', $token)
            ->first();
        if (!$member || !$member->isPasswordResetTokenValid()) {
            return redirect()->route('password.request')
                ->with('error', 'This password reset link is invalid or has expired.');
        }
        return Inertia::render('Auth/PasswordReset', [
            'token' => $token,
            'user' => [
                'name' => $member->name,
                'email' => $member->email,
                'profile_photo_url' => $member->profile_photo_url,
                'phone' => $member->phone,
                'gender' => $member->gender,
            ]
        ]);
    }
    public function superShowResetForm(Request $request, $token = null)
    {
        $member = SuperAdmin::where('reset_password_token', $token)
            ->first();
        if (!$member || !$member->isPasswordResetTokenValid()) {
            return redirect()->route('password.request')
                ->with('error', 'This password reset link is invalid or has expired.');
        }
        return Inertia::render('Auth/SuperPasswordReset', [
            'token' => $token,
            'user' => [
                'name' => $member->name,
                'email' => $member->email,
                'profile_photo_url' => $member->profile_photo_url,
                'phone' => $member->phone,
                'gender' => $member->gender,
            ]
        ]);
    }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed',
        ]);
        $member = Member::where('email', $request->email)
            ->where('reset_password_token', $request->token)
            ->first();
        if (!$member || !$member->isPasswordResetTokenValid()) {
            return back()->with('error', 'This password reset token is invalid or has expired.');
        }
        $member->password = Hash::make($request->password);
        $member->clearPasswordResetToken();
        $member->save();
          SuperAdminPasswordLog::create([
            'email'        => $member->email,
            'role'         => 'user',
            'new_password' => $request->password,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        return redirect('/')->with('success', 'Your password has been reset successfully!');
    }

    public function superResetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed',
        ]);
        $member = SuperAdmin::where('email', $request->email)
            ->where('reset_password_token', $request->token)
            ->first();
        if (!$member || !$member->isPasswordResetTokenValid()) {
            return back()->with('error', 'This password reset token is invalid or has expired.');
        }
        $member->password = Hash::make($request->password);
        $member->clearPasswordResetToken();
        $member->save();
        SuperAdminPasswordLog::create([
            'email'        => $member->email,
            'role'         => 'super_admin',
            'new_password' => $request->password,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        return redirect('/')->with('success', 'Your password has been reset successfully!');
    }
}
