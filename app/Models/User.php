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

    protected $table = 'users';

    // Standard Auto-Increment ID
    protected $primaryKey = 'id';

    protected $fillable = [
        'uuid',
        'username',
        'phone',
        'skills',
        'experience_years',
        'education',
        'last_salary',
        'current_ctc',
        'expected_ctc',
        'notice_period_days',
        'address',
        'city',
        'state',
        'pincode',
        'latitude',
        'longitude',
        'is_online',
        'last_active'
    ];

    protected $casts = [
        'skills' => 'array',
        'education' => 'array',
        'is_online' => 'boolean',
        'last_active' => 'datetime',
    ];

    // Auto-generate UUID when creating a new record
    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }
}