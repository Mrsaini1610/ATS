<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\SiteSetting;

class TaskAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $task;
    public $member;
    public $assigner;
    public $setting;

    public function __construct($task, $member, $assigner)
    {
        $this->task = $task;
        $this->member = $member;
        $this->assigner = $assigner;

        try {
            $this->setting = SiteSetting::first();
        } catch (\Exception $e) {
            Log::error('Failed to retrieve site settings: ' . $e->getMessage());
            $this->setting = null;
        }
    }

    public function build()
    {
        return $this->subject('New Task Assigned: ' . ($this->task->title ?? 'Untitled Task'))
                   ->view('emails.task_assigned')
                   ->with([
                       'task' => $this->task,
                       'member' => $this->member,
                       'assigner' => $this->assigner,
                       'setting' => $this->setting,
                   ]);
    }
}
