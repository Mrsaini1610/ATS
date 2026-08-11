<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TaskLog extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $fillable = [
        'uuid',
        'task_assignment_id',
        'task_id',
        'performed_by',
        'log_date',
        'status',
        'remarks',
        'completed_at',
    ];

      public function uniqueIds()
    {
        return ['uuid'];
    }

    protected $casts = [
        'log_date' => 'date',
        'completed_at' => 'datetime',
    ];

    public function taskAssignment()
    {
        return $this->belongsTo(TaskAssignment::class);
    }
}
