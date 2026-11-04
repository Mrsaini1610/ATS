<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Assigned - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 30px; text-align: left;">
                <div style="display: inline-block; background: rgba(99,102,241,0.25); border: 1px solid #818CF8; border-radius: 999px; padding: 3px 12px; font-size: 11px; font-weight: 800; color: #C7D2FE; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                    🎙️ Interview Assignment
                </div>
                <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                    Interview Assigned: {{ $candidateName }}
                </div>
                <div style="font-size: 14px; color: #94A3B8; margin-top: 4px; font-weight: 500;">
                    Scheduled on <strong>{{ $interviewDateTime }}</strong> ({{ strtoupper($interviewMode ?? 'Online') }})
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 16px; font-size: 14.5px; color: #475569;">
                    Hello <strong>{{ $interviewerName ?? 'Interviewer' }}</strong>,<br>
                    You have been assigned to conduct / coordinate an interview with <strong>{{ $candidateName }}</strong> for the <strong>{{ $jobTitle }}</strong> opening at <strong>{{ $companyName }}</strong>.
                </p>

                <!-- Interview Details Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 12px; margin-bottom: 22px;">
                    <tr>
                        <td style="padding: 20px;">
                            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #4F46E5; letter-spacing: 0.5px; margin-bottom: 12px;">
                                📅 Candidate & Interview Schedule
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13.5px; line-height: 1.8;">
                                <tr>
                                    <td style="color: #64748B; width: 35%;">Candidate:</td>
                                    <td style="color: #0F172A; font-weight: 800;">{{ $candidateName }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Contact Phone:</td>
                                    <td style="color: #0F172A; font-weight: 700;">
                                        <a href="tel:{{ $candidatePhone }}" style="color: #2563EB; text-decoration: none;">{{ $candidatePhone ?? '—' }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Date & Time:</td>
                                    <td style="color: #0F172A; font-weight: 800;">{{ $interviewDateTime }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Mode:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ strtoupper($interviewMode ?? 'Online') }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Round:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $round ?? 'HR Screening' }}</td>
                                </tr>
                                @if(!empty($meetingLink))
                                <tr>
                                    <td style="color: #64748B;">Meeting Link:</td>
                                    <td>
                                        <a href="{{ $meetingLink }}" target="_blank" style="color: #4F46E5; font-weight: 700; text-decoration: underline;">
                                            Open Video Room
                                        </a>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($interviewAddress))
                                <tr>
                                    <td style="color: #64748B; vertical-align: top;">Address:</td>
                                    <td style="color: #0F172A; font-weight: 600;">📍 {{ $interviewAddress }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                @if(!empty($instructions))
                <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 12px 16px; margin-bottom: 22px;">
                    <div style="font-size: 11.5px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 4px;">
                        📌 Notes / Candidate Focus
                    </div>
                    <div style="font-size: 13px; color: #78350F; line-height: 1.5;">
                        {{ $instructions }}
                    </div>
                </div>
                @endif

                <!-- CTA -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0 10px;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/admin/interviews') }}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-size: 14.5px; font-weight: 800; text-decoration: none; padding: 13px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                                View in Interview Portal →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 18px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">ATS Recruiter Automated Dispatch Notification</p>
            </td>
        </tr>
    </table>
</body>
</html>

