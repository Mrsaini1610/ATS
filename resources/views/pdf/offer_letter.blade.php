<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Offer Letter</title>
    <style>
        body {
            font-family: sans-serif;
            color: #1f2937;
            font-size: 13px;
            line-height: 1.7;
        }
        .header {
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 18px;
            margin-bottom: 28px;
        }
        .logo {
            height: 52px;
            margin-bottom: 12px;
        }
        .company {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
        }
        .muted {
            color: #64748b;
            font-size: 12px;
        }
        .subject {
            font-size: 20px;
            font-weight: bold;
            margin: 24px 0 8px;
        }
        .section {
            margin-top: 18px;
        }
        .details {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
        }
        .details td {
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            vertical-align: top;
        }
        .details .label {
            width: 180px;
            background: #f8fafc;
            font-weight: bold;
        }
        .signature {
            margin-top: 34px;
        }
    </style>
</head>
<body>
    <div class="header">
        @if(!empty($logoPath) && file_exists($logoPath))
            <img src="{{ $logoPath }}" alt="Logo" class="logo">
        @endif
        <div class="company">{{ $setting?->site_name ?: ($application->job?->company ?: 'Company') }}</div>
        <div class="muted">
            {{ $setting?->site_email ?: 'hr@example.com' }}
            @if($setting?->site_phone)
                | {{ $setting->site_phone }}
            @endif
        </div>
    </div>

    <div class="muted">Date: {{ $generatedDate->format('d M Y') }}</div>
    <div class="subject">Offer of Employment</div>

    <p>Dear {{ $application->candidate_name }},</p>

    <p>
        We are pleased to offer you the position of <strong>{{ $application->job?->title ?: 'Team Member' }}</strong>
        with <strong>{{ $application->job?->company ?: ($setting?->site_name ?: 'our organization') }}</strong>.
        Based on your profile and discussion outcomes, we are confident that you will be a valuable addition to our team.
    </p>

    <table class="details">
        <tr>
            <td class="label">Candidate Name</td>
            <td>{{ $application->candidate_name }}</td>
        </tr>
        <tr>
            <td class="label">Position</td>
            <td>{{ $application->job?->title ?: '—' }}</td>
        </tr>
        <tr>
            <td class="label">Company</td>
            <td>{{ $application->job?->company ?: ($setting?->site_name ?: '—') }}</td>
        </tr>
        <tr>
            <td class="label">Job Location</td>
            <td>{{ $application->job?->location ?: '—' }}</td>
        </tr>
        <tr>
            <td class="label">Salary Package</td>
            <td>{{ $salaryPackage }}</td>
        </tr>
        <tr>
            <td class="label">Joining Date</td>
            <td>{{ \Carbon\Carbon::parse($joiningDate)->format('d M Y') }}</td>
        </tr>
    </table>

    <div class="section">
        <p>
            Please confirm your acceptance of this offer and be prepared to complete the joining formalities on or before the mentioned joining date.
            This offer is subject to company policies, document verification, and any additional onboarding requirements.
        </p>
    </div>

    <div class="signature">
        <p>Sincerely,</p>
        <p><strong>{{ $setting?->site_name ?: ($application->job?->company ?: 'HR Team') }}</strong></p>
        <p class="muted">
            {{ $setting?->site_email ?: 'hr@example.com' }}
            @if($setting?->site_phone)
                | {{ $setting->site_phone }}
            @endif
        </p>
    </div>
</body>
</html>
