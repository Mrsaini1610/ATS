<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Job Offer Letter - {{ $companyName ?? config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25); border: 1px solid #E2E8F0;">
        <!-- Header Banner -->
        <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #064E3B 100%); padding: 36px 32px; text-align: center; color: #FFFFFF; position: relative;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 9999px; padding: 6px 18px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
                    ✨ Official Employment Offer
                </div>
                <h1 style="margin: 0; font-size: 26px; font-weight: 800; line-height: 1.3; color: #FFFFFF;">
                    Congratulations, {{ $candidateName }}!
                </h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: #A7F3D0; font-weight: 500;">
                    You have been selected to join <strong>{{ $companyName }}</strong>
                </p>
            </td>
        </tr>

        <!-- Main Body -->
        <tr>
            <td style="padding: 36px 32px;">
                <p style="margin: 0 0 16px; font-size: 16px; color: #0F172A; font-weight: 600;">
                    Dear {{ $candidateName }},
                </p>
                <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.7; color: #475569;">
                    On behalf of <strong>{{ $companyName }}</strong> and the hiring committee, we are delighted to extend this formal offer of employment for the role of <strong>{{ $designation ?? $jobTitle }}</strong>.
                    Following our interview evaluation, we believe your background, skills, and enthusiasm will be a tremendous addition to our team.
                </p>

                <!-- Core Terms Box -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
                    <tr>
                        <td style="background: #F1F5F9; padding: 12px 20px; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
                            📋 Key Terms of Offer
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748B; width: 40%; font-weight: 500;">Position / Role:</td>
                                    <td style="padding: 8px 0; font-weight: 700; color: #0F172A;">{{ $designation ?? $jobTitle }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Hiring Company:</td>
                                    <td style="padding: 8px 0; font-weight: 700; color: #0F172A;">{{ $companyName }}</td>
                                </tr>
                                @if(!empty($salaryPackage))
                                <tr>
                                    <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Offered Compensation:</td>
                                    <td style="padding: 8px 0; font-weight: 800; color: #059669; font-size: 16px;">
                                        {{ $salaryPackage }}
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($joiningDate))
                                <tr>
                                    <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Date of Joining:</td>
                                    <td style="padding: 8px 0; font-weight: 700; color: #0284C7;">{{ $joiningDate }}</td>
                                </tr>
                                @endif
                                @if(!empty($workLocation))
                                <tr>
                                    <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Work Location:</td>
                                    <td style="padding: 8px 0; font-weight: 600; color: #334155;">{{ $workLocation }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Facilities & Benefits -->
                @if(!empty($facilities) && count($facilities) > 0)
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                        🎁 Included Perks & Facilities
                    </div>
                    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 18px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0">
                            @foreach($facilities as $facility)
                            <tr>
                                <td style="padding: 5px 0; font-size: 13.5px; color: #166534; font-weight: 600;">
                                    <span style="display: inline-block; width: 18px; text-align: center; margin-right: 6px; color: #059669;">✔</span> {{ $facility }}
                                </td>
                            </tr>
                            @endforeach
                        </table>
                    </div>
                </div>
                @endif

                <!-- Special Terms / Notes -->
                @if(!empty($terms))
                <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #92400E; line-height: 1.6;">
                    <strong>Special Instructions & Terms:</strong><br>
                    {!! nl2br(e($terms)) !!}
                </div>
                @endif

                <!-- Next Steps -->
                <div style="background: #F8FAFC; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px; border-left: 4px solid #0284C7;">
                    <div style="font-weight: 700; color: #0F172A; font-size: 13px; margin-bottom: 6px;">Next Steps:</div>
                    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                        Please click the button below to view your full offer document, confirm your acceptance, and provide your onboarding confirmation.
                    </p>
                </div>

                <!-- CTA Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #FFFFFF; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 10px; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35); letter-spacing: 0.3px;">
                                Review & Accept Offer Letter →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Sign-off & Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B;">
                <p style="margin: 0 0 6px; font-weight: 600; color: #334155;">
                    {{ $companyName }} & {{ config('app.name', 'ATS') }} Recruitment Division
                </p>
                <p style="margin: 0; color: #94A3B8;">
                    This is an official offer notification generated on behalf of {{ $companyName }}.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
