<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Back! Login Alert - ATS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%); padding: 32px 30px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">🔐</div>
                <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">
                    Welcome Back, {{ $candidateName }}!
                </div>
                <div style="font-size: 13.5px; color: #94A3B8; margin-top: 6px; font-weight: 500;">
                    Security Notification • Successful Account Login Alert
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 14px; font-size: 15.5px; font-weight: 700; color: #0F172A;">
                    Hello {{ $candidateName }},
                </p>
                <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.65; color: #475569;">
                    We noticed a new sign-in to your <strong>ATS Recruitment</strong> candidate account. We send this alert to help keep your account secure.
                </p>

                <!-- Login Details Box -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 20px 22px;">
                            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #4F46E5; letter-spacing: 0.5px; margin-bottom: 12px;">
                                📋 Login Session Details
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13.5px; line-height: 2;">
                                <tr>
                                    <td style="color: #64748B; width: 36%;">🕒 Login Time:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $time }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">📱 Device:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $device }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">📍 Location:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $location }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">🖥️ Platform:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ strtoupper($platform) }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">🌐 IP Address:</td>
                                    <td style="color: #0F172A; font-weight: 700; font-family: monospace;">{{ $ip }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 16px;">
                    <tr>
                        <td align="center">
                            <a href="{{ $websiteUrl ?? 'https://atstechnologyhiring.com' }}" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                                Continue to ATS Platform →
                            </a>
                        </td>
                    </tr>
                </table>

                <!-- Security Alert Box -->
                <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 14px 16px; border-radius: 8px; font-size: 12.5px; color: #92400E; line-height: 1.55; margin-top: 16px;">
                    <strong>Didn't sign in?</strong> If you did not initiate this login, your account might be compromised. Please change your password immediately or reach out to our support team at <a href="mailto:{{ $supportEmail ?? 'support@atstechnologyhiring.com' }}" style="color: #B45309; font-weight: 700;">{{ $supportEmail ?? 'support@atstechnologyhiring.com' }}</a>.
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.6;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #64748B;">
                    ATS Technology Hiring
                </p>
                <p style="margin: 0;">
                    Official Portal: <a href="{{ $websiteUrl ?? 'https://atstechnologyhiring.com' }}" style="color: #2563EB; text-decoration: none; font-weight: 600;">atstechnologyhiring.com</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
