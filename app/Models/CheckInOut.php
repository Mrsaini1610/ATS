<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckInOut extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'date',
        'check_in',
        'check_out',
        'check_in_ip',
        'check_out_ip',
        'check_in_notes',
        'check_out_notes',
        'total_minutes',
        'edited_by',
        'edited_at',
        'role',
    ];

    protected $casts = [
        'date'       => 'date',
        'check_in'   => 'datetime',
        'check_out'  => 'datetime',
        'edited_at'  => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
