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
        'status',
        'candidate_name',
        'candidate_email',
        'candidate_phone',
        'candidate_skills',
        'candidate_experience'
    ];

    protected $casts = [
        'candidate_skills' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
        });
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    // Job Post relation
    public function jobPost()
    {
        return $this->belongsTo(JobPost::class, 'job_id');
    }
}
