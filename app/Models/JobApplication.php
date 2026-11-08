<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class JobApplication extends Model
{
    protected $table = 'job_applications';

    protected $fillable = [
        'uuid',
        'job_id',
        'job_uuid',
        'candidate_id',
        'candidate_uuid',
        'user_uuid',
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
        'offer_salary_package',
        'offer_joining_date',
        'offer_letter_path',
        'offer_letter_sent_at',
        'offer_facilities',
        'offer_designation',
        'offer_work_location',
        'offer_terms',
        'candidate_name',
        'candidate_email',
        'candidate_phone',
        'candidate_skills',
        'candidate_experience',
        'current_salary',
        'expected_salary',
        'last_company',
        'notice_period',
        'last_working_day',
        'city',
    ];

    protected $casts = [
        'candidate_skills'    => 'array',
        'answers'             => 'array',
        'screening_answers'   => 'array',
        'offer_facilities'    => 'array',
        'interview_date_time' => 'datetime',
        'offer_joining_date'  => 'date',
        'reviewed_at'         => 'datetime',
    ];

    protected $appends = [
        'is_job_closed',
    ];

    public function getIsJobClosedAttribute(): bool
    {
        $job = $this->jobPost ?: ($this->job ?: (
            !empty($this->job_id) 
                ? JobPost::find($this->job_id) 
                : (!empty($this->job_uuid) ? JobPost::where('uuid', $this->job_uuid)->first() : null)
        ));

        if (!$job) {
            return true;
        }
        if ((bool) ($job->is_deleted ?? false)) {
            return true;
        }
        if (!in_array(strtolower((string) ($job->status ?? '')), ['active', 'approved'])) {
            return true;
        }
        if ($job->last_date && \Carbon\Carbon::parse($job->last_date)->endOfDay()->isPast()) {
            return true;
        }
        return false;
    }

    protected static function booted()
    {
        static::creating(function ($application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
            if (!empty($application->candidate_uuid) && empty($application->user_uuid)) {
                $application->user_uuid = $application->candidate_uuid;
            }
            if (!empty($application->user_uuid) && empty($application->candidate_uuid)) {
                $application->candidate_uuid = $application->user_uuid;
            }
            if (empty($application->candidate_uuid) && !empty($application->candidate_id)) {
                $application->candidate_uuid = User::where('id', $application->candidate_id)->value('uuid');
                $application->user_uuid = $application->candidate_uuid;
            }
            if (empty($application->candidate_id) && !empty($application->candidate_uuid)) {
                $application->candidate_id = User::where('uuid', $application->candidate_uuid)->value('id');
            }
            if (empty($application->job_uuid) && !empty($application->job_id)) {
                $application->job_uuid = JobPost::where('id', $application->job_id)->value('uuid');
            }
            if (empty($application->job_id) && !empty($application->job_uuid)) {
                $application->job_id = JobPost::where('uuid', $application->job_uuid)->value('id');
            }
            if ((empty($application->candidate_name) || empty($application->candidate_email)) && !empty($application->candidate_uuid)) {
                $user = User::where('uuid', $application->candidate_uuid)->first();
                if ($user) {
                    $application->candidate_name = $application->candidate_name ?: ($user->full_name ?: ($user->name ?: 'Candidate'));
                    $application->candidate_email = $application->candidate_email ?: ($user->email ?: 'candidate@example.com');
                }
            }
        });

        static::saving(function ($application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
            if (!empty($application->candidate_uuid) && empty($application->user_uuid)) {
                $application->user_uuid = $application->candidate_uuid;
            }
            if (empty($application->candidate_uuid) && !empty($application->candidate_id)) {
                $application->candidate_uuid = User::where('id', $application->candidate_id)->value('uuid');
                $application->user_uuid = $application->candidate_uuid;
            }
            if (empty($application->job_uuid) && !empty($application->job_id)) {
                $application->job_uuid = JobPost::where('id', $application->job_id)->value('uuid');
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_uuid', 'uuid');
    }

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class, 'job_uuid', 'uuid');
    }

    public function job()
    {
        return $this->belongsTo(JobPost::class, 'job_uuid', 'uuid');
    }

    public function assignedCallingMember()
    {
        return $this->belongsTo(Admin::class, 'assigned_calling_team_member_id');
    }
}
