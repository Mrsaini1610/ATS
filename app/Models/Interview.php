<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Interview extends Model
{
    use HasFactory;

    protected $table = 'interviews';

    protected $fillable = [
        'uuid',
        'application_id',
        'candidate_name',
        'candidate_phone',
        'job_title',
        'company',
        'scheduled_by',
        'scheduled_at',
        'interview_date',
        'interview_time',
        'mode',
        'status',
        'interested',
        'remark',
    ];

    protected $casts = [
        'interview_date' => 'date',
        'scheduled_at'   => 'date',
        'interested'     => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($interview) {
            if (empty($interview->uuid)) {
                $interview->uuid = (string) Str::uuid();
            }
            if (empty($interview->scheduled_at)) {
                $interview->scheduled_at = now()->toDateString();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
