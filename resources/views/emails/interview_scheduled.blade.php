<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Scheduled - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%); padding: 32px 30px; text-align: left;">
                <div style="display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                    📅 Interview Confirmed
                </div>
                <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                    Your Interview is Scheduled!
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
                    Great news! Your interview round for <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong> has been officially confirmed. Please review your interview schedule details below:
                </p>

                <!-- Calendar Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #EEF2FF; border: 1.5px solid #C7D2FE; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 22px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 75px; vertical-align: top;">
                                        <div style="background-color: #4F46E5; color: #FFFFFF; border-radius: 10px; text-align: center; padding: 10px 4px;">
                                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">DATE</div>
                                            <div style="font-size: 20px; font-weight: 900; line-height: 1.1; margin: 3px 0;">📅</div>
                                        </div>
                                    </td>
                                    <td style="padding-left: 18px; vertical-align: top;">
                                        <div style="font-size: 16px; font-weight: 900; color: #1E1B4B; margin-bottom: 4px;">
                                            {{ $interviewDateTime }}
                                        </div>
                                        <div style="font-size: 13.5px; font-weight: 700; color: #4F46E5; margin-bottom: 10px;">
                                            Mode: {{ strtoupper($interviewMode ?? 'Online') }}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <div style="border-top: 1px dashed #C7D2FE; margin: 14px 0; padding-top: 14px;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.9; color: #334155;">
                                    <tr>
                                        <td style="color: #64748B; width: 35%;">Interview Round:</td>
                                        <td style="color: #0F172A; font-weight: 700;">{{ $round ?? 'HR Screening Round' }}</td>
                                    </tr>
                                    @if(!empty($interviewer))
                                    <tr>
                                        <td style="color: #64748B;">Interviewer / Panel:</td>
                                        <td style="color: #0F172A; font-weight: 700;">{{ $interviewer }}</td>
                                    </tr>
                                    @endif
                                    @if(!empty($meetingLink))
                                    <tr>
                                        <td style="color: #64748B;">Meeting Link:</td>
                                        <td>
                                            <a href="{{ $meetingLink }}" style="color: #4F46E5; font-weight: 700; text-decoration: underline;" target="_blank">
                                                Join Video Interview
                                            </a>
                                        </td>
                                    </tr>
                                    @endif
                                    @if(!empty($interviewAddress))
                                    <tr>
                                        <td style="color: #64748B; vertical-align: top;">Interview Address:</td>
                                        <td style="color: #0F172A; font-weight: 700;">📍 {{ $interviewAddress }}</td>
                                    </tr>
                                    @endif
                                    @if(!empty($contactPerson))
                                    <tr>
                                        <td style="color: #64748B;">Contact Person:</td>
                                        <td style="color: #0F172A; font-weight: 700;">{{ $contactPerson }}</td>
                                    </tr>
                                    @endif
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>

                @if(!empty($instructions))
                <!-- Instructions Box -->
                <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px;">
                    <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                        📌 Important Instructions
                    </div>
                    <div style="font-size: 13.5px; color: #78350F; line-height: 1.6;">
                        {{ $instructions }}
                    </div>
                </div>
                @endif

                <!-- Interview Checklist -->
                <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 10px;">
                    Interview Day Checklist:
                </div>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; font-size: 13px; line-height: 1.7; color: #475569;">
                    <tr>
                        <td style="padding: 2px 0;">✓ Please join / arrive 10 minutes prior to scheduled time.</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 0;">✓ Keep a printed or soft copy of your updated resume ready.</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 0;">✓ Ensure a quiet environment and stable internet connection for video calls.</td>
                    </tr>
                </table>

                <!-- Action CTA -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                        <td align="center">
                            @if(!empty($meetingLink))
                            <a href="{{ $meetingLink }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 800; text-decoration: none; padding: 13px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                                Join Video Meeting →
                            </a>
                            @else
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 800; text-decoration: none; padding: 13px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                                View Interview Details →
                            </a>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">{{ config('app.name', 'ATS') }} Recruitment Team · Best of luck for your interview!</p>
            </td>
        </tr>
    </table>
</body>
</html>
