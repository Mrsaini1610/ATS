<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%); padding: 32px 20px;">
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                                🚀 {{ config('app.name', 'ATS Job Portal') }}
                            </div>
                            <div style="font-size: 13px; color: #E0E7FF; margin-top: 4px; font-weight: 500;">
                                Your Career Gateway
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #111827;">
                    Welcome, {{ $user->full_name ?: $user->name ?: 'Candidate' }}! 🎉
                </h1>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4B5563;">
                    Your profile has been successfully registered on <strong>{{ config('app.name', 'ATS') }}</strong>. We're excited to help you find your dream opportunity!
                </p>

                <!-- Profile Summary Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; margin: 20px 0;">
                    <tr>
                        <td style="padding: 16px 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #6B7280; width: 35%;">Registered Email:</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">{{ $user->email ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">Mobile Number:</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">{{ $user->phone ?? 'N/A' }}</td>
                                </tr>
                                @if(!empty($user->city))
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">Location:</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">{{ $user->city }}{{ !empty($user->state) ? ', ' . $user->state : '' }}</td>
                                </tr>
                                @endif
                                @if(!empty($user->job_title))
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">Job Role:</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">{{ $user->job_title }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <h3 style="margin: 20px 0 10px; font-size: 15px; font-weight: 600; color: #1F2937;">Next Steps for You:</h3>
                <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #4B5563;">
                    <li>Keep your resume and skills updated for better match rate</li>
                    <li>Explore active job posts in your area and apply in one tap</li>
                    <li>Track your application progress and interview schedules in real-time</li>
                </ul>

                <!-- Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 10px 0 20px;">
                            <a href="{{ $actionUrl ?? url('/job-search') }}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-weight: 600; font-size: 15px; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79,70,229,0.3);">
                                Browse Matching Jobs
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F9FAFB; padding: 20px 28px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF;">
                <p style="margin: 0 0 4px;">Sent by {{ config('app.name', 'ATS') }} Recruitment Platform.</p>
                <p style="margin: 0;">If you didn't create this account, please ignore this email.</p>
            </td>
        </tr>
    </table>
</body>
</html>
