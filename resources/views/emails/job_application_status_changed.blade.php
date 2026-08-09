@php
    $statusColors = [
        'submitted' => '#FFC107',
        'reviewing' => '#17A2B8',
        'shortlisted' => '#28A745',
        'rejected' => '#DC3545',
        'selected' => '#28A745',
        'interview' => '#007BFF',
        'offer' => '#28A745',
        'hired' => '#28A745',
    ];
    $statusColor = $statusColors[strtolower($newStatus)] ?? '#6C757D';
@endphp

<table align="center" style="width: 100%; max-width: 450px; font-family: Inter, sans-serif; border: 1px solid #f2f2f2;">
    <tr>
        <td align="center" style="background-color: #5146E6; padding: 10px; text-align: center;">
            <img src="{{ optional($setting)->light_logo_url ?? 'https://task.laraveldevelopmentcompany.com/images/logo.png' }}"
                 alt="Logo" style="max-height: 50px;">
        </td>
    </tr>

    <!-- EMAIL BODY START -->
    <tr>
        <td style="padding: 25px 20px; font-size: 14px; color: #1E1E1E;">
            <p>Hi <strong>{{ $candidateName ?? 'Candidate' }}</strong>,</p>
            <p>We wanted to let you know that your job application status has been updated.</p>

            <table style="width:100%; border-collapse: collapse; margin-top: 15px; background-color: #F5F5F5; border-radius: 5px;">
                <tr>
                    <td style="padding: 15px; border-left: 4px solid #5146E6;">
                        <table style="width:100%;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #5146E6;">Position Applied</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 13px;">{{ $jobTitle ?? 'N/A' }}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 12px; background-color: #F9F9F9; border-left: 4px solid #{{ $statusColor }}; margin-bottom: 10px;">
                        <table style="width:100%;">
                            <tr>
                                <td style="padding: 8px 0; font-size: 12px; color: #666;">Previous Status</td>
                                <td style="padding: 8px 0; text-align: right; font-size: 13px;"><span style="background-color: #E9ECEF; padding: 4px 12px; border-radius: 12px;">{{ ucfirst($previousStatus) ?? 'N/A' }}</span></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 4px 0;"><p style="text-align: center; margin: 5px 0; color: #666;">↓</p></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 12px; color: #666;">Current Status</td>
                                <td style="padding: 8px 0; text-align: right; font-size: 13px;"><span style="background-color: {{ $statusColor }}22; padding: 4px 12px; border-radius: 12px; color: {{ $statusColor }}; font-weight: 600;">{{ ucfirst($newStatus) }}</span></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            @if($statusMessage)
            <table style="width:100%; margin-top: 15px; padding: 15px; background-color: #E8F4F8; border-left: 4px solid #17A2B8;">
                <tr>
                    <td>
                        <p style="margin: 0; font-size: 13px; color: #1E1E1E;">
                            <strong>Update:</strong><br>
                            {{ $statusMessage }}
                        </p>
                    </td>
                </tr>
            </table>
            @endif

            <table style="width:100%; margin-top: 20px;">
                <tr>
                    <td style="font-size: 13px; color: #666;">
                        <strong>Next Steps:</strong><br>
                        Our team will continue to review your application. You will receive further updates as your application progresses through our recruitment process.
                    </td>
                </tr>
            </table>

            @if($applicationUrl)
            <table style="width:100%; text-align: center; margin-top: 20px;">
                <tr>
                    <td>
                        <a href="{{ $applicationUrl }}" style="display: inline-block; padding: 12px 30px; background-color: #5146E6; color: white; text-decoration: none; border-radius: 5px; font-weight: 600;">
                            View Your Application
                        </a>
                    </td>
                </tr>
            </table>
            @endif

            <p style="margin-top: 15px; font-size: 12px; color: #666;">If you have any questions, please don't hesitate to reach out to us.</p>
        </td>
    </tr>
    <!-- EMAIL BODY END -->

    <!-- SOCIAL + CONTACT FOOTER -->
    <tr>
        <td style="padding: 25px 20px 5px 20px;">
            <table style="width: 100%;border-top:1px solid #f2f2f2;">
                <tr>
                    <td style="padding: 20px;">
                        <table align="center">
                            <tr>
                                @if(optional($setting)->facebook_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->facebook_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/facebookicon.png" alt="Facebook icon">
                                        </a>
                                    </td>
                                @endif
                                @if(optional($setting)->twitter_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->twitter_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/twittericon.png" alt="Twitter icon">
                                        </a>
                                    </td>
                                @endif
                                @if(optional($setting)->instagram_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->instagram_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/instagram.png" alt="Instagram icon">
                                        </a>
                                    </td>
                                @endif
                                @if(optional($setting)->linkedin_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->linkedin_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/linkedin.png" alt="LinkedIn icon">
                                        </a>
                                    </td>
                                @endif
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 0 0 30px;">
                        <table style="width: 100%;" align="center">
                            <tr>
                                <td>
                                    <table>
                                        <tr>
                                            <td><img src="https://task.laraveldevelopmentcompany.com/images/phone.png" alt="Phone icon"></td>
                                            <td style="font-size: 12px; font-weight: 500; color: #1E1E1E;">
                                                <p style="margin: 1px;">
                                                    {{ optional($setting)->site_phone ?? '(+34) 12233444' }}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td>
                                    <table>
                                        <tr>
                                            <td><img src="https://task.laraveldevelopmentcompany.com/images/mailicon.png" alt="Email icon"></td>
                                            <td style="font-size: 12px; font-weight: 500; color: #1E1E1E;">
                                                <p style="margin: 1px;">
                                                    <a href="mailto:{{ optional($setting)->site_email ?? 'info@company.com' }}" style="text-decoration: none;">
                                                        <span style="color: #1E1E1E!important;">
                                                            {{ optional($setting)->site_email ?? 'info@company.com' }}
                                                        </span>
                                                    </a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 10px 10px; border-top: 1px solid #f2f2f2; font-size: 10px; font-weight: 400; text-align: center;">
                        ©  {{ optional($setting)->site_name ?? 'Your Company Name' }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
