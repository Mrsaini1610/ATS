<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 20px;">
                <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                    ✅ Application Received!
                </div>
                <div style="font-size: 13px; color: #D1FAE5; margin-top: 4px; font-weight: 500;">
                    {{ config('app.name', 'ATS') }} Career Services
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
                    Your application for the position of <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong> has been received successfully.
                </p>

                <!-- Application Summary -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F0FDF4; border-radius: 8px; border: 1px solid #BBF7D0; margin: 20px 0;">
                    <tr>
                        <td style="padding: 18px 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #4B5563; width: 38%;">Role / Job:</td>
                                    <td style="padding: 6px 0; font-weight: 700; color: #065F46;">{{ $jobTitle }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #4B5563;">Company:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1F2937;">{{ $companyName }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #4B5563;">Applied Date:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1F2937;">{{ now()->format('d M Y, h:i A') }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #4B5563;">Current Status:</td>
                                    <td style="padding: 6px 0;">
                                        <span style="background-color: #DCFCE7; color: #166534; font-weight: 700; padding: 3px 10px; border-radius: 12px; font-size: 12px;">
                                            Applied (Under Review)
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <p style="margin: 16px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                    Our hiring team will review your application. You will receive updates via email, in-app notification, and SMS/push notification whenever your status progresses.
                </p>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 15px 0;">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background-color: #059669; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                                Track Application
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F9FAFB; padding: 18px 28px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF;">
                <p style="margin: 0;">{{ config('app.name', 'ATS') }} Recruitment Platform. Best of luck!</p>
            </td>
        </tr>
    </table>
</body>
</html>
