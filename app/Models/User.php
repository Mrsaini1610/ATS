<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'uuid', 'category_id', 'username', 'full_name', 'email', 'phone', 'password', 'created_by',
        'registered_from',
        'gender', 'dob', 'total_experience_years', 'current_ctc', 'expected_ctc',
        'notice_period_days', 'bio', 'profile_picture', 'skills', 'languages',
        'address', 'city', 'area', 'state', 'pincode', 'job_title', 'education', 'is_profile_complete',
        'profile_prompt_snoozed_until',
        'latitude', 'longitude', 'is_online', 'last_active',
        'web_latitude', 'web_longitude', 'web_is_online', 'web_last_active',
        'app_latitude', 'app_longitude', 'app_is_online', 'app_last_active',
        'current_web_session_id', 'current_app_device_id', 'last_web_login_at', 'last_app_login_at',
        'linkedin', 'github', 'portfolio', 'job_type', 'work_mode', 'is_open_to_work',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'skills'              => 'array',
        'languages'           => 'array',
        'is_online'           => 'boolean',
        'last_active'         => 'datetime',
        'dob'                 => 'date',
        'latitude'            => 'decimal:8',
        'longitude'           => 'decimal:8',
        'web_is_online'       => 'boolean',
        'web_last_active'     => 'datetime',
        'web_latitude'        => 'decimal:8',
        'web_longitude'       => 'decimal:8',
        'app_is_online'       => 'boolean',
        'app_last_active'     => 'datetime',
        'app_latitude'        => 'decimal:8',
        'app_longitude'       => 'decimal:8',
        'is_profile_complete'          => 'boolean',
        'profile_prompt_snoozed_until' => 'datetime',
        'is_open_to_work'              => 'boolean',
    ];

    protected $appends = ['profile_picture_url', 'name', 'platform', 'education_level'];

    /**
     * Deduce candidate highest education qualification level
     * Levels:
     * 0: Below 10th
     * 1: 10th Pass
     * 2: 12th Pass
     * 3: Diploma / ITI
     * 4: Graduate / Bachelor's
     * 5: Post Graduate / Master's
     * 6: Doctorate / PhD
     */
    public function getEducationLevel(): array
    {
        $maxLevel = 0;
        $bestLabel = '12th Pass'; // default baseline for job seekers if unspecified

        $eduStr = strtolower((string) ($this->education ?? ''));
        if ($eduStr) {
            if (str_contains($eduStr, 'phd') || str_contains($eduStr, 'doctor')) {
                $maxLevel = max($maxLevel, 6);
                $bestLabel = 'Doctorate / PhD';
            } elseif (str_contains($eduStr, 'post graduate') || str_contains($eduStr, 'master') || str_contains($eduStr, 'mba') || str_contains($eduStr, 'mca') || str_contains($eduStr, 'm.tech') || str_contains($eduStr, 'm.com') || str_contains($eduStr, 'm.sc') || str_contains($eduStr, 'pgdm')) {
                $maxLevel = max($maxLevel, 5);
                $bestLabel = 'Post Graduate';
            } elseif (str_contains($eduStr, 'graduate') || str_contains($eduStr, 'bachelor') || str_contains($eduStr, 'b.tech') || str_contains($eduStr, 'bca') || str_contains($eduStr, 'b.com') || str_contains($eduStr, 'bba') || str_contains($eduStr, 'b.sc') || str_contains($eduStr, 'degree')) {
                $maxLevel = max($maxLevel, 4);
                $bestLabel = 'Graduate';
            } elseif (str_contains($eduStr, 'diploma') || str_contains($eduStr, 'polytechnic') || str_contains($eduStr, 'iti')) {
                $maxLevel = max($maxLevel, 3);
                $bestLabel = 'Diploma';
            } elseif (str_contains($eduStr, '12th') || str_contains($eduStr, 'intermediate') || str_contains($eduStr, '10+2') || str_contains($eduStr, 'senior secondary')) {
                $maxLevel = max($maxLevel, 2);
                $bestLabel = '12th Pass';
            } elseif (str_contains($eduStr, '10th') || str_contains($eduStr, 'matric') || str_contains($eduStr, 'high school')) {
                $maxLevel = max($maxLevel, 1);
                $bestLabel = '10th Pass';
            } elseif (str_contains($eduStr, 'below')) {
                $maxLevel = max($maxLevel, 0);
                $bestLabel = 'Below 10th';
            }
        }

        // Check user_educations records if available
        try {
            $educations = $this->relationLoaded('educations') ? $this->educations : $this->educations()->get();
            foreach ($educations as $edu) {
                $deg = strtolower((string) ($edu->degree ?? ''));
                if (str_contains($deg, 'phd') || str_contains($deg, 'doctor')) {
                    if (6 >= $maxLevel) { $maxLevel = 6; $bestLabel = $edu->degree ?: 'Doctorate'; }
                } elseif (str_contains($deg, 'master') || str_contains($deg, 'mba') || str_contains($deg, 'mca') || str_contains($deg, 'm.tech') || str_contains($deg, 'post graduate') || str_contains($deg, 'pgdm')) {
                    if (5 >= $maxLevel) { $maxLevel = 5; $bestLabel = $edu->degree ?: 'Post Graduate'; }
                } elseif (str_contains($deg, 'bachelor') || str_contains($deg, 'graduate') || str_contains($deg, 'b.tech') || str_contains($deg, 'bca') || str_contains($deg, 'b.com') || str_contains($deg, 'bba') || str_contains($deg, 'degree')) {
                    if (4 >= $maxLevel) { $maxLevel = 4; $bestLabel = $edu->degree ?: 'Graduate'; }
                } elseif (str_contains($deg, 'diploma') || str_contains($deg, 'polytechnic') || str_contains($deg, 'iti')) {
                    if (3 >= $maxLevel) { $maxLevel = 3; $bestLabel = $edu->degree ?: 'Diploma'; }
                } elseif (str_contains($deg, '12th') || str_contains($deg, 'inter') || str_contains($deg, '10+2')) {
                    if (2 >= $maxLevel) { $maxLevel = 2; $bestLabel = '12th Pass'; }
                } elseif (str_contains($deg, '10th') || str_contains($deg, 'school') || str_contains($deg, 'matric')) {
                    if (1 >= $maxLevel) { $maxLevel = 1; $bestLabel = '10th Pass'; }
                }
            }
        } catch (\Throwable $e) {
            // Relation check fallback
        }

        return [
            'label' => $bestLabel,
            'level' => $maxLevel,
        ];
    }

    public function getEducationLevelAttribute(): array
    {
        return $this->getEducationLevel();
    }

    public function getPlatformAttribute(): string
    {
        $hasWeb = !empty($this->web_last_active) || ($this->registered_from ?? 'web') === 'web';
        $hasApp = !empty($this->app_last_active) || ($this->registered_from ?? null) === 'app';

        if (!empty($this->web_last_active) && !empty($this->app_last_active)) {
            return 'both';
        }

        if (!empty($this->app_last_active)) {
            return !empty($this->web_last_active) ? 'both' : 'app';
        }

        if (($this->registered_from ?? null) === 'app') {
            return !empty($this->web_last_active) ? 'both' : 'app';
        }

        return 'web';
    }

    public function getNameAttribute()
    {
        return $this->full_name;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['full_name'] = $value;
    }

    /**
     * Check if candidate profile is complete
     */
    public function isProfileComplete(): bool
    {
        if ($this->is_profile_complete) {
            return true;
        }

        return !empty($this->full_name)
            && !str_starts_with($this->full_name, 'Candidate ')
            && !empty($this->email)
            && !empty($this->city)
            && !empty($this->dob);
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Route model binding using UUID
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function getProfilePictureUrlAttribute()
    {
        return $this->profile_picture ? asset($this->profile_picture) : null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function educations()
    {
        return $this->hasMany(UserEducation::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    public function experiences()
    {
        return $this->hasMany(UserExperience::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    public function latestExperience()
    {
        return $this->hasOne(UserExperience::class, 'user_uuid', 'uuid')->where('is_delete', 0)->latestOfMany();
    }

    public function resumes()
    {
        return $this->hasMany(UserResume::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    public function defaultResume()
    {
        return $this->hasOne(UserResume::class, 'user_uuid', 'uuid')->where('is_default', true)->where('is_delete', 0);
    }

    public function certificates()
    {
        return $this->hasMany(UserCertificate::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class, 'user_uuid', 'uuid');
    }
    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class, 'candidate_uuid', 'uuid');
    }

    public function candidateNotifications()
    {
        return $this->hasMany(UserNotification::class, 'user_uuid', 'uuid');
    }

    public function unreadNotificationsCount(): int
    {
        return $this->candidateNotifications()->whereNull('read_at')->count();
    }

    public function fcmTokens()
    {
        return $this->hasMany(FcmToken::class, 'user_uuid', 'uuid')->where('guard', 'api');
    }

    public function latestFcmToken()
    {
        return $this->hasOne(FcmToken::class, 'user_uuid', 'uuid')->where('guard', 'api')->latestOfMany();
    }
}
