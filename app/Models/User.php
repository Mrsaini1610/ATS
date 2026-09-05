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
        'uuid', 'category_id', 'username', 'full_name', 'email', 'phone', 'password',
        'gender', 'dob', 'total_experience_years', 'current_ctc', 'expected_ctc',
        'notice_period_days', 'bio', 'profile_picture', 'skills',
        'address', 'city', 'state', 'pincode', 'latitude', 'longitude',
        'is_online', 'last_active'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'skills'      => 'array',
        'is_online'   => 'boolean',
        'last_active' => 'datetime',
        'dob'         => 'date',
        'latitude'    => 'decimal:8',
        'longitude'   => 'decimal:8',
    ];

    protected $appends = ['profile_picture_url'];

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
        return $this->hasMany(UserResume::class, 'user_uuid', 'uuid');
    }

    public function defaultResume()
    {
        return $this->hasOne(UserResume::class, 'user_uuid', 'uuid')->where('is_default', true);
    }

    public function certificates()
    {
        return $this->hasMany(UserCertificate::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class, 'user_uuid', 'uuid');
    }
}
