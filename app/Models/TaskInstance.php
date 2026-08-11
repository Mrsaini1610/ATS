<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;

class TaskInstance extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'uuid',
        'task_id',
        'assigned_to',
        'due_date',
        'status',
        'completed_at'
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime'
    ];

     public function uniqueIds()
    {
        return ['uuid'];
    }
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function assignee()
    {
        return $this->belongsTo(Member::class, 'assigned_to');
    }

    public function markAsComplete()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);

        $this->task->maybeGenerateNextInstance();
    }

      public function isOverdue(): bool
    {
        if (!$this->due_date) {
            return false;
        }
        $dueDate = Carbon::parse($this->due_date);
        return $dueDate->isPast() && $this->status !== 'completed';
    }
}
