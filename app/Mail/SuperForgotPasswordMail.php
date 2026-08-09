<?php

namespace App\Mail;

use App\Models\SuperAdmin;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SuperForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $superAdmin;
    public $resetUrl;
    public $setting;

    public function __construct(SuperAdmin $superAdmin, $resetUrl)
    {
        $this->superAdmin = $superAdmin;
        $this->resetUrl   = $resetUrl;
        $this->setting    = SiteSetting::first();
    }

    public function build()
    {
        try {
            return $this->subject('Password Reset Request')
                ->view('emails.super_forget_password')
                ->with([
                    'resetUrl'   => $this->resetUrl,
                    'superAdmin' => $this->superAdmin,
                    'setting'    => $this->setting,
                ]);
        } catch (\Exception $e) {
            Log::error('Failed to build SuperForgotPasswordMail', [
                'super_admin_id' => $this->superAdmin->id,
                'email'          => $this->superAdmin->email,
                'error'          => $e->getMessage(),
                'trace'          => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}

