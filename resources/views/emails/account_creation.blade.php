@php
    $departments = !empty($departmentNames) ? implode(', ', (array) $departmentNames) : 'N/A';
    $designations = !empty($designationNames) ? implode(', ', (array) $designationNames) : 'N/A';
    $loginLink = $loginUrl ?? url('/login');
    $typeLabel = ucwords(str_replace('_', ' ', $accountType ?? 'member'));
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
            <p>Hi <strong>{{ $name ?? 'User' }}</strong>,</p>
            <p>Your {{ $typeLabel }} account has been successfully created. Below are your login details:</p>

            <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Username:</td>
                    <td style="padding: 8px;">{{ $username ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Password:</td>
                    <td style="padding: 8px;">{{ $password ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Login URL:</td>
                    <td style="padding: 8px;">
                        <a href="{{ $loginLink }}">{{ $loginLink }}</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Email:</td>
                    <td style="padding: 8px;">{{ $email ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Email Password:</td>
                    <td style="padding: 8px;">{{ $emailPassword ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Department(s):</td>
                    <td style="padding: 8px;">{{ $departments }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Designation(s):</td>
                    <td style="padding: 8px;">{{ $designations }}</td>
                </tr>
            </table>

            <p style="margin-top: 20px;">Please log in using this temporary password and reset it immediately after your first login.</p>
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
                                                    <a href="mailto:{{ optional($setting)->site_email ?? 'info@Shahsitask@gmail.com' }}" style="text-decoration: none;">
                                                        <span style="color: #1E1E1E!important;">
                                                            {{ optional($setting)->site_email ?? 'info@Shahsitask@gmail.com' }}
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
                        ©  {{ optional($setting)->site_name ?? 'www.shashi.com' }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
