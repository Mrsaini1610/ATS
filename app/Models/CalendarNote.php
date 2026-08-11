<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'date',
        'note',
        'is_private',
        'role',
    ];

    protected $casts = [
        'date'       => 'date',
        'is_private' => 'boolean',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
