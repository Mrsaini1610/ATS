<?php

namespace App\Jobs;

use App\Models\SuperAdmin;
use App\Mail\SuperForgotPasswordMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SuperSendPasswordResetEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $superAdmin;
    protected $resetUrl;
    public function __construct(SuperAdmin $superAdmin, $resetUrl)
    {
        $this->superAdmin = $superAdmin;
        $this->resetUrl   = $resetUrl;
    }
    public function handle()
    {
        try {
            Mail::to($this->superAdmin->email)
                ->send(new SuperForgotPasswordMail($this->superAdmin, $this->resetUrl));
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email', [
                'super_admin_id' => $this->superAdmin->id,
                'email'          => $this->superAdmin->email,
                'error'          => $e->getMessage(),
                'trace'          => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
    public function failed(\Throwable $exception)
    {
        Log::critical('Password reset email job failed after all attempts', [
            'super_admin_id' => $this->superAdmin->id,
            'email'          => $this->superAdmin->email,
            'error'          => $exception->getMessage(),
            'trace'          => $exception->getTraceAsString(),
        ]);
    }
}
