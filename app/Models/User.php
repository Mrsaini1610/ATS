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

    public function getProfilePictureUrlAttribute()
    {
        return $this->profile_picture ? asset('storage/' . $this->profile_picture) : null;
    }

    // Category Relation
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Educations with active records filter
    public function educations()
    {
        return $this->hasMany(UserEducation::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    // Experiences with active records filter
    public function experiences()
    {
        return $this->hasMany(UserExperience::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    // Latest Active Experience
    public function latestExperience()
    {
        return $this->hasOne(UserExperience::class, 'user_uuid', 'uuid')->where('is_delete', 0)->latestOfMany();
    }

    // Resumes with active records filter
    public function resumes()
    {
        return $this->hasMany(UserResume::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }

    // Certificates with active records filter
    public function certificates()
    {
        return $this->hasMany(UserCertificate::class, 'user_uuid', 'uuid')->where('is_delete', 0);
    }
    // Saved Jobs Relation
    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class, 'user_uuid', 'uuid');
    }

}
