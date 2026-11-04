<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FcmToken extends Model
{
   use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'user_uuid',
        'guard',
        'device_id',
        'token'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (!empty($model->user_id) && empty($model->user_uuid)) {
                $model->user_uuid = User::where('id', $model->user_id)->value('uuid');
            }
            if (!empty($model->user_uuid) && empty($model->user_id)) {
                $model->user_id = User::where('uuid', $model->user_uuid)->value('id');
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }

    public function scopeForGuard($query, $guard)
    {
        return $query->where('guard', $guard);
    }
}
