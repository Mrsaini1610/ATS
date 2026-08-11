@php
    $formattedDate = \Carbon\Carbon::parse($applicationDate)->format('M d, Y');
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
            <p>Thank you for applying! We have successfully received your job application for the position.</p>

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
                            @if($jobPosition)
                            <tr>
                                <td style="padding: 8px 0; font-size: 12px; color: #666;">{{ $jobPosition }}</td>
                            </tr>
                            @endif
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px;">
                        <table style="width:100%; border-top: 1px solid #ddd;">
                            <tr>
                                <td style="padding: 12px 0; font-size: 13px;">
                                    <strong>Application Date:</strong> {{ $formattedDate }}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; font-size: 13px;">
                                    <strong>Application Status:</strong> <span style="color: #28a745;">Submitted</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <p style="margin-top: 20px; font-size: 14px;">Our hiring team will review your application and may reach out to you soon. We appreciate your interest and will keep you updated throughout the process.</p>

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

            <p style="margin-top: 15px; font-size: 12px; color: #666;">If you have any questions about your application, please don't hesitate to contact us.</p>
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
