<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BulkMessage extends Model
{
    protected $fillable = [
        'uuid',
        'channel',
        'target_audience',
        'recipient_count',
        'message',
        'sent_by',
        'status',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function sender()
    {
        return $this->belongsTo(Admin::class, 'sent_by');
    }
}