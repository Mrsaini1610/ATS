<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NotificationLog extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $table = 'notification_logs';

    protected $fillable = [
        'uuid',
        'receiver_id',
        'sender_id',
        'type',
        'channel',
        'title',
        'message',
        'data',
        'token',
        'device_id',
        'status',
        'error',
        'redirect_url',
        'response_payload',
        'sent_at',
        'read_at',
    ];

    protected $casts = [
        'data'             => 'array',
        'response_payload' => 'array',
        'sent_at'          => 'datetime',
        'read_at'          => 'datetime',
    ];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now(), 'status' => 'read']);
    }

    public function markAsFailed(string $error)
    {
        $this->update([
            'status' => 'failed',
            'error'  => $error,
        ]);
    }
}
