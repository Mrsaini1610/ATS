<?php

namespace App\Mail;

use App\Models\JobApplication;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class OfferLetterMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public JobApplication $application,
        public ?SiteSetting $setting,
        public string $attachmentPath
    ) {
    }

    public function build()
    {
        $filename = 'offer-letter-' . Str::slug($this->application->candidate_name ?: 'candidate') . '.pdf';

        return $this->subject('Offer Letter - ' . ($this->application->job?->title ?? 'Position'))
            ->view('emails.offer_letter')
            ->attach($this->attachmentPath, [
                'as' => $filename,
                'mime' => 'application/pdf',
            ]);
    }
}
