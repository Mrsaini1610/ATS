<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the ATS Team - Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #1E1B4B 0%, #2563EB 50%, #4F46E5 100%); padding: 36px 30px; text-align: center;">
                <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #E0E7FF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 20px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.25);">
                    💼 ATS Recruitment & Operations Portal
                </div>
                <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.3px;">
                    Welcome to the ATS Team! 🎉
                </div>
                <div style="font-size: 14px; color: #DBEAFE; margin-top: 6px; font-weight: 500;">
                    Your Official Administrative Login Credentials
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 32px 30px;">
                <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0F172A;">
                    Hello {{ $staffName }},
                </p>
                <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.65; color: #475569;">
                    You have been appointed as an official <strong>{{ $roleLabel }}</strong> on the <strong>{{ config('app.name', 'ATS') }}</strong> Recruitment Management System. Your administrative profile has been created by <strong>{{ $createdByName ?? 'Administrator' }}</strong>.
                </p>

                <!-- Credentials Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                    <tr>
                        <td style="background-color: #EEF2F6; padding: 12px 20px; border-bottom: 1px solid #E2E8F0;">
                            <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1E293B; letter-spacing: 0.5px;">
                                🔐 Your Portal Credentials
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 18px 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.8;">
                                <tr>
                                    <td style="color: #64748B; width: 38%; font-weight: 600;">Assigned Role:</td>
                                    <td style="color: #1E1B4B; font-weight: 800;">
                                        <span style="display: inline-block; background-color: #EEF2FF; color: #4338CA; padding: 2px 10px; border-radius: 6px; font-size: 12px;">
                                            {{ $roleLabel }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; font-weight: 600;">Login Username:</td>
                                    <td style="color: #0F172A; font-weight: 800; font-family: monospace; font-size: 15px;">{{ $staff->username }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; font-weight: 600;">Registered Email:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $staff->email }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; font-weight: 600;">Temporary Password:</td>
                                    <td style="color: #DC2626; font-weight: 800; font-family: monospace; font-size: 15px; background-color: #FEF2F2; padding: 2px 8px; border-radius: 4px; display: inline-block;">
                                        {{ $plainPassword }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; font-weight: 600;">Login URL:</td>
                                    <td style="color: #2563EB; font-weight: 600;">
                                        <a href="{{ $loginUrl }}" style="color: #2563EB; text-decoration: underline;">{{ $loginUrl }}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 26px;">
                    <tr>
                        <td align="center">
                            <a href="{{ $loginUrl }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                                Sign In to Admin Portal →
                            </a>
                        </td>
                    </tr>
                </table>

                <!-- Security Advisory -->
                <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 4px;">
                        ⚠️ Important Security Advisory
                    </div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #78350F; line-height: 1.6;">
                        <li>Please change your password immediately after your first login via the Admin Profile section.</li>
                        <li>Keep your login credentials strictly confidential. Never share your password or OTP with anyone.</li>
                        <li>Single active session enforcement is active. Logging in from another browser will log out earlier sessions.</li>
                    </ul>
                </div>

                <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.6;">
                    If you experience any difficulties logging in, please contact your Super Admin or technical support immediately.
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 22px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #64748B;">
                    © {{ date('Y') }} {{ config('app.name', 'ATS') }}. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                    This is an automated system notification containing confidential credentials. Please do not reply directly to this email.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>

