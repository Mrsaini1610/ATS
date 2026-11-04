<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%); padding: 36px 30px; text-align: center;">
                <div style="font-size: 34px; margin-bottom: 8px;">🎉</div>
                <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                    Welcome to {{ config('app.name', 'ATS') }}!
                </div>
                <div style="font-size: 14px; color: #EDE9FE; margin-top: 6px; font-weight: 500;">
                    Your Direct Gateway to Verified Jobs & Top Employers
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 32px 30px;">
                <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #0F172A;">
                    Hello {{ $user->full_name ?: ($user->name ?: 'Candidate') }},
                </p>
                <p style="margin: 0 0 22px; font-size: 14.5px; line-height: 1.65; color: #475569;">
                    Congratulations! Your account is now active on {{ config('app.name', 'ATS') }}. You are now connected with thousands of top companies, certified recruiters, and daily verified openings matching your location and experience.
                </p>

                <!-- Profile Summary Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 18px 22px;">
                            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6D28D9; letter-spacing: 0.5px; margin-bottom: 10px;">
                                👤 Your Profile Details
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13.5px; line-height: 1.8;">
                                <tr>
                                    <td style="color: #64748B; width: 35%;">Registered Phone:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $user->phone ?? 'Not set' }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Registered Email:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $user->email ?? 'Not set' }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">City / Preferred Area:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $user->city ?? 'All India' }}</td>
                                </tr>
                                @if(!empty($user->job_title))
                                <tr>
                                    <td style="color: #64748B;">Target Role:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $user->job_title }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- 3 Steps to Get Hired -->
                <div style="font-size: 14px; font-weight: 800; color: #1E293B; margin-bottom: 12px;">
                    3 Quick Steps to Get Hired Faster:
                </div>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; font-size: 13.5px; line-height: 1.6; color: #475569;">
                    <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 28px;">
                            <span style="display: inline-block; width: 22px; height: 22px; background-color: #EDE9FE; color: #6D28D9; border-radius: 50%; text-align: center; font-weight: 800; font-size: 12px; line-height: 22px;">1</span>
                        </td>
                        <td style="padding: 8px 0;">
                            <strong style="color: #0F172A;">Complete Profile:</strong> Add your past experience and skills to get high-priority employer visibility.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                            <span style="display: inline-block; width: 22px; height: 22px; background-color: #EDE9FE; color: #6D28D9; border-radius: 50%; text-align: center; font-weight: 800; font-size: 12px; line-height: 22px;">2</span>
                        </td>
                        <td style="padding: 8px 0;">
                            <strong style="color: #0F172A;">Browse 15 KM Nearby Jobs:</strong> Discover companies hiring near your residence with travel-friendly shifts.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                            <span style="display: inline-block; width: 22px; height: 22px; background-color: #EDE9FE; color: #6D28D9; border-radius: 50%; text-align: center; font-weight: 800; font-size: 12px; line-height: 22px;">3</span>
                        </td>
                        <td style="padding: 8px 0;">
                            <strong style="color: #0F172A;">1-Click Apply:</strong> Receive direct interview calls and WhatsApp updates from HR without middlemen.
                        </td>
                    </tr>
                </table>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/job-search') }}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);">
                                Explore Verified Jobs Now →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.6;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #64748B;">
                    {{ config('app.name', 'ATS') }} Recruitment Team
                </p>
                <p style="margin: 0;">
                    Questions? Reach out to support or visit your candidate portal anytime.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
