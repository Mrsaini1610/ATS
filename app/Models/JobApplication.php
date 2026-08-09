<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'job_id',
        'candidate_id',
        'cover_letter',
        'resume_url',
        'answers',
        'screening_answers',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
        'assigned_calling_team_member_id',
        'assigned_to_calling_team_at',
        'call_outcome',
        'call_outcome_reason',
        'call_notes',
        'interview_date_time',
        'interview_mode',
        'interview_address',
        'interview_instructions',
        'interview_contact_person',
        'interview_confirmed_at',
        'offer_letter_triggered_at',
        'hiring_decision',
        'hiring_decision_reason',
        'hiring_decision_updated_at',
        'admin_final_decision',
        'admin_final_decision_reason',
        'admin_final_decision_updated_at',
        'offer_salary_package',
        'offer_joining_date',
        'offer_letter_path',
        'offer_letter_sent_at',
        'candidate_name',
        'candidate_email',
        'candidate_phone',
        'candidate_skills',
        'candidate_experience',
    ];

    protected $casts = [
        'answers' => 'json',
        'screening_answers' => 'json',
        'candidate_skills' => 'json',
        'candidate_experience' => 'json',
        'reviewed_at' => 'datetime',
        'assigned_to_calling_team_at' => 'datetime',
        'interview_date_time' => 'datetime',
        'interview_confirmed_at' => 'datetime',
        'offer_letter_triggered_at' => 'datetime',
        'hiring_decision_updated_at' => 'datetime',
        'admin_final_decision_updated_at' => 'datetime',
        'offer_joining_date' => 'date',
        'offer_letter_sent_at' => 'datetime',
    ];

    public function resumeUrl(): Attribute
    {
        return Attribute::make(
            get: function (?string $value): ?string {
                if (empty($value)) {
                    return null;
                }

                if (Str::startsWith($value, ['http://', 'https://'])) {
                    return $value;
                }

                $rawPath = ltrim($value, '/');

                $diskRelativePath = Str::startsWith($rawPath, 'storage/')
                    ? substr($rawPath, strlen('storage/'))
                    : $rawPath;

                if (Storage::disk('public')->exists($diskRelativePath)) {
                    return Storage::disk('public')->url($diskRelativePath);
                }

                if (!empty($this->candidate_id)) {
                    $candidate = $this->candidate;
                    if ($candidate && !empty($candidate->uuid)) {
                        $folder = 'member-resumes/' . $candidate->uuid;
                        $filename = basename($diskRelativePath);

                        $candidatePath = $folder . '/' . $filename;
                        if (Storage::disk('public')->exists($candidatePath)) {
                            return Storage::disk('public')->url($candidatePath);
                        }

                        if (!Str::startsWith($diskRelativePath, 'generated-resumes/')) {
                            $files = Storage::disk('public')->files($folder);
                            if (!empty($files)) {
                                return Storage::disk('public')->url($files[0]);
                            }
                        }
                    }
                }

                return url($rawPath);
            },
        );
    }

    /**
     * Get the job associated with this application.
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    /**
     * Get the candidate (member) who applied.
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'candidate_id');
    }

    /**
     * Get the admin who reviewed this application.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'reviewed_by');
    }

    public function assignedCallingTeamMember(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'assigned_calling_team_member_id');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });

        static::created(function (JobApplication $application) {
            $job = Job::query()
                ->select('id', 'uuid', 'title', 'created_by')
                ->where('id', $application->job_id)
                ->first();

            if (!$job || empty($job->created_by)) {
                return;
            }

            // Send job application submission email to candidate
            if ($application->candidate_email) {
                \App\Jobs\SendJobApplicationEmail::dispatch(
                    $application->candidate_name ?? 'Candidate',
                    $application->candidate_email,
                    $job->title ?? 'Job Position',
                    $application->job_id,
                    now(),
                    url('/jobs/' . $job->uuid . '/applications/' . $application->uuid)
                );
            }

            Notification::create([
                'model' => 'admin',
                'listing_id' => $job->created_by,
                'job_id' => $job->id,
                'type' => 'job_applied',
                'status' => 'unread',
                'data' => [
                    'job_uuid' => $job->uuid,
                    'job_title' => $job->title,
                    'application_id' => $application->id,
                    'application_uuid' => $application->uuid,
                    'candidate_id' => $application->candidate_id,
                    'candidate_name' => $application->candidate_name,
                    'candidate_email' => $application->candidate_email,
                    'candidate_phone' => $application->candidate_phone,
                ],
            ]);
        });

        static::updating(function (JobApplication $application) {
            // Check if status has changed
            $original = $application->getOriginal();
            if (isset($original['status']) && $original['status'] !== $application->status) {
                // Dispatch status change email to candidate
                if ($application->candidate_email) {
                    $job = Job::query()
                        ->select('id', 'uuid', 'title')
                        ->where('id', $application->job_id)
                        ->first();

                    $statusMessages = [
                        'submitted' => 'Your application has been received and is in our queue for review.',
                        'reviewing' => 'Your application is currently being reviewed by our team.',
                        'shortlisted' => 'Congratulations! Your application has been shortlisted. We will be in touch soon.',
                        'rejected' => 'Thank you for your interest. Unfortunately, your application was not selected at this time.',
                        'selected' => 'Congratulations! You have been selected to move forward in our process.',
                        'interview' => 'You have been scheduled for an interview. Details will be sent separately.',
                        'offer' => 'Congratulations! We are pleased to make you a job offer.',
                        'hired' => 'Welcome to our team! You have been hired.',
                    ];

                    $message = $statusMessages[strtolower($application->status)] ?? 'Your application status has been updated. Please check your account for more details.';

                    \App\Jobs\SendJobApplicationStatusEmail::dispatch(
                        $application->candidate_name ?? 'Candidate',
                        $application->candidate_email,
                        $job->title ?? 'Job Position',
                        $application->status,
                        $original['status'] ?? 'submitted',
                        $message,
                        url('/jobs/' . $job->uuid . '/applications/' . $application->uuid)
                    );
                }
            }
        });
    }

    /**
     * Use UUID for route model binding so URLs containing application UUIDs resolve correctly.
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }
}
