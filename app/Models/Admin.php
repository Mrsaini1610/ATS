<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $table = 'admins';

    protected $fillable = [
        'uuid',
        'name',
        'username',
        'email',
        'phone',
        'password',
        'role',
        'permissions', // <--- Yeh add karna zaroori hai
        'profile_image',
        'status',
        'must_change_password',
        'created_by',
        'remember_token',
        'reset_password_token',
        'reset_password_token_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'reset_password_token',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'must_change_password' => 'boolean',
            'permissions' => 'array', // <--- Yeh automatically JSON se PHP Array me convert karega
            'reset_password_token_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Auto-generate UUID when creating admin
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    // Role helper methods
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeamMember(): bool
    {
        return $this->role === 'team_member';
    }

    // Relationships
    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function createdStaff()
    {
        return $this->hasMany(Admin::class, 'created_by');
    }
}