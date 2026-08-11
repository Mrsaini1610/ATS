<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TaskAssignment extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $fillable = [
        'uuid',
        'task_id',
        'assigned_to',
        'assigned_by',
        'start_date',
        'end_date',
        'assigned_by_type',
        'is_transferred',
        'parent_assignment_id',
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

    public function assigner()
    {
        return $this->belongsTo(SuperAdmin::class, 'assigned_by');
    }

    public function parentAssigner(){
        return $this->belongsTo(SuperAdmin::class,'parent_assignment_id');
    }


    public function logs()
    {
        return $this->hasMany(TaskLog::class);
    }
}
