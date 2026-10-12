<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Updated</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    @php
        $badgeColors = [
            'shortlisted' => ['bg' => '#DCFCE7', 'text' => '#15803D', 'border' => '#22C55E', 'header' => '#16A34A', 'title' => 'Congratulations! You are Shortlisted 🎉'],
            'interview' => ['bg' => '#DBEAFE', 'text' => '#1D4ED8', 'border' => '#3B82F6', 'header' => '#2563EB', 'title' => 'Interview Update 📅'],
            'interview_scheduled' => ['bg' => '#DBEAFE', 'text' => '#1D4ED8', 'border' => '#3B82F6', 'header' => '#2563EB', 'title' => 'Interview Scheduled 📅'],
            'calling_approved' => ['bg' => '#DCFCE7', 'text' => '#15803D', 'border' => '#22C55E', 'header' => '#16A34A', 'title' => 'Phone Screening Cleared ✅'],
            'offer_letter_generated' => ['bg' => '#FEF3C7', 'text' => '#B45309', 'border' => '#F59E0B', 'header' => '#D97706', 'title' => 'Offer Extended 🏆'],
            'hired' => ['bg' => '#DCFCE7', 'text' => '#15803D', 'border' => '#16A34A', 'header' => '#059669', 'title' => 'Congratulations! You are Hired 🏆'],
            'rejected' => ['bg' => '#FEE2E2', 'text' => '#B91C1C', 'border' => '#EF4444', 'header' => '#DC2626', 'title' => 'Application Status Update'],
            'calling_rejected' => ['bg' => '#FEE2E2', 'text' => '#B91C1C', 'border' => '#EF4444', 'header' => '#DC2626', 'title' => 'Application Status Update'],
            'not_selected' => ['bg' => '#FEE2E2', 'text' => '#B91C1C', 'border' => '#EF4444', 'header' => '#DC2626', 'title' => 'Application Status Update'],
        ];

        $statusKey = strtolower($newStatus);
        $theme = $badgeColors[$statusKey] ?? ['bg' => '#EEF2FF', 'text' => '#4338CA', 'border' => '#6366F1', 'header' => '#4F46E5', 'title' => 'Application Status Update'];
        $formattedStatus = ucwords(str_replace('_', ' ', $newStatus));
    @endphp

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: {{ $theme['header'] }}; padding: 30px 20px;">
                <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                    {{ $theme['title'] }}
                </div>
                <div style="font-size: 13px; color: #FFFFFF; opacity: 0.9; margin-top: 4px; font-weight: 500;">
                    {{ config('app.name', 'ATS') }} Application Status Center
                </div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #4B5563;">
                    Dear <strong>{{ $candidateName }}</strong>,
                </p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                    Your application status for <strong>{{ $jobTitle }}</strong> at <strong>{{ $companyName }}</strong> has been updated.
                </p>

                <!-- Status Progress Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: {{ $theme['bg'] }}; border-radius: 8px; border: 1px solid {{ $theme['border'] }}; margin: 20px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size: 13px; color: #4B5563; padding-bottom: 6px;">New Application Status:</td>
                                </tr>
                                <tr>
                                    <td>
                                        <div style="display: inline-block; font-size: 18px; font-weight: 800; color: {{ $theme['text'] }};">
                                            {{ $formattedStatus }}
                                        </div>
                                    </td>
                                </tr>
                                @if(!empty($comments))
                                <tr>
                                    <td style="padding-top: 12px; font-size: 13px; color: #374151; border-top: 1px dashed {{ $theme['border'] }}; margin-top: 10px;">
                                        <strong>Notes from Recruiter:</strong> {{ $comments }}
                                    </td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #6B7280; margin: 15px 0;">
                    <tr>
                        <td style="padding: 4px 0; width: 35%;">Job Title:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ $jobTitle }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;">Company:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ $companyName }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;">Updated On:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #111827;">{{ now()->format('d M Y, h:i A') }}</td>
                    </tr>
                </table>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 20px 0 10px;">
                            <a href="{{ $actionUrl ?? url('/my-applications') }}" style="display: inline-block; background-color: {{ $theme['header'] }}; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 30px; border-radius: 8px;">
                                View Application Details
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F9FAFB; padding: 18px 28px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF;">
                <p style="margin: 0;">Sent by {{ config('app.name', 'ATS') }} Career Portal.</p>
            </td>
        </tr>
    </table>
</body>
</html>
