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
        'guard',
        'device_id',
        'token'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForGuard($query, $guard)
    {
        return $query->where('guard', $guard);
    }
}
