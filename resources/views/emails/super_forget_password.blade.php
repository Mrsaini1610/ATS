<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
</style>

<table align="center" style="width: 100%; max-width: 450px; font-family: Inter, sans-serif; border: 1px solid #f2f2f2;">
    <tr>
        <td align="center" style="background-color: #5146E6; padding: 10px;">
            @if($setting && $setting->dark_logo_url)
                <img src="{{ $setting->dark_logo_url }}" alt="Logo" style="max-height: 50px;">
            @else
                <img src="https://task.laraveldevelopmentcompany.com/images/logo.png" alt="Logo" style="max-height: 50px;">
            @endif
        </td>
    </tr>

    <tr>
        <td align="center" style="padding: 40px 0 30px; background-color: #ffffff;">
            <img src="https://task.laraveldevelopmentcompany.com/images/forgetpassicon.png" alt="Password Reset Icon">
        </td>
    </tr>

    <tr>
        <td>
            <p style="margin: 1px; font-size: 24px; font-weight: 500; text-align: center;">Reset Your Password</p>
        </td>
    </tr>

    <tr>
        <td style="padding: 10px 20px 2px; text-align: center;">
            <p style="margin: 1px; font-size: 15px; font-weight: 500; color: #727272;">
                We received a request to reset your password. Click the button below to reset it.
            </p>
        </td>
    </tr>

    <tr>
        <td style="padding: 20px; text-align: center;">
            <a href="{{ $resetUrl }}" style="background-color: #5146E6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 500; display: inline-block;">
                Reset Password
            </a>
        </td>
    </tr>

    <tr>
        <td style="padding: 2px 20px 20px; text-align: center;">
            <p style="margin: 1px; font-size: 12px; font-weight: 500; color: #727272;">
                This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
            </p>
        </td>
    </tr>

    {{-- Footer --}}
    <tr>
        <td style="padding: 35px 20px 5px;">
            <table style="width: 100%; border-top: 1px solid #f2f2f2;">
                <tr>
                    <td style="padding: 20px;">
                        <table align="center">
                            <tr>
                                @if($setting && $setting->facebook_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->facebook_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/facebookicon.png" alt="Facebook">
                                        </a>
                                    </td>
                                @endif

                                @if($setting && $setting->twitter_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->twitter_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/twittericon.png" alt="Twitter">
                                        </a>
                                    </td>
                                @endif

                                @if($setting && $setting->instagram_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->instagram_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/instagram.png" alt="Instagram">
                                        </a>
                                    </td>
                                @endif

                                @if($setting && $setting->linkedin_url)
                                    <td style="padding: 0 15px;">
                                        <a href="{{ $setting->linkedin_url }}">
                                            <img src="https://task.laraveldevelopmentcompany.com/images/linkedin.png" alt="LinkedIn">
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
                                @if($setting && $setting->site_phone)
                                    <td>
                                        <table>
                                            <tr>
                                                <td><img src="https://task.laraveldevelopmentcompany.com/images/phone.png" alt="Phone"></td>
                                                <td style="font-size: 12px; font-weight: 500; color: #1E1E1E;">
                                                    <p style="margin: 1px;">{{ $setting->site_phone }}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                @endif

                                @if($setting && $setting->site_email)
                                    <td>
                                        <table>
                                            <tr>
                                                <td><img src="https://task.laraveldevelopmentcompany.com/images/mailicon.png" alt="Email"></td>
                                                <td style="font-size: 12px; font-weight: 500; color: #1E1E1E;">
                                                    <p style="margin: 1px;">
                                                        <a href="mailto:{{ $setting->site_email }}" style="text-decoration: none; color: #1E1E1E !important;">
                                                            {{ $setting->site_email }}
                                                        </a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                @endif
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 10px; border-top: 1px solid #f2f2f2; font-size: 10px; font-weight: 400; text-align: center;">
                        © {{ date('Y') }}
                        @if($setting && $setting->site_name)
                            {{ $setting->site_name }}
                        @else
                            www.shashi.com
                        @endif
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
