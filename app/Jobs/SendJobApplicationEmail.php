<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Mail\JobApplicationSubmittedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendJobApplicationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $candidateName;
    protected $candidateEmail;
    protected $jobTitle;
    protected $jobPosition;
    protected $applicationDate;
    protected $applicationUrl;

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
    }

    public function handle()
    {
        try {
            Mail::to($this->candidateEmail)->send(
                new JobApplicationSubmittedMail(
                    $this->candidateName,
                    $this->candidateEmail,
                    $this->jobTitle,
                    $this->jobPosition,
                    $this->applicationDate,
                    $this->applicationUrl
                )
            );

            Log::info('Job application email sent successfully', [
                'candidate_email' => $this->candidateEmail,
                'job_title' => $this->jobTitle,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send job application email', [
                'candidate_email' => $this->candidateEmail,
                'job_title' => $this->jobTitle,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::critical('Job application email job failed after all attempts', [
            'candidate_email' => $this->candidateEmail,
            'job_title' => $this->jobTitle,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
