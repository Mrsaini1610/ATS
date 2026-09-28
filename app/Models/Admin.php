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
        'permissions',
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
            'permissions' => 'array',
            'reset_password_token_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    // Role helper methods (Ye missing the, isliye error aaya)
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

    public function permissionList(): array
    {
        $permissions = $this->permissions;

        while (is_string($permissions)) {
            $decoded = json_decode($permissions, true);
            if (!is_array($decoded)) {
                return [];
            }
            $permissions = $decoded;
        }

        $list = is_array($permissions) ? array_values(array_filter($permissions, 'is_string')) : [];

        // 1. Admin role gets default view permissions
        if ($this->role === 'admin') {
            $defaultAdminPermissions = [
                'view_jobs',
                'view_applications',
                'view_users',
                'add_users',
                'view_companies',
                'view_categories',
                'view_subcategories',
                'view_skills',
                'view_interviews',
                'view_tasks',
                'view_team_member',
            ];
            $list = array_values(array_unique(array_merge($list, $defaultAdminPermissions)));
        }

        // 2. Team member role can NEVER have staff/team management permissions
        if ($this->role === 'team_member') {
            $staffPerms = [
                'view_team_member',
                'create_team_member',
                'edit_team_member',
                'status_team_member',
                'delete_team_member',
            ];
            $list = array_values(array_diff($list, $staffPerms));
        }

        // 3. If a job post is assigned to this member, auto grant view, edit/status, and task assignment rights
        try {
            if (!empty($this->id) && \App\Models\JobPost::where('assigned_to', $this->id)->exists()) {
                $autoAssignedPerms = [
                    'view_jobs',
                    'view_tasks',
                    'assign_tasks',
                    'status_tasks',
                    'approve_jobs',
                    'reject_jobs',
                    'hold_jobs',
                    'deactivate_jobs',
                ];
                $list = array_values(array_unique(array_merge($list, $autoAssignedPerms)));
            }
        } catch (\Throwable $e) {
            // Ignore if table not yet migrated
        }

        return $list;
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

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'member_id');
    }
}
