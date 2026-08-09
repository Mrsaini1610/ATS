<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskComment extends Model
{
    use HasFactory, SoftDeletes,HasUuids;

    protected $fillable = [
        'uuid',
        'reply_note_id',
        'task_id',
        'commented_by',
        'comment',
    ];
    public function uniqueIds()
    {
        return ['uuid'];
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function commenter()
    {
        return $this->belongsTo(Member::class, 'commented_by');
    }
 public function superAdminCommenter()
    {
        return $this->belongsTo(SuperAdmin::class, 'commented_by');
    }

     public function replies()
    {
        return $this->hasMany(TaskComment::class, 'reply_note_id')->with('commenter', 'replies');
    }

     public function parent()
    {
        return $this->belongsTo(TaskComment::class, 'reply_note_id');
    }
}
