<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Applicant Alert - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #1E293B 0%, #334155 100%); padding: 30px; text-align: left;">
                <div style="display: inline-block; background: rgba(59,130,246,0.25); border: 1px solid #3B82F6; border-radius: 999px; padding: 3px 12px; font-size: 11px; font-weight: 800; color: #93C5FD; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                    🎯 Candidate Applied
                </div>
                <div style="font-size: 23px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                    New Applicant: {{ $candidateName }}
                </div>
                <div style="font-size: 14px; color: #CBD5E1; margin-top: 4px; font-weight: 500;">
                    Applied for <strong>{{ $jobTitle }}</strong> at {{ $companyName }}
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 16px; font-size: 14.5px; color: #475569;">
                    Hello <strong>{{ $recipientName ?? 'Recruitment Team' }}</strong> ({{ $roleContext ?? 'Coordinator' }}),<br>
                    A new candidate has submitted an application for the job posting in your management queue.
                </p>

                <!-- Candidate Profile Snapshot Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 20px;">
                            <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #2563EB; letter-spacing: 0.5px; margin-bottom: 12px;">
                                📋 Candidate Profile Snapshot
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13.5px; line-height: 1.8;">
                                <tr>
                                    <td style="color: #64748B; width: 35%;">Candidate Name:</td>
                                    <td style="color: #0F172A; font-weight: 800;">{{ $candidateName }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Contact Phone:</td>
                                    <td style="color: #0F172A; font-weight: 700;">
                                        <a href="tel:{{ $candidatePhone }}" style="color: #2563EB; text-decoration: none;">{{ $candidatePhone ?? '—' }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Email Address:</td>
                                    <td style="color: #0F172A; font-weight: 700;">
                                        <a href="mailto:{{ $candidateEmail }}" style="color: #2563EB; text-decoration: none;">{{ $candidateEmail ?? '—' }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Total Experience:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $candidateExperience ?? 'Fresher' }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Current Location:</td>
                                    <td style="color: #0F172A; font-weight: 700;">📍 {{ $candidateCity ?? 'India' }}</td>
                                </tr>
                                @if(!empty($candidateSkills))
                                <tr>
                                    <td style="color: #64748B; vertical-align: top;">Key Skills:</td>
                                    <td style="color: #334155; font-weight: 600;">
                                        {{ is_array($candidateSkills) ? implode(', ', $candidateSkills) : $candidateSkills }}
                                    </td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Actions -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0 10px;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/admin/applications') }}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 14.5px; font-weight: 800; text-decoration: none; padding: 13px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                                Review & Shortlist Application →
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
