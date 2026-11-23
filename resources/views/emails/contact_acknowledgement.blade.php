<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Received Your Message - ATS Support</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%); padding: 32px 30px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">📩</div>
                <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">
                    Thank You for Contacting ATS Support
                </div>
                <div style="font-size: 13.5px; color: #E0F2FE; margin-top: 6px; font-weight: 500;">
                    We have received your message and will get back to you shortly
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 14px; font-size: 15.5px; font-weight: 700; color: #0F172A;">
                    Hello {{ $name }},
                </p>
                <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.65; color: #475569;">
                    Thank you for reaching out to <strong>ATS Technology Hiring</strong> Support. Your inquiry has been received and assigned to our support team for review.
                </p>

                <!-- Message Summary Box -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 18px 22px;">
                            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0284C7; letter-spacing: 0.5px; margin-bottom: 10px;">
                                📝 Inquiry Summary
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13.5px; line-height: 1.8;">
                                <tr>
                                    <td style="color: #64748B; width: 28%;">Subject:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ $subjectText }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; vertical-align: top;">Message:</td>
                                    <td style="color: #334155; font-style: italic;">"{{ $messageText }}"</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0 0 20px; font-size: 13.5px; line-height: 1.65; color: #475569;">
                    Our normal response time is within 24 business hours. If you have any additional information to add, simply reply to this email.
                </p>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                        <td align="center">
                            <a href="{{ $websiteUrl ?? 'https://atstechnologyhiring.com' }}" style="display: inline-block; background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 12px 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
                                Visit atstechnologyhiring.com →
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
                    ATS Technology Hiring Support Team
                </p>
                <p style="margin: 0;">
                    Official Website: <a href="{{ $websiteUrl ?? 'https://atstechnologyhiring.com' }}" style="color: #0284C7; text-decoration: none; font-weight: 600;">atstechnologyhiring.com</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
