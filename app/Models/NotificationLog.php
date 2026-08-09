<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NotificationLog extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'uuid',
        'type',
        'morphs',
        'data',
        'title',
        'message',
        'channel',
        'status',
        'error',
        'redirect_url',
        'read_at',
        'sent_at',
        'sender_id',
        'receiver_id',
    ];
    protected $casts = [
        'data' => 'array',
        'morphs' => 'array',
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
    ];
     public function uniqueIds()
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
            'error' => $error
        ]);
    }
}
