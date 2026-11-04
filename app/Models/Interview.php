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
        'application_uuid',
        'candidate_uuid',
        'job_uuid',
        'candidate_name',
        'candidate_phone',
        'job_title',
        'company',
        'scheduled_by',
        'interviewer',
        'round',
        'meeting_link',
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
            if (!empty($interview->application_id) && empty($interview->application_uuid)) {
                $app = JobApplication::find($interview->application_id);
                if ($app) {
                    $interview->application_uuid = $app->uuid;
                    $interview->candidate_uuid   = $interview->candidate_uuid ?: $app->candidate_uuid;
                    $interview->job_uuid         = $interview->job_uuid ?: $app->job_uuid;
                }
            }
            if (!empty($interview->application_uuid) && empty($interview->application_id)) {
                $app = JobApplication::where('uuid', $interview->application_uuid)->first();
                if ($app) {
                    $interview->application_id = $app->id;
                    $interview->candidate_uuid = $interview->candidate_uuid ?: $app->candidate_uuid;
                    $interview->job_uuid       = $interview->job_uuid ?: $app->job_uuid;
                }
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function application()
    {
        return $this->belongsTo(JobApplication::class, 'application_uuid', 'uuid');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_uuid', 'uuid');
    }

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class, 'job_uuid', 'uuid');
    }
}
