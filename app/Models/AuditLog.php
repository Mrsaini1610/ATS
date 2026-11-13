<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'actor_type',
        'actor_id',
        'actor_name',
        'actor_email',
        'action',
        'module',
        'entity_type',
        'entity_id',
        'description',
        'details',
        'status',
        'ip_address',
        'user_agent',
        'platform',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'device_name',
    ];

    /**
     * Get candidate / visitor human-readable device name.
     */
    public function getDeviceNameAttribute(): string
    {
        return \App\Services\AuditLogService::parseDeviceName(
            $this->user_agent,
            $this->details,
            $this->platform
        );
    }
}

