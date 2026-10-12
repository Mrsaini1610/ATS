<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Post Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 30px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 30px 20px;">
                <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px;">
                    📢 {{ config('app.name', 'ATS') }} - Job Alert
                </div>
                <div style="font-size: 13px; color: #DBEAFE; margin-top: 4px; font-weight: 500;">
                    {{ $headerSubtitle ?? 'New Job Opportunity Published' }}
                </div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 28px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #4B5563;">
                    Hello <strong>{{ $recipientName ?? 'Team' }}</strong>,
                </p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                    {{ $messageIntro ?? 'A new job opening has been published in the system.' }}
                </p>

                <!-- Job Highlight Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 8px; border-left: 4px solid #2563EB; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; margin: 20px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <div style="font-size: 18px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">
                                {{ $job->title }}
                            </div>
                            <div style="font-size: 14px; font-weight: 600; color: #2563EB; margin-bottom: 16px;">
                                🏢 {{ $job->company ?? ($job->companyRelation?->name ?? 'ATS Partner') }}
                            </div>

                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                                <tr>
                                    <td style="padding: 5px 0; color: #64748B; width: 35%;">📍 Location:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1E293B;">{{ $job->location ?? 'Not specified' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #64748B;">💰 Salary:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #059669;">
                                        @if($job->min_salary && $job->max_salary)
                                            ₹{{ number_format($job->min_salary) }} - ₹{{ number_format($job->max_salary) }} / {{ $job->salary_type ?? 'monthly' }}
                                        @elseif($job->min_salary)
                                            ₹{{ number_format($job->min_salary) }}+ / {{ $job->salary_type ?? 'monthly' }}
                                        @else
                                            Competitive
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #64748B;">💼 Job Type:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1E293B;">{{ $job->job_type ?? 'Full Time' }} ({{ $job->openings ?? 1 }} Openings)</td>
                                </tr>
                                @if(!empty($job->experience))
                                <tr>
                                    <td style="padding: 5px 0; color: #64748B;">🎓 Experience:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1E293B;">{{ $job->experience }}</td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="padding: 5px 0; color: #64748B;">👤 Created By:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #1E293B;">{{ $job->creator?->name ?? 'Admin' }}</td>
                                </tr>
                                @if($job->assignedMember)
                                <tr>
                                    <td style="padding: 5px 0; color: #64748B;">🎯 Assigned To:</td>
                                    <td style="padding: 5px 0; font-weight: 600; color: #7C3AED;">{{ $job->assignedMember->name }} ({{ $job->assignedMember->role }})</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Action Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 15px 0;">
                            <a href="{{ $actionUrl ?? url('/admin/jobs') }}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                                View Job in Portal
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 18px 28px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
                <p style="margin: 0;">Sent by {{ config('app.name', 'ATS') }} Automated Notification Center.</p>
            </td>
        </tr>
    </table>
</body>
</html>
