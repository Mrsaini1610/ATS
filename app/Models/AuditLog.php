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
        'location',
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

    /**
     * Get candidate / visitor location (City / State).
     */
    public function getLocationAttribute(): ?string
    {
        if (!empty($this->details['location'])) {
            return (string) $this->details['location'];
        }
        if (!empty($this->details['city'])) {
            return (string) $this->details['city'];
        }
        if ($this->actor_type === 'candidate' && $this->actor_id) {
            try {
                $city = \Illuminate\Support\Facades\Cache::remember(
                    "candidate_city_{$this->actor_id}",
                    3600,
                    fn() => \App\Models\User::where('id', $this->actor_id)->value('city')
                );
                if ($city) return $city;
            } catch (\Throwable $e) {}
        }
        if ($this->ip_address === '127.0.0.1' || $this->ip_address === '::1') {
            return 'Localhost / Dev';
        }
        return null;
    }
}

