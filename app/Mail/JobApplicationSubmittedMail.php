<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\SiteSetting;

class JobApplicationSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $candidateName;
    public $candidateEmail;
    public $jobTitle;
    public $jobPosition;
    public $applicationDate;
    public $applicationUrl;
    public $setting;

    public function __construct(
        $candidateName,
        $candidateEmail,
        $jobTitle,
        $jobPosition,
        $applicationDate,
        $applicationUrl
    ) {
        $this->candidateName = $candidateName;
        $this->candidateEmail = $candidateEmail;
        $this->jobTitle = $jobTitle;
        $this->jobPosition = $jobPosition;
        $this->applicationDate = $applicationDate;
        $this->applicationUrl = $applicationUrl;
        $this->setting = SiteSetting::first();
    }

    public function build()
    {
        return $this->subject('Job Application Submitted Successfully')
            ->view('emails.job_application_submitted')
            ->with([
                'candidateName' => $this->candidateName,
                'candidateEmail' => $this->candidateEmail,
                'jobTitle' => $this->jobTitle,
                'jobPosition' => $this->jobPosition,
                'applicationDate' => $this->applicationDate,
                'applicationUrl' => $this->applicationUrl,
                'setting' => $this->setting,
            ]);
    }
}
