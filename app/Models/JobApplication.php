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
        'candidate_skills'    => 'array',
        'answers'             => 'array',
        'screening_answers'   => 'array',
        'interview_date_time' => 'datetime',
        'offer_joining_date'  => 'date',
        'reviewed_at'         => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class, 'job_id');
    }

    public function assignedCallingMember()
    {
        return $this->belongsTo(Admin::class, 'assigned_calling_team_member_id');
    }
}
