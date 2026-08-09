<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SuperAdminPasswordChangeNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $member;
    public $superAdmin;
    public $newPassword;

    /**
     * Create a new job instance.
     */
    public function __construct($member, $superAdmin, $newPassword)
    {
        $this->member = $member;
        $this->superAdmin = $superAdmin;
        $this->newPassword = $newPassword;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $emailData = [
            'member' => $this->member,
            'superAdminName' => $this->superAdmin->name,
            'newPassword' => $this->newPassword,
        ];

        Mail::send('emails.password_changed', $emailData, function($message) {
            $message->to($this->member->email)
                    ->subject('Your Password Has Been Changed');
        });
    }
}
