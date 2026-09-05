<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tasks';

    protected $fillable = [
        'uuid',
        'title',
        'description',
        'task_type',
        'specific_day',
        'specific_date',
        'is_stage',
        'recurring_type',
        'recurring_days',
        'start_from',
        'member_id',
        'start_date',
        'end_date',
        'status',
        'completed_at',
        'created_by',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'completed_at' => 'datetime',
        'is_stage'     => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($task) {
            if (empty($task->uuid)) {
                $task->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function member()
    {
        return $this->belongsTo(Admin::class, 'member_id');
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
