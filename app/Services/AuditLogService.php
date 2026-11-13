<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\SystemErrorLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuditLogService
{
    /**
     * Record an audit action ("Kisne kya kiya").
     */
    public static function log(
        string $action,
        string $description,
        array $details = [],
        ?string $module = null,
        ?Model $entity = null,
        string $status = 'success',
        $actor = null,
        ?Request $request = null
    ): ?AuditLog {
        try {
            $req = $request ?: request();
            $actorData = self::resolveActor($actor);

            // Determine module automatically if omitted
            if (empty($module)) {
                $module = self::guessModule($action, $entity);
            }

            // Determine entity info
            $entityType = null;
            $entityId = null;
            if ($entity) {
                $entityType = class_basename($entity);
                $entityId = (string) ($entity->uuid ?? $entity->id ?? null);
            }

            // Determine platform (web or app)
            $platform = $details['platform'] ?? 'web';
            if (!isset($details['platform']) && $req) {
                $platformHeader = strtolower($req->header('X-Platform', ''));
                if ($platformHeader === 'app' || $req->is('api/*')) {
                    $platform = 'app';
                }
            }

            // Capture human-readable device name for candidate & visitor activity
            if (empty($details['device_name']) && $req) {
                $customHeader = $req->header('X-Device-Name') ?: $req->header('X-Device-Model');
                $details['device_name'] = $customHeader ?: self::parseDeviceName($req->userAgent(), $details, $platform);
            }

            $audit = AuditLog::create([
                'actor_type'  => $actorData['type'],
                'actor_id'    => $actorData['id'],
                'actor_name'  => $actorData['name'],
                'actor_email' => $actorData['email'],
                'action'      => $action,
                'module'      => $module,
                'entity_type' => $entityType,
                'entity_id'   => $entityId,
                'description' => $description,
                'details'     => $details,
                'status'      => $status,
                'ip_address'  => $req ? $req->ip() : null,
                'user_agent'  => $req ? substr($req->userAgent() ?? '', 0, 500) : null,
                'platform'    => $platform,
            ]);

            return $audit;
        } catch (Throwable $e) {
            Log::warning("AuditLogService::log failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Record an incomplete or abandoned process ("Kisne konsi process aadhi ki").
     */
    public static function logIncomplete(
        string $action,
        string $description,
        array $details = [],
        ?string $module = null,
        ?Model $entity = null,
        $actor = null
    ): ?AuditLog {
        return self::log(
            $action,
            $description,
            $details,
            $module,
            $entity,
            'incomplete',
            $actor
        );
    }

    /**
     * Record an unhandled exception / error in the system ("kisi ko error aaye to error logs bane").
     */
    public static function logException(Throwable $e, ?Request $request = null): ?SystemErrorLog
    {
        try {
            $req = $request ?: (function_exists('request') ? request() : null);
            $actorData = self::resolveActor();

            $statusCode = 500;
            if (method_exists($e, 'getStatusCode')) {
                $statusCode = $e->getStatusCode();
            } elseif (property_exists($e, 'status')) {
                $statusCode = $e->status;
            }

            // Sanitize sensitive request parameters
            $requestData = [];
            if ($req) {
                try {
                    $requestData = $req->except(['password', 'password_confirmation', '_token', 'auth_token', 'token']);
                } catch (Throwable $ignore) {}
            }

            $errorLog = SystemErrorLog::create([
                'message'         => substr($e->getMessage() ?: 'Unhandled Exception', 0, 5000),
                'exception_class' => get_class($e),
                'file'            => $e->getFile(),
                'line'            => $e->getLine(),
                'trace'           => substr($e->getTraceAsString(), 0, 25000),
                'status_code'     => $statusCode ?: 500,
                'url'             => $req ? $req->fullUrl() : null,
                'method'          => $req ? $req->method() : null,
                'actor_type'      => $actorData['type'],
                'actor_id'        => $actorData['id'],
                'actor_name'      => $actorData['name'],
                'ip_address'      => $req ? $req->ip() : null,
                'user_agent'      => $req ? substr($req->userAgent() ?? '', 0, 500) : null,
                'request_data'    => $requestData,
            ]);

            return $errorLog;
        } catch (Throwable $err) {
            // Failsafe: avoid infinite exception loops
            Log::error("AuditLogService::logException failed: " . $err->getMessage());
            return null;
        }
    }

    /**
     * Resolve the current actor (Admin, Candidate, or System).
     */
    protected static function resolveActor($actor = null): array
    {
        if ($actor) {
            if ($actor instanceof \App\Models\Admin) {
                return [
                    'type'  => $actor->role ?: 'admin',
                    'id'    => $actor->id,
                    'name'  => $actor->name,
                    'email' => $actor->email,
                ];
            }
            if ($actor instanceof \App\Models\User) {
                return [
                    'type'  => 'candidate',
                    'id'    => $actor->id,
                    'name'  => $actor->full_name ?: $actor->name ?: 'Candidate',
                    'email' => $actor->email ?: $actor->phone,
                ];
            }
        }

        if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();
            return [
                'type'  => $admin->role ?: 'admin',
                'id'    => $admin->id,
                'name'  => $admin->name,
                'email' => $admin->email,
            ];
        }

        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            return [
                'type'  => 'candidate',
                'id'    => $user->id,
                'name'  => $user->full_name ?: $user->name ?: 'Candidate',
                'email' => $user->email ?: $user->phone,
            ];
        }

        if (Auth::guard('sanctum')->check()) {
            $user = Auth::guard('sanctum')->user();
            if ($user instanceof \App\Models\User) {
                return [
                    'type'  => 'candidate',
                    'id'    => $user->id,
                    'name'  => $user->full_name ?: $user->name ?: 'Candidate',
                    'email' => $user->email ?: $user->phone,
                ];
            }
        }

        if (function_exists('request') && request() && request()->user()) {
            $user = request()->user();
            if ($user instanceof \App\Models\User) {
                return [
                    'type'  => 'candidate',
                    'id'    => $user->id,
                    'name'  => $user->full_name ?: $user->name ?: 'Candidate',
                    'email' => $user->email ?: $user->phone,
                ];
            }
        }

        // Check if there is an unauthenticated HTTP request (Guest Visitor)
        $req = function_exists('request') ? request() : null;
        if ($req && !app()->runningInConsole()) {
            $ip = $req->ip() ?: 'Unknown IP';
            return [
                'type'  => 'guest',
                'id'    => null,
                'name'  => "Guest ({$ip})",
                'email' => null,
            ];
        }

        return [
            'type'  => 'system',
            'id'    => null,
            'name'  => 'System Automator',
            'email' => null,
        ];
    }

    /**
     * Record a page visit ("kha kha visit kiya") for candidate or guest visitor.
     */
    public static function logPageView(string $pageTitle, ?string $url = null, array $extra = []): ?AuditLog
    {
        try {
            $req = function_exists('request') ? request() : null;
            if (!$req || app()->runningInConsole()) {
                return null;
            }

            $path = $req->path();
            if (str_starts_with($path, 'build/') || str_starts_with($path, 'storage/') || str_starts_with($path, '_') || str_starts_with($path, 'admin/')) {
                return null;
            }

            $actorData = self::resolveActor();

            // Only track page views for Candidates and Guests. Ignore Admin and Staff casual browsing.
            if (in_array($actorData['type'], ['super_admin', 'admin', 'team_member', 'staff', 'system'])) {
                return null;
            }

            $ip = $req->ip() ?: '127.0.0.1';
            $pageUrl = $url ?: $req->fullUrl();

            // Detect platform (Web or Mobile App)
            $platform = 'web';
            $platformHeader = strtolower($req->header('X-Platform', ''));
            if ($platformHeader === 'app' || $req->is('api/*')) {
                $platform = 'app';
            }

            // Anti-spam throttling: Do not flood duplicate page visits within 45 seconds from same user/IP & URL
            $cacheKey = 'audit_page_view_' . md5(($actorData['id'] ?? $ip) . '_' . $path);
            if (\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                return null;
            }
            \Illuminate\Support\Facades\Cache::put($cacheKey, 1, now()->addSeconds(45));

            $platformTag = $platform === 'app' ? 'Mobile App' : 'Website';
            $actorLabel = $actorData['type'] === 'guest'
                ? "Guest Visitor ({$ip})"
                : ($actorData['type'] === 'candidate' ? "Candidate {$actorData['name']}" : $actorData['name']);

            $description = "{$actorLabel} visited {$pageTitle} on {$platformTag}";

            $details = array_merge([
                'page'       => $pageTitle,
                'path'       => '/' . ltrim($path, '/'),
                'url'        => $pageUrl,
                'platform'   => $platform,
                'ip'         => $ip,
                'user_agent' => substr($req->userAgent() ?? '', 0, 500),
            ], $extra);

            return self::log(
                action: 'page_view',
                description: $description,
                details: $details,
                module: 'navigation',
                entity: null,
                status: 'success',
                actor: null,
                request: $req
            );
        } catch (Throwable $e) {
            Log::warning("AuditLogService::logPageView failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Record a job post detail view ("kya dekha") for candidate or guest.
     */
    public static function logJobView(JobPost $job, array $extra = []): ?AuditLog
    {
        try {
            $req = function_exists('request') ? request() : null;
            $actorData = self::resolveActor();

            // Only track job detail views for Candidates and Guests. Ignore Admin and Staff internal viewing.
            if (in_array($actorData['type'], ['super_admin', 'admin', 'team_member', 'staff', 'system'])) {
                return null;
            }

            $ip = $req ? $req->ip() : '127.0.0.1';

            // Detect platform
            $platform = 'web';
            if ($req) {
                $platformHeader = strtolower($req->header('X-Platform', ''));
                if ($platformHeader === 'app' || $req->is('api/*')) {
                    $platform = 'app';
                }
            }

            // Anti-spam throttling: 45 seconds per actor & job
            $cacheKey = 'audit_job_view_' . md5(($actorData['id'] ?? $ip) . '_' . $job->id);
            if (\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                return null;
            }
            \Illuminate\Support\Facades\Cache::put($cacheKey, 1, now()->addSeconds(45));

            $platformTag = $platform === 'app' ? 'Mobile App' : 'Website';
            $actorLabel = $actorData['type'] === 'guest'
                ? "Guest Visitor ({$ip})"
                : ($actorData['type'] === 'candidate' ? "Candidate {$actorData['name']}" : $actorData['name']);

            $salary = $job->formatted_salary ?: ($job->min_salary ? "₹" . number_format($job->min_salary) . ($job->max_salary ? " - ₹" . number_format($job->max_salary) : "") : 'Not disclosed');
            $location = $job->location ?: 'Jaipur';

            $description = "{$actorLabel} viewed job opening '{$job->title}' at {$job->company} on {$platformTag}";

            $details = array_merge([
                'job_id'         => $job->id,
                'job_uuid'       => $job->uuid,
                'title'          => $job->title,
                'company'        => $job->company,
                'location'       => $location,
                'salary'         => $salary,
                'qualifications' => $job->qualifications,
                'experience'     => $job->experience ?: ($job->min_experience ? "{$job->min_experience}-{$job->max_experience} yrs" : 'Any'),
                'platform'       => $platform,
                'ip'             => $ip,
                'user_agent'     => $req ? substr($req->userAgent() ?? '', 0, 500) : '',
            ], $extra);

            return self::log(
                action: 'job_view',
                description: $description,
                details: $details,
                module: 'jobs',
                entity: $job,
                status: 'success',
                actor: null,
                request: $req
            );
        } catch (Throwable $e) {
            Log::warning("AuditLogService::logJobView failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Guess module from action name or entity.
     */
    protected static function guessModule(string $action, ?Model $entity): string
    {
        if ($entity) {
            $class = strtolower(class_basename($entity));
            if (str_contains($class, 'jobapplication') || str_contains($class, 'application')) return 'applications';
            if (str_contains($class, 'jobpost') || str_contains($class, 'job')) return 'jobs';
            if (str_contains($class, 'user') || str_contains($class, 'candidate')) return 'users';
            if (str_contains($class, 'interview')) return 'interviews';
            if (str_contains($class, 'admin') || str_contains($class, 'staff')) return 'team';
            if (str_contains($class, 'company')) return 'companies';
        }

        $a = strtolower($action);
        if (str_contains($a, 'job')) return 'jobs';
        if (str_contains($a, 'application') || str_contains($a, 'apply') || str_contains($a, 'offer')) return 'applications';
        if (str_contains($a, 'interview')) return 'interviews';
        if (str_contains($a, 'user') || str_contains($a, 'candidate') || str_contains($a, 'profile') || str_contains($a, 'resume')) return 'users';
        if (str_contains($a, 'team') || str_contains($a, 'staff') || str_contains($a, 'admin')) return 'team';
        if (str_contains($a, 'login') || str_contains($a, 'auth') || str_contains($a, 'logout') || str_contains($a, 'otp')) return 'auth';

        return 'general';
    }

    /**
     * Query real-time incomplete / stalled processes across the platform.
     * ("Kisne konsi process aadhi ki")
     */
    public static function getIncompleteProcesses(int $limit = 50): array
    {
        $incomplete = [];

        // 1. Candidates who registered but have incomplete profiles (no resume, missing title/city, etc.)
        try {
            $incompleteCandidates = User::query()
                ->where(function ($q) {
                    $q->whereNull('resume_url')
                      ->orWhereNull('city')
                      ->orWhereNull('phone')
                      ->orWhere('is_profile_completed', false);
                })
                ->latest()
                ->limit(20)
                ->get();

            foreach ($incompleteCandidates as $user) {
                $missing = [];
                if (empty($user->resume_url)) $missing[] = 'Resume / CV not uploaded';
                if (empty($user->city)) $missing[] = 'City / Location missing';
                if (empty($user->job_title)) $missing[] = 'Target Designation missing';
                if (empty($user->experience)) $missing[] = 'Experience details missing';

                $incomplete[] = [
                    'id'             => 'user-' . $user->id,
                    'type'           => 'candidate_profile_incomplete',
                    'category'       => 'Candidate Profile',
                    'severity'       => count($missing) >= 2 ? 'warning' : 'info',
                    'title'          => ($user->name ?: 'Candidate #' . $user->id) . ' - Profile Half Filled',
                    'description'    => 'Candidate registered via ' . strtoupper($user->registered_from ?: 'web') . ' but stopped without completing profile.',
                    'stalled_reason' => implode(', ', $missing),
                    'actor_name'     => $user->name ?: 'Candidate #' . $user->id,
                    'actor_email'    => $user->email,
                    'actor_phone'    => $user->phone,
                    'platform'       => $user->registered_from ?: 'web',
                    'created_at'     => $user->created_at ? $user->created_at->format('d M Y, h:i A') : 'N/A',
                    'time_ago'       => $user->created_at ? $user->created_at->diffForHumans() : 'Recently',
                    'action_url'     => url('/admin/users'),
                ];
            }
        } catch (Throwable $e) {}

        // 2. Job Applications stalled in review/calling without final decision for > 48 hours
        try {
            $stalledApplications = JobApplication::query()
                ->whereIn('status', ['pending', 'under_review', 'calling_in_progress', 'shortlisted'])
                ->where('created_at', '<', now()->subHours(48))
                ->latest('updated_at')
                ->limit(20)
                ->get();

            foreach ($stalledApplications as $app) {
                $incomplete[] = [
                    'id'             => 'app-' . $app->id,
                    'type'           => 'application_stalled',
                    'category'       => 'Job Application',
                    'severity'       => 'warning',
                    'title'          => ($app->candidate_name ?: 'Applicant') . ' - Application Stalled (' . ucwords(str_replace('_', ' ', $app->status)) . ')',
                    'description'    => 'Application has been in "' . $app->status . '" status for more than 48 hours without recruiter movement.',
                    'stalled_reason' => 'Pending admin/calling team review or next round interview schedule.',
                    'actor_name'     => $app->candidate_name ?: 'Applicant #' . $app->id,
                    'actor_email'    => $app->candidate_email,
                    'actor_phone'    => $app->candidate_phone,
                    'platform'       => 'web',
                    'created_at'     => $app->created_at ? $app->created_at->format('d M Y, h:i A') : 'N/A',
                    'time_ago'       => $app->updated_at ? $app->updated_at->diffForHumans() : 'N/A',
                    'action_url'     => url('/admin/applications'),
                ];
            }
        } catch (Throwable $e) {}

        // 3. Past Interviews that still have status 'scheduled' without outcome / remarks
        try {
            $stalledInterviews = Interview::query()
                ->where('status', 'scheduled')
                ->where('interview_date', '<', now()->startOfDay())
                ->latest('interview_date')
                ->limit(15)
                ->get();

            foreach ($stalledInterviews as $interview) {
                $incomplete[] = [
                    'id'             => 'interview-' . $interview->id,
                    'type'           => 'interview_pending_outcome',
                    'category'       => 'Interview',
                    'severity'       => 'danger',
                    'title'          => ($interview->candidate_name ?: 'Candidate') . ' - Interview Date Passed Without Result',
                    'description'    => 'Interview was scheduled on ' . ($interview->interview_date ? $interview->interview_date->format('d M Y') : 'past date') . ' but status has not been marked as Conducted/Selected/Rejected/No-Show.',
                    'stalled_reason' => 'Interviewer remarks or outcome missing.',
                    'actor_name'     => $interview->interviewer ?: 'Recruiter',
                    'actor_email'    => null,
                    'actor_phone'    => $interview->candidate_phone,
                    'platform'       => 'web',
                    'created_at'     => $interview->created_at ? $interview->created_at->format('d M Y, h:i A') : 'N/A',
                    'time_ago'       => $interview->interview_date ? $interview->interview_date->diffForHumans() : 'Past date',
                    'action_url'     => url('/admin/interviews'),
                ];
            }
        } catch (Throwable $e) {}

        // 4. Job Posts in 'draft' or 'pending' approval
        try {
            $pendingJobs = JobPost::query()
                ->whereIn('status', ['pending', 'draft', 'hold'])
                ->latest()
                ->limit(10)
                ->get();

            foreach ($pendingJobs as $job) {
                $incomplete[] = [
                    'id'             => 'job-' . $job->id,
                    'type'           => 'job_pending_approval',
                    'category'       => 'Job Post',
                    'severity'       => 'info',
                    'title'          => $job->title . ' (' . ($job->company ?? 'ATS') . ') - Pending Moderation',
                    'description'    => 'Job was drafted/submitted but is currently on ' . $job->status . ' and not visible to candidates.',
                    'stalled_reason' => 'Awaiting admin verification / activation.',
                    'actor_name'     => $job->creator?->name ?? 'Admin',
                    'actor_email'    => null,
                    'actor_phone'    => null,
                    'platform'       => 'web',
                    'created_at'     => $job->created_at ? $job->created_at->format('d M Y, h:i A') : 'N/A',
                    'time_ago'       => $job->created_at ? $job->created_at->diffForHumans() : 'Recently',
                    'action_url'     => url('/admin/jobs'),
                ];
            }
        } catch (Throwable $e) {}

        return array_slice($incomplete, 0, $limit);
    }

    /**
     * Read and parse the server `laravel.log` file.
     */
    public static function getServerLogDetails(int $maxLines = 300): array
    {
        $logPath = storage_path('logs/laravel.log');

        if (!File::exists($logPath)) {
            return [
                'exists'       => false,
                'file_path'    => $logPath,
                'file_size'    => '0 KB',
                'size_bytes'   => 0,
                'updated_at'   => 'N/A',
                'total_lines'  => 0,
                'recent_logs'  => [],
                'raw_content'  => 'Log file does not exist yet.',
            ];
        }

        $size = File::size($logPath);
        $sizeFormatted = self::formatBytes($size);
        $updatedAt = Carbon::createFromTimestamp(File::lastModified($logPath))->diffForHumans();

        // Read last N lines using tail-like approach efficiently
        $lines = [];
        $file = new \SplFileObject($logPath, 'r');
        $file->seek(PHP_INT_MAX);
        $totalLines = $file->key();

        $startLine = max(0, $totalLines - $maxLines);
        $file->seek($startLine);

        while (!$file->eof()) {
            $line = $file->fgets();
            if ($line !== false && trim($line) !== '') {
                $lines[] = $line;
            }
        }

        // Parse structured log chunks
        $parsedLogs = [];
        $currentLog = null;

        foreach ($lines as $line) {
            // Regex to match Laravel standard log line: [2026-11-03 17:19:00] local.ERROR: message
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+\w+\.([A-Z]+):\s+(.*)$/', $line, $matches)) {
                if ($currentLog) {
                    $parsedLogs[] = $currentLog;
                }
                $currentLog = [
                    'timestamp' => $matches[1],
                    'level'     => $matches[2], // ERROR, INFO, WARNING, DEBUG
                    'message'   => $matches[3],
                    'stack'     => '',
                ];
            } elseif ($currentLog) {
                // Stack trace line
                $currentLog['stack'] .= $line;
            }
        }

        if ($currentLog) {
            $parsedLogs[] = $currentLog;
        }

        // Reverse so newest logs are first
        $parsedLogs = array_reverse($parsedLogs);

        return [
            'exists'       => true,
            'file_path'    => $logPath,
            'file_size'    => $sizeFormatted,
            'size_bytes'   => $size,
            'updated_at'   => $updatedAt,
            'total_lines'  => $totalLines,
            'recent_logs'  => array_slice($parsedLogs, 0, 150),
            'raw_content'  => implode('', array_slice($lines, -100)),
        ];
    }

    /**
     * Format bytes to human readable format.
     */
    protected static function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Parse human-friendly Device Name from user-agent, request headers, or details payload.
     */
    public static function parseDeviceName(?string $userAgent, $details = [], ?string $platform = 'web'): string
    {
        // 1. Check details array first
        if (is_array($details)) {
            if (!empty($details['device_name'])) return (string) $details['device_name'];
            if (!empty($details['device'])) return (string) $details['device'];
            if (!empty($details['device_model'])) return (string) $details['device_model'];
        }

        $ua = $userAgent ?? '';
        if (empty($ua)) {
            return $platform === 'app' ? 'Mobile App Device' : 'Web Browser';
        }

        // 2. Apple iOS / iPadOS
        if (preg_match('/iPhone(?:\s*OS\s*([0-9_]+))?/i', $ua, $m)) {
            $ver = isset($m[1]) ? ' (iOS ' . str_replace('_', '.', $m[1]) . ')' : ' (iOS)';
            return 'iPhone' . $ver;
        }

        if (preg_match('/iPad/i', $ua)) {
            return 'Apple iPad';
        }

        // 3. Android Hardware Brands & Generic
        if (stripos($ua, 'Android') !== false) {
            $ver = '';
            if (preg_match('/Android\s*([0-9.]+)/i', $ua, $m)) {
                $ver = ' ' . $m[1];
            }

            if (preg_match('/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i', $ua, $m)) {
                return 'Samsung ' . strtoupper($m[1]);
            }
            if (stripos($ua, 'Samsung') !== false) {
                return 'Samsung Galaxy' . ($ver ? " (v{$ver})" : '');
            }
            if (preg_match('/Pixel\s*[0-9a-zA-Z\s]+/i', $ua, $m)) {
                return 'Google ' . trim($m[0]);
            }
            if (preg_match('/(OnePlus[A-Z0-9\s_-]*|IN20[0-9]{2}|GM19[0-9]{2})/i', $ua)) {
                return 'OnePlus Phone';
            }
            if (preg_match('/(Redmi[A-Za-z0-9\s_-]*|POCO[A-Za-z0-9\s_-]*|Xiaomi)/i', $ua)) {
                return 'Xiaomi / Redmi';
            }
            if (preg_match('/(vivo[A-Za-z0-9\s_-]*|V2[0-9]{3}|iQOO)/i', $ua)) {
                return 'Vivo / iQOO';
            }
            if (preg_match('/(Realme[A-Za-z0-9\s_-]*|RMX[0-9]+)/i', $ua)) {
                return 'Realme Phone';
            }
            if (preg_match('/(OPPO[A-Za-z0-9\s_-]*|CPH[0-9]+)/i', $ua)) {
                return 'OPPO Phone';
            }

            return 'Android Mobile' . ($ver ? " (v{$ver})" : '');
        }

        // 4. Desktop OS
        if (stripos($ua, 'Macintosh') !== false || stripos($ua, 'Mac OS X') !== false) {
            if (stripos($ua, 'Chrome') !== false) return 'MacBook (Chrome)';
            if (stripos($ua, 'Safari') !== false) return 'MacBook (Safari)';
            if (stripos($ua, 'Firefox') !== false) return 'MacBook (Firefox)';
            return 'MacBook / macOS';
        }

        if (stripos($ua, 'Windows NT') !== false) {
            $win = 'PC';
            if (stripos($ua, 'Windows NT 10.0') !== false) $win = 'Win 10/11';
            elseif (stripos($ua, 'Windows NT 6.3') !== false) $win = 'Win 8.1';
            elseif (stripos($ua, 'Windows NT 6.1') !== false) $win = 'Win 7';

            if (stripos($ua, 'Edg') !== false) return "Windows {$win} (Edge)";
            if (stripos($ua, 'Chrome') !== false) return "Windows {$win} (Chrome)";
            if (stripos($ua, 'Firefox') !== false) return "Windows {$win} (Firefox)";
            return "Windows {$win}";
        }

        if (stripos($ua, 'Linux') !== false) {
            return 'Linux Desktop';
        }

        if (stripos($ua, 'curl') !== false) {
            return 'Curl / API Client';
        }

        if (stripos($ua, 'Dart') !== false || stripos($ua, 'Flutter') !== false) {
            return 'Flutter App';
        }

        return $platform === 'app' ? 'Mobile App' : 'Web Browser';
    }
}

