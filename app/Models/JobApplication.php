<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $table = 'job_applications';
    protected $fillable = ['user_id', 'job_id', 'resume_id', 'expected_ctc', 'notice_period_days', 'status', 'cover_note'];

    public function job() {
        return $this->belongsTo(Job::class);
    }

    public function resume() {
        return $this->belongsTo(UserResume::class);
    }
}