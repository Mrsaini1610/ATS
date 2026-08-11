<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\ActionTypeEnum;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_role',
        'action_type',
        'description',
        'ip_address',
        'user_agent',
        'action_time',
    ];

    protected $casts = [
        'action_type' => ActionTypeEnum::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
