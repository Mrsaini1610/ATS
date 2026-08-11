<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\SiteSetting;

class JobApplicationStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $candidateName;
    public $candidateEmail;
    public $jobTitle;
    public $newStatus;
    public $previousStatus;
    public $statusMessage;
    public $applicationUrl;
    public $setting;

    public function __construct(
        $candidateName,
        $candidateEmail,
        $jobTitle,
        $newStatus,
        $previousStatus,
        $statusMessage,
        $applicationUrl
    ) {
        $this->candidateName = $candidateName;
        $this->candidateEmail = $candidateEmail;
        $this->jobTitle = $jobTitle;
        $this->newStatus = $newStatus;
        $this->previousStatus = $previousStatus;
        $this->statusMessage = $statusMessage;
        $this->applicationUrl = $applicationUrl;
        $this->setting = SiteSetting::first();
    }

    public function build()
    {
        return $this->subject("Your Job Application Status Has Been Updated - {$this->jobTitle}")
            ->view('emails.job_application_status_changed')
            ->with([
                'candidateName' => $this->candidateName,
                'candidateEmail' => $this->candidateEmail,
                'jobTitle' => $this->jobTitle,
                'newStatus' => $this->newStatus,
                'previousStatus' => $this->previousStatus,
                'statusMessage' => $this->statusMessage,
                'applicationUrl' => $this->applicationUrl,
                'setting' => $this->setting,
            ]);
    }
}
