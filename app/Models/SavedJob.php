<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SavedJob extends Model
{
    use HasFactory;

    protected $table = 'saved_jobs';

    protected $fillable = [
        'uuid',
        'user_uuid',
        'job_uuid',
    ];

    protected static function booted()
    {
        static::creating(function ($savedJob) {
            if (empty($savedJob->uuid)) {
                $savedJob->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }

    public function job()
    {
        return $this->belongsTo(Job::class, 'job_uuid', 'uuid');
    }
}
