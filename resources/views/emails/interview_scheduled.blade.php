<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Scheduled - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%); padding: 30px 20px;">
                <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                    📅 Interview Scheduled
                </div>
                <div style="font-size: 13px; color: #E0F2FE; margin-top: 4px; font-weight: 500;">
                    {{ config('app.name', 'ATS') }} Recruitment Schedule
                </div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #4B5563;">
                    Dear <strong>{{ $candidateName }}</strong>,
                </p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                    Your interview for the position of <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong> has been officially scheduled.
                </p>

                <!-- Interview Details Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F0F9FF; border-radius: 8px; border: 1px solid #BAE6FD; border-left: 4px solid #0284C7; margin: 20px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B; width: 38%;">📅 Date & Time:</td>
                                    <td style="padding: 6px 0; font-weight: 700; color: #0369A1;">
                                        {{ $interviewDateTime }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">📍 Interview Mode:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">
                                        {{ ucfirst($interviewMode ?? 'Online / Video') }}
                                    </td>
                                </tr>
                                @if(!empty($interviewer))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">👤 Interviewer:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">
                                        {{ $interviewer }}
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($round))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">🎯 Round:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">
                                        {{ $round }}
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($meetingLink))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">🔗 Meeting Link:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #0284C7; word-break: break-all;">
                                        <a href="{{ $meetingLink }}" target="_blank" style="color: #0284C7; text-decoration: underline;">
                                            {{ $meetingLink }}
                                        </a>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($interviewAddress))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">🏢 Venue Address:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">
                                        {{ $interviewAddress }}
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($contactPerson))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">📞 Contact Person:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">
                                        {{ $contactPerson }}
                                    </td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                @if(!empty($instructions))
                <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-size: 13px; color: #92400E; line-height: 1.5;">
                    <strong>Special Instructions:</strong><br>
                    {{ $instructions }}
                </div>
                @endif

                <p style="margin: 16px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                    Please be prepared at least 10 minutes prior to the scheduled time. If you have any questions or need to reschedule, reach out immediately.
                </p>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 15px 0;">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background-color: #0284C7; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                                View Application & Schedule
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 18px 28px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">Sent by {{ config('app.name', 'ATS') }} Automated Scheduler.</p>
            </td>
        </tr>
    </table>
</body>
</html>
