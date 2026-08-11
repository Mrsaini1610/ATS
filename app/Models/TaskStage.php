<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskStage extends Model
{
    protected $table = "stages";
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'task_id',
        'name',
        'min_days',
        'max_days',
        'order',
        'is_active',
        'created_date',
        'last_change_stage_date',
        'stage_overdue_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_date' => 'datetime',
        'last_change_stage_date' => 'datetime',
        'stage_overdue_date' => 'datetime',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function markAsCompleted()
{
    $this->update([
        'is_active' => false,
        'last_change_stage_date' => now(),
        'stage_overdue_date' => null
    ]);

    // Activate next stage if exists
    $nextStage = TaskStage::where('task_id', $this->task_id)
        ->where('order', '>', $this->order)
        ->orderBy('order', 'asc')
        ->first();

    if ($nextStage) {
        $nextStage->update([
            'is_active' => true,
            'last_change_stage_date' => now(),
            'stage_overdue_date' => now()->addDays($nextStage->max_days)
        ]);
    }
}

public function isOverdue()
{
    return $this->stage_overdue_date && now()->greaterThan($this->stage_overdue_date);
}

public function daysOverdue()
{
    if (!$this->isOverdue()) {
        return 0;
    }

    return now()->diffInDays($this->stage_overdue_date);
}
}
