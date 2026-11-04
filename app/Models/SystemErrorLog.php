<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemErrorLog extends Model
{
    use HasFactory;

    protected $table = 'system_error_logs';

    protected $fillable = [
        'message',
        'exception_class',
        'file',
        'line',
        'trace',
        'status_code',
        'url',
        'method',
        'actor_type',
        'actor_id',
        'actor_name',
        'ip_address',
        'user_agent',
        'request_data',
        'is_resolved',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'request_data' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

