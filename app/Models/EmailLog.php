<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;
class EmailLog extends Model
{
    use HasFactory,  HasUuids;

    protected $table = 'email_logs';

    protected $fillable = [
        'uuid',
        'user_id',
        'to',
        'from',
        'task_id',
        'subject',
        'body_html',
        'status',
        'sent_at',
        'error_code',
        'error_message',
        'ip',
        'user_agent',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    /**
     * Auto-assign a UUID if not provided.
     */
    public function uniqueIds()
    {
        return ['uuid'];
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }


}
