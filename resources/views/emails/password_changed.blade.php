<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Changed Notification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .header {
            background-color: #5146E6;
            padding: 20px;
            text-align: center;
        }

        .content {
            padding: 30px;
        }

        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #727272;
            border-top: 1px solid #f2f2f2;
            background-color: #f9f9f9;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #5146E6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin: 20px 0;
        }

        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #5146E6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .social-icons {
            margin: 15px 0;
        }

        .social-icons a {
            margin: 0 10px;
            display: inline-block;
        }

        .contact-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 15px 0;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    </style>
</head>
<body>
    <table class="email-container" align="center">
        <!-- Header with Logo -->
        <tr>
            <td class="header">
                @if(isset($setting) && $setting->dark_logo_url)
                    <img src="{{ $setting->dark_logo_url }}" alt="Logo" style="max-height: 50px;">
                @else
                    <img src="https://task.laraveldevelopmentcompany.com/images/logo.png" alt="Logo" style="max-height: 50px;">
                @endif
            </td>
        </tr>

        <!-- Main Content -->
        <tr>
            <td class="content">
                <h2 style="text-align: center; color: #5146E6;">Your Password Has Been Changed</h2>

                <p>Hello <strong>{{ $member->name }}</strong>,</p>

                <p>Your account password was recently changed by a super administrator (<strong>{{ $superAdminName }}</strong>).</p>

                <div class="info-box">
                    <p style="margin: 0;">Your new password is: <strong>{{ $newPassword }}</strong></p>
                </div>

                <p>For security reasons, we recommend that you:</p>
                <ol>
                    <li>Log in to your account using this new password</li>
                    <li>Change your password to something more memorable</li>
                    <li>Ensure your new password is strong and unique</li>
                </ol>

                <div style="text-align: center;">
                    <a href="{{ url('/login') }}" class="button">Login to Your Account</a>
                </div>

                <p>If you did not request this change or believe it was made in error, please contact our support team immediately.</p>

                <p>Best regards,<br>Support Team</p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td class="footer">
                <!-- Social Media Links -->
                @if(isset($setting) && ($setting->facebook_url || $setting->twitter_url || $setting->instagram_url || $setting->linkedin_url))
                <div class="social-icons">
                    @if($setting->facebook_url)
                        <a href="{{ $setting->facebook_url }}">
                            <img src="https://task.laraveldevelopmentcompany.com/images/facebookicon.png" alt="Facebook" width="24">
                        </a>
                    @endif

                    @if($setting->twitter_url)
                        <a href="{{ $setting->twitter_url }}">
                            <img src="https://task.laraveldevelopmentcompany.com/images/twittericon.png" alt="Twitter" width="24">
                        </a>
                    @endif

                    @if($setting->instagram_url)
                        <a href="{{ $setting->instagram_url }}">
                            <img src="https://task.laraveldevelopmentcompany.com/images/instagram.png" alt="Instagram" width="24">
                        </a>
                    @endif

                    @if($setting->linkedin_url)
                        <a href="{{ $setting->linkedin_url }}">
                            <img src="https://task.laraveldevelopmentcompany.com/images/linkedin.png" alt="LinkedIn" width="24">
                        </a>
                    @endif
                </div>
                @endif

                <!-- Contact Information -->
                @if(isset($setting) && ($setting->site_phone || $setting->site_email))
                <div class="contact-info">
                    @if($setting->site_phone)
                    <div class="contact-item">
                        <img src="https://task.laraveldevelopmentcompany.com/images/phone.png" alt="Phone" width="16">
                        <span>{{ $setting->site_phone }}</span>
                    </div>
                    @endif

                    @if($setting->site_email)
                    <div class="contact-item">
                        <img src="https://task.laraveldevelopmentcompany.com/images/mailicon.png" alt="Email" width="16">
                        <a href="mailto:{{ $setting->site_email }}" style="color: #727272; text-decoration: none;">{{ $setting->site_email }}</a>
                    </div>
                    @endif
                </div>
                @endif

                <!-- Copyright -->
                <p style="margin-top: 20px;">
                    © {{ date('Y') }}
                    @if(isset($setting) && $setting->site_name)
                        {{ $setting->site_name }}
                    @else
                        Your Company Name
                    @endif
                    . All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
