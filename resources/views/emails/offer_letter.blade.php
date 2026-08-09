<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Letter</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#1e293b;">
    <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px 28px;color:#ffffff;">
                <h1 style="margin:0;font-size:24px;font-weight:700;">Offer Letter</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                    {{ $setting?->site_name ?: ($application->job?->company ?: 'Company') }}
                </p>
            </div>

            <div style="padding:28px;">
                <p style="margin:0 0 16px;font-size:15px;">Dear {{ $application->candidate_name }},</p>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                    We are pleased to offer you the position of
                    <strong>{{ $application->job?->title ?: 'Team Member' }}</strong>
                    at <strong>{{ $application->job?->company ?: ($setting?->site_name ?: 'our organization') }}</strong>.
                    Please find your offer letter attached with this email.
                </p>

                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:20px 0;">
                    <p style="margin:0 0 10px;font-size:14px;"><strong>Salary Package:</strong> {{ $application->offer_salary_package ?: '—' }}</p>
                    <p style="margin:0 0 10px;font-size:14px;"><strong>Joining Date:</strong> {{ optional($application->offer_joining_date)->format('d M Y') ?: '—' }}</p>
                    <p style="margin:0;font-size:14px;"><strong>Job Location:</strong> {{ $application->job?->location ?: '—' }}</p>
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                    Kindly review the attachment and reach out to us if you need any clarification.
                </p>

                <p style="margin:24px 0 6px;font-size:15px;">Regards,</p>
                <p style="margin:0;font-size:15px;font-weight:700;">
                    {{ $setting?->site_name ?: ($application->job?->company ?: 'HR Team') }}
                </p>
                <p style="margin:6px 0 0;font-size:13px;color:#475569;">
                    {{ $setting?->site_email ?: 'hr@example.com' }}
                    @if($setting?->site_phone)
                        | {{ $setting->site_phone }}
                    @endif
                </p>
            </div>
        </div>
    </div>
</body>
</html>
