<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Offer Extended - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 20px;">
                <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                    🎉 Congratulations on Your Job Offer!
                </div>
                <div style="font-size: 13px; color: #D1FAE5; margin-top: 4px; font-weight: 500;">
                    {{ config('app.name', 'ATS') }} Hiring Team
                </div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                    Dear {{ $candidateName }},
                </p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                    We are thrilled to offer you the position of <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong>. The interview panel was thoroughly impressed with your profile, experience, and performance.
                </p>

                <!-- Offer Details Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F0FDF4; border-radius: 8px; border: 1px solid #BBF7D0; border-left: 4px solid #059669; margin: 20px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <div style="font-size: 16px; font-weight: 700; color: #065F46; margin-bottom: 14px;">
                                📜 Offer Overview
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B; width: 38%;">Designation:</td>
                                    <td style="padding: 6px 0; font-weight: 700; color: #1E293B;">{{ $jobTitle }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">Company:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">{{ $companyName }}</td>
                                </tr>
                                @if(!empty($salaryPackage))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">Offered Package:</td>
                                    <td style="padding: 6px 0; font-weight: 700; color: #059669;">{{ $salaryPackage }}</td>
                                </tr>
                                @endif
                                @if(!empty($joiningDate))
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">Joining Date:</td>
                                    <td style="padding: 6px 0; font-weight: 700; color: #1E293B;">{{ $joiningDate }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <p style="margin: 16px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                    Please check your application dashboard to view the formal offer letter and complete the onboarding confirmation.
                </p>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 15px 0;">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background-color: #059669; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                                View Offer Details
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 18px 28px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">Congratulations from the {{ config('app.name', 'ATS') }} Team!</p>
            </td>
        </tr>
    </table>
</body>
</html>
