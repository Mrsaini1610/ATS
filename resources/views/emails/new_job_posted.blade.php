<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Opportunity - {{ config('app.name', 'ATS') }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 30px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04); border: 1px solid #E2E8F0;">
        <!-- Top Branded Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #6366F1 100%); padding: 32px 30px; text-align: left;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <div style="display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 4px 14px; font-size: 11px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                                🚀 New Opening Alert
                            </div>
                            <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; line-height: 1.25; letter-spacing: -0.5px;">
                                {{ $job->title }}
                            </div>
                            <div style="font-size: 15px; color: #E0E7FF; margin-top: 6px; font-weight: 600;">
                                🏢 {{ $job->company ?? ($job->companyRelation?->name ?? 'ATS Hiring Partner') }}
                                @if(!empty($job->location))
                                    &nbsp;•&nbsp; 📍 {{ $job->location }}
                                @endif
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Main Content -->
        <tr>
            <td style="padding: 32px 30px;">
                <p style="margin: 0 0 18px; font-size: 15px; color: #475569; line-height: 1.6;">
                    Hello <strong>{{ $recipientName ?? 'Candidate' }}</strong>,<br>
                    {{ $messageIntro ?? 'A verified job opportunity matching in-demand skills has just been published on our hiring portal. Review the highlights below and apply before applications close.' }}
                </p>

                <!-- Salary & Compensation Highlight Box -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 12px; border: 1.5px solid #10B981; margin: 20px 0 24px;">
                    <tr>
                        <td style="padding: 18px 22px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.8px;">
                                            Offered Salary / CTC ({{ strtoupper($job->salary_type ?? 'Monthly') }})
                                        </div>
                                        <div style="font-size: 22px; font-weight: 900; color: #065F46; margin-top: 4px;">
                                            @if($job->min_salary && $job->max_salary)
                                                ₹{{ number_format((float)$job->min_salary) }} - ₹{{ number_format((float)$job->max_salary) }} <span style="font-size: 13px; font-weight: 600; color: #047857;">/ {{ $job->salary_type ?? 'month' }}</span>
                                            @elseif($job->min_salary)
                                                ₹{{ number_format((float)$job->min_salary) }}+ <span style="font-size: 13px; font-weight: 600; color: #047857;">/ {{ $job->salary_type ?? 'month' }}</span>
                                            @else
                                                Best in Industry / Competitive
                                            @endif
                                        </div>
                                    </td>
                                    @if($job->bonus_offered === 'yes')
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="background-color: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;">
                                            + Bonus Included
                                        </span>
                                    </td>
                                    @endif
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Key Role Details Grid -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 16px 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13.5px; line-height: 1.8;">
                                <tr>
                                    <td style="color: #64748B; width: 40%; padding: 4px 0;">💼 Job Type:</td>
                                    <td style="color: #0F172A; font-weight: 700; padding: 4px 0;">{{ $job->job_type ?? 'Full Time' }} ({{ $job->openings ?? 1 }} {{ ($job->openings ?? 1) > 1 ? 'Openings' : 'Opening' }})</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; padding: 4px 0;">📍 Location / Mode:</td>
                                    <td style="color: #0F172A; font-weight: 700; padding: 4px 0;">{{ $job->location ?? 'Location Flexible' }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748B; padding: 4px 0;">🎓 Experience:</td>
                                    <td style="color: #0F172A; font-weight: 700; padding: 4px 0;">{{ $job->experience ?? 'Any Experience / Freshers Welcome' }}</td>
                                </tr>
                                @if(!empty($job->shift_timing) || !empty($job->working_days))
                                <tr>
                                    <td style="color: #64748B; padding: 4px 0;">⏰ Schedule:</td>
                                    <td style="color: #0F172A; font-weight: 600; padding: 4px 0;">
                                        {{ $job->working_days ?? 'General Days' }} @if(!empty($job->shift_timing)) ({{ $job->shift_timing }}) @endif
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($job->last_date))
                                <tr>
                                    <td style="color: #64748B; padding: 4px 0;">⏳ Last Apply Date:</td>
                                    <td style="color: #DC2626; font-weight: 700; padding: 4px 0;">{{ is_object($job->last_date) ? $job->last_date->format('d M Y') : date('d M Y', strtotime($job->last_date)) }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Skills & Perks Tags -->
                @php
                    $skills = is_array($job->skills) ? $job->skills : (json_decode($job->skills, true) ?: []);
                    $perks = is_array($job->perks) ? $job->perks : (json_decode($job->perks, true) ?: []);
                @endphp

                @if(!empty($skills))
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Required Skills
                    </div>
                    <div>
                        @foreach(array_slice($skills, 0, 6) as $skill)
                            <span style="display: inline-block; background-color: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 0 4px 6px 0;">
                                {{ $skill }}
                            </span>
                        @endforeach
                    </div>
                </div>
                @endif

                @if(!empty($perks))
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Benefits & Perks
                    </div>
                    <div>
                        @foreach(array_slice($perks, 0, 5) as $perk)
                            <span style="display: inline-block; background-color: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin: 0 4px 6px 0;">
                                ✓ {{ $perk }}
                            </span>
                        @endforeach
                    </div>
                </div>
                @endif

                <!-- Big CTA Button -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 12px;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/job/' . ($job->uuid ?? $job->id)) }}" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 38px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); letter-spacing: 0.3px;">
                                Apply for this Job →
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 10px;">
                            <span style="font-size: 12px; color: #94A3B8;">Free application · 100% Verified Job · Direct Recruiter Connect</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 22px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.6;">
                <p style="margin: 0 0 6px; font-weight: 600; color: #64748B;">
                    {{ config('app.name', 'ATS') }} - India's Direct Hiring & Recruitment Platform
                </p>
                <p style="margin: 0;">
                    You received this job alert because your profile matches open job requirements.<br>
                    To manage your job preferences, please visit your candidate profile settings.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
