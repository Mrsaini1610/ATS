<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\TaskType;
use App\Enums\RecurringType;
use App\Services\TaskInstances\DailyInstanceGenerator;
use App\Services\TaskInstances\WeeklyInstanceGenerator;
use App\Services\TaskInstances\MonthlyInstanceGenerator;
use Illuminate\Support\Facades\Log;

class Task extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'uuid',
        'title',
        'description',
        'member_id',
        'start_date',
        'end_date',
        'status',
        'completed_at',
        'created_by',
        'task_type',
        'recurring_type',
        'recurring_days',
        'start_from',
        'specific_day',
        'specific_date',
        'is_stage',
    ];
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'completed_at' => 'datetime',
        'task_type' => TaskType::class,
        'recurring_type' => RecurringType::class,
    ];
    public function uniqueIds()
    {
        return ['uuid'];
    }
    public function member()
    {
        return $this->belongsTo(Member::class);
    }
    public function creator()
    {
        return $this->belongsTo(SuperAdmin::class, 'created_by');
    }
    public function instances()
    {
        return $this->hasMany(TaskInstance::class);
    }
     public function stages()
    {
        return $this->hasMany(TaskStage::class, 'task_id')->orderBy('order');
    }
    public function activeStage()
{
    return $this->hasOne(TaskStage::class)->where('is_active', true);
}
    public function assignedMembers()
    {
        return $this->belongsToMany(Member::class, 'task_assignments', 'task_id', 'assigned_to')
            ->withTimestamps()
            ->whereNull('task_assignments.deleted_at')
             ->where('task_assignments.is_transferred', 0)
            ->withPivot(['uuid','assigned_by', 'start_date', 'end_date']);
    }
    public function scopeRecurring($query)
    {
        return $query->where('task_type', 'recurring');
    }

    public function scopeOneTime($query)
    {
        return $query->where('task_type', 'one_time');
    }


}
