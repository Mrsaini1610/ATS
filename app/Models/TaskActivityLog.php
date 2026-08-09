<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;
use App\Models\Member;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class TaskActivityLog extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $fillable = [
        'uuid',
        'task_id',
        'performed_by',
        'action',
        'changes',
        'remarks',
        'performed_at',
    ];

    public function uniqueIds()
    {
        return ['uuid'];
    }
    protected $casts = [
        'changes' => 'array',
        'performed_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function performer()
    {
        return $this->belongsTo(SuperAdmin::class, 'performed_by');
    }

     public function performerByAdmin()
    {
        return $this->belongsTo(Member::class, 'performed_by');
    }
}
