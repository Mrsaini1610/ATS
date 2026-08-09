<?php

namespace App\Jobs;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordMail;
use Illuminate\Support\Facades\Log;

class SendPasswordResetEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $member;
    protected $resetUrl;

    public function __construct(Member $member, $resetUrl)
    {
        $this->member = $member;
        $this->resetUrl = $resetUrl;
    }

    public function handle()
    {
        try {

            Mail::to($this->member->email)
                ->send(new ForgotPasswordMail($this->member, $this->resetUrl));
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email', [
                'member_id' => $this->member->id,
                'email' => $this->member->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::critical('Password reset email job failed after all attempts', [
            'member_id' => $this->member->id,
            'email' => $this->member->email,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

    }
}
