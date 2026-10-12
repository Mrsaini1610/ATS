<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Candidate Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); padding: 30px 20px;">
                <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                    📥 New Candidate Application
                </div>
                <div style="font-size: 13px; color: #EDE9FE; margin-top: 4px; font-weight: 500;">
                    {{ $roleContext ?? 'Applicant Tracking System Alert' }}
                </div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #4B5563;">
                    Hello <strong>{{ $recipientName ?? 'Admin' }}</strong>,
                </p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                    A candidate has applied for <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong>.
                </p>

                <!-- Candidate Info Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FAF5FF; border-radius: 8px; border: 1px solid #E9D5FF; border-left: 4px solid #7C3AED; margin: 20px 0;">
                    <tr>
                        <td style="padding: 18px 20px;">
                            <div style="font-size: 16px; font-weight: 700; color: #581C87; margin-bottom: 12px;">
                                👤 {{ $candidateName }}
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                                <tr>
                                    <td style="padding: 5px 0; color: #6B7280; width: 35%;">Email:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1F2937;">{{ $candidateEmail ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #6B7280;">Phone:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1F2937;">{{ $candidatePhone ?? 'N/A' }}</td>
                                </tr>
                                @if(!empty($candidateExperience))
                                <tr>
                                    <td style="padding: 5px 0; color: #6B7280;">Experience:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1F2937;">{{ $candidateExperience }}</td>
                                </tr>
                                @endif
                                @if(!empty($candidateCity))
                                <tr>
                                    <td style="padding: 5px 0; color: #6B7280;">City:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1F2937;">{{ $candidateCity }}</td>
                                </tr>
                                @endif
                                @if(!empty($candidateSkills))
                                <tr>
                                    <td style="padding: 5px 0; color: #6B7280;">Skills:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1F2937;">
                                        {{ is_array($candidateSkills) ? implode(', ', $candidateSkills) : $candidateSkills }}
                                    </td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="padding: 5px 0; color: #6B7280;">Applied At:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1F2937;">{{ now()->format('d M Y, h:i A') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 15px 0;">
                            <a href="{{ $actionUrl ?? url('/admin/applications') }}" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                                Review Application
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F9FAFB; padding: 18px 28px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF;">
                <p style="margin: 0;">Sent by {{ config('app.name', 'ATS') }} Admin Management Center.</p>
            </td>
        </tr>
    </table>
</body>
</html>
