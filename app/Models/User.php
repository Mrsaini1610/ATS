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
        'uuid', 'username', 'full_name', 'email', 'phone', 'gender', 'dob',
        'total_experience_years', 'current_ctc', 'expected_ctc',
        'notice_period_days', 'bio', 'profile_picture', 'skills',
        'address', 'city', 'state', 'pincode', 'latitude', 'longitude',
        'is_online', 'last_active'
    ];

    protected $casts = [
        'skills' => 'array',
        'is_online' => 'boolean',
        'last_active' => 'datetime',
        'dob' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }
    protected $appends = ['profile_picture_url'];

public function getProfilePictureUrlAttribute()
{
    return $this->profile_picture ? asset('storage/' . $this->profile_picture) : null;
}

    public function educations() {
        return $this->hasMany(UserEducation::class);
    }

    public function experiences() {
        return $this->hasMany(UserExperience::class);
    }

    public function resumes() {
        return $this->hasMany(UserResume::class);
    }

    public function applications() {
        return $this->hasMany(JobApplication::class);
    }

    public function certificates()
    {
        return $this->hasMany(UserCertificate::class);
    }
}
