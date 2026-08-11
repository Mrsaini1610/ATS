<?php

namespace App\Mail;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\SiteSetting;

class ForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $member;
    public $resetUrl;
    public $setting;

    public function __construct(Member $member, $resetUrl)
    {
        $this->member = $member;
        $this->resetUrl = $resetUrl;
        $this->setting = SiteSetting::first();
    }

    public function build()
    {
        try {
            $email = $this->subject('Password Reset Request')
                        ->view('emails.forget_password')
                        ->with([
                            'resetUrl' => $this->resetUrl,
                            'member' => $this->member,
                            'setting' => $this->setting,
                        ]);

            return $email;
        } catch (\Exception $e) {
            Log::error('Failed to build ForgotPasswordMail', [
                'member_id' => $this->member->id,
                'email' => $this->member->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
