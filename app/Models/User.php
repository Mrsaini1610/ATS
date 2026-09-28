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
        'gender', 'dob', 'total_experience_years', 'current_ctc', 'expected_ctc',
        'notice_period_days', 'bio', 'profile_picture', 'skills', 'languages',
        'address', 'city', 'area', 'state', 'pincode', 'job_title', 'education', 'is_profile_complete',
        'latitude', 'longitude', 'is_online', 'last_active',
        'web_latitude', 'web_longitude', 'web_is_online', 'web_last_active',
        'app_latitude', 'app_longitude', 'app_is_online', 'app_last_active',
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
        'is_profile_complete' => 'boolean',
        'is_open_to_work'     => 'boolean',
    ];

    protected $appends = ['profile_picture_url', 'name'];

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
        return $this->hasMany(JobApplication::class, 'candidate_id', 'id');
    }

    public function candidateNotifications()
    {
        return $this->hasMany(UserNotification::class, 'user_id', 'id');
    }

    public function unreadNotificationsCount(): int
    {
        return $this->candidateNotifications()->whereNull('read_at')->count();
    }
}
