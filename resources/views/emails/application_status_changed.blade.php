<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update - {{ config('app.name', 'ATS') }}</title>
</head>
@php
    $statusKey = strtolower($newStatus ?? 'in_review');
    $isPositive = in_array($statusKey, ['shortlisted', 'calling_approved', 'hired', 'offer_letter_generated', 'selected']);
    $isInterview = in_array($statusKey, ['interview_scheduled', 'interview', 'round_1', 'round_2']);
    $isNegative = in_array($statusKey, ['rejected', 'calling_rejected', 'not_selected']);

    $headerBg = $isPositive
        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
        : ($isInterview
            ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
            : ($isNegative
                ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'));

    $statusTitle = $isPositive
        ? ($statusKey === 'hired' ? 'Congratulations! You are Selected 🏆' : 'Great News! You are Shortlisted 🎉')
        : ($isInterview
            ? 'Interview Scheduled 📅'
            : ($isNegative
                ? 'Application Status Update'
                : 'Application Under Review 👀'));

    $statusColor = $isPositive ? '#059669' : ($isInterview ? '#7C3AED' : ($isNegative ? '#64748B' : '#2563EB'));
@endphp
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: {{ $headerBg }}; padding: 32px 30px; text-align: left;">
                <div style="display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                    Application Update
                </div>
                <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                    {{ $statusTitle }}
                </div>
                <div style="font-size: 14px; color: #E0E7FF; margin-top: 4px; font-weight: 500;">
                    Role: <strong>{{ $jobTitle }}</strong> at {{ $companyName }}
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #475569;">
                    Dear <strong>{{ $candidateName }}</strong>,
                </p>
                <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.6; color: #334155;">
                    The hiring team at <strong>{{ $companyName }}</strong> has reviewed your application for <strong>{{ $jobTitle }}</strong> and updated your candidate status.
                </p>

                <!-- Status Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-left: 5px solid {{ $statusColor }}; border-radius: 12px; margin-bottom: 22px;">
                    <tr>
                        <td style="padding: 18px 22px;">
                            <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 6px;">
                                Current Application Status
                            </div>
                            <div style="font-size: 18px; font-weight: 900; color: {{ $statusColor }}; margin-bottom: 12px;">
                                {{ ucwords(str_replace('_', ' ', $newStatus)) }}
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.8; color: #475569;">
                                <tr>
                                    <td style="width: 35%; color: #64748B;">Applied Position:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $jobTitle }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Company Name:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $companyName }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Last Updated:</td>
                                    <td style="color: #0F172A; font-weight: 600;">{{ now()->format('d M Y, h:i A') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                @if(!empty($comments))
                <!-- HR Notes / Remarks -->
                <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px;">
                    <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                        💬 Recruiter Note / Next Steps
                    </div>
                    <div style="font-size: 13.5px; color: #78350F; line-height: 1.6;">
                        {{ $comments }}
                    </div>
                </div>
                @endif

                <p style="margin: 0 0 24px; font-size: 13.5px; color: #64748B; line-height: 1.6;">
                    You can view your detailed application history, interview invites, and recruiter chat directly in your candidate dashboard.
                </p>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background: {{ $statusColor }}; color: #FFFFFF; font-size: 14.5px; font-weight: 800; text-decoration: none; padding: 13px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);">
                                View in Dashboard →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">{{ config('app.name', 'ATS') }} Automated Hiring System</p>
            </td>
        </tr>
    </table>
</body>
</html>
