<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%); padding: 32px 30px; text-align: left;">
                <div style="display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                    ✓ Application Submitted
                </div>
                <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                    Application Received Successfully! 🎉
                </div>
                <div style="font-size: 14px; color: #E0F2FE; margin-top: 4px; font-weight: 500;">
                    Your profile has been forwarded to the hiring team.
                </div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #475569;">
                    Dear <strong>{{ $candidateName }}</strong>,
                </p>
                <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.6; color: #334155;">
                    Thank you for applying. We have received your application for the <strong>{{ $jobTitle }}</strong> opening at <strong>{{ $companyName }}</strong>. The recruitment team is currently reviewing your application against job requirements.
                </p>

                <!-- Job Application Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F0F9FF; border: 1.5px solid #BAE6FD; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 18px 22px;">
                            <div style="font-size: 17px; font-weight: 800; color: #0369A1; margin-bottom: 4px;">
                                {{ $jobTitle }}
                            </div>
                            <div style="font-size: 14px; font-weight: 600; color: #0284C7; margin-bottom: 12px;">
                                🏢 {{ $companyName }}
                            </div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.8; color: #475569;">
                                <tr>
                                    <td style="width: 38%; color: #64748B;">Application Ref:</td>
                                    <td style="color: #0F172A; font-weight: 700;">#APP-{{ $application->id }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Applied Date:</td>
                                    <td style="color: #0F172A; font-weight: 700;">{{ now()->format('d M Y, h:i A') }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B;">Status:</td>
                                    <td>
                                        <span style="display: inline-block; background-color: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; padding: 2px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 800;">
                                            Submitted & In Review
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- 4 Step Hiring Process Timeline -->
                <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 12px;">
                    Application Progress Tracker
                </div>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px;">
                    <tr>
                        <td style="text-align: center; width: 25%;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #0284C7; color: #FFFFFF; font-weight: 800; line-height: 24px; margin: 0 auto 4px;">✓</div>
                            <div style="font-weight: 700; color: #0369A1;">1. Applied</div>
                        </td>
                        <td style="text-align: center; width: 25%;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #E2E8F0; color: #64748B; font-weight: 800; line-height: 24px; margin: 0 auto 4px;">2</div>
                            <div style="color: #64748B;">Screening</div>
                        </td>
                        <td style="text-align: center; width: 25%;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #E2E8F0; color: #64748B; font-weight: 800; line-height: 24px; margin: 0 auto 4px;">3</div>
                            <div style="color: #64748B;">Interview</div>
                        </td>
                        <td style="text-align: center; width: 25%;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #E2E8F0; color: #64748B; font-weight: 800; line-height: 24px; margin: 0 auto 4px;">4</div>
                            <div style="color: #64748B;">Offer</div>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0 0 20px; font-size: 13.5px; color: #64748B; line-height: 1.6;">
                    If your profile matches the role requirements, our recruiter will reach out to you directly via phone or WhatsApp to schedule your interview round.
                </p>

                <!-- CTA -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%); color: #FFFFFF; font-size: 14.5px; font-weight: 800; text-decoration: none; padding: 13px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                                Track Application Status →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">{{ config('app.name', 'ATS') }} Recruitment Support · Best of luck with your application!</p>
            </td>
        </tr>
    </table>
</body>
</html>
