<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Mail\JobApplicationStatusChangedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendJobApplicationStatusEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $candidateName;
    protected $candidateEmail;
    protected $jobTitle;
    protected $newStatus;
    protected $previousStatus;
    protected $statusMessage;
    protected $applicationUrl;

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
    }

    public function handle()
    {
        try {
            Mail::to($this->candidateEmail)->send(
                new JobApplicationStatusChangedMail(
                    $this->candidateName,
                    $this->candidateEmail,
                    $this->jobTitle,
                    $this->newStatus,
                    $this->previousStatus,
                    $this->statusMessage,
                    $this->applicationUrl
                )
            );

            Log::info('Job application status email sent successfully', [
                'candidate_email' => $this->candidateEmail,
                'job_title' => $this->jobTitle,
                'new_status' => $this->newStatus,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send job application status email', [
                'candidate_email' => $this->candidateEmail,
                'job_title' => $this->jobTitle,
                'new_status' => $this->newStatus,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::critical('Job application status email job failed after all attempts', [
            'candidate_email' => $this->candidateEmail,
            'job_title' => $this->jobTitle,
            'new_status' => $this->newStatus,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
