<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Super Admin Notification' }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); padding: 30px 24px; border-bottom: 3px solid #6366F1;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <div style="display: inline-block; background-color: #4338CA; color: #E0E7FF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px;">
                                🛡️ Super Admin Control Alert
                            </div>
                            <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.3px;">
                                {{ config('app.name', 'ATS') }} Admin Center
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <div style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">
                    {{ $alertTitle ?? 'System Notification' }}
                </div>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #334155;">
                    {{ $alertMessage ?? 'An activity has taken place on the ATS platform.' }}
                </p>

                @if(!empty($details) && is_array($details))
                <!-- Key Details Table -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin: 20px 0;">
                    <tr>
                        <td style="padding: 16px 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                                @foreach($details as $key => $val)
                                    @if(!is_array($val) && !is_object($val))
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748B; width: 38%; font-weight: 500;">
                                            {{ ucwords(str_replace('_', ' ', $key)) }}:
                                        </td>
                                        <td style="padding: 6px 0; font-weight: 600; color: #0F172A;">
                                            {{ (string)$val }}
                                        </td>
                                    </tr>
                                    @endif
                                @endforeach
                                <tr>
                                    <td style="padding: 6px 0; color: #64748B;">Timestamp:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #0F172A;">{{ now()->format('d M Y, h:i:s A') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                @endif

                <!-- Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 15px 0;">
                            <a href="{{ $actionUrl ?? url('/admin') }}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                                Open Super Admin Console
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 16px 28px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">Automated high-priority alert for Super Admin. Delivered from {{ config('app.name', 'ATS') }}.</p>
            </td>
        </tr>
    </table>
</body>
</html>
