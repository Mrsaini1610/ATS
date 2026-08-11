<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WhatsappLog extends Model
{
     protected $fillable = [
        'member_id',
        'phone',
        'error',
        'error_message',
        'status'
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($v) {
            $v->uuid = Uuid::uuid4();
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'error' => 'array',
        ];
    }
}
