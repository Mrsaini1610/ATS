<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'start_date',
        'end_date',
        'type',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'role',
        'is_email',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'reviewed_at'=> 'datetime',
        'is_email'   => 'boolean',
    ];
}
