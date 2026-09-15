<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AdminNotification extends Model
{
    protected $table = 'admin_notifications';

    protected $fillable = [
        'uuid',
        'admin_id',
        'type',
        'title',
        'body',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $notification) {
            $notification->uuid ??= (string) Str::uuid();
        });
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
