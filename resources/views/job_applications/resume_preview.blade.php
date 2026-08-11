<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Preview - {{ $resume['name'] ?? 'Candidate' }}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            font-family: Inter, Arial, sans-serif;
            background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
            color: #0f172a;
        }
        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 28px;
        }
        .card {
            background: #ffffff;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
            border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 18px 28px;
            border-bottom: 1px solid #e2e8f0;
            background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
            color: #ffffff;
        }
        .topbar-title {
            font-size: 18px;
            font-weight: 700;
        }
        .topbar-subtitle {
            margin-top: 4px;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.75);
        }
        .status-pill {
            display: inline-flex;
            align-items: center;
            padding: 8px 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.18);
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        }
        .content {
            padding: 28px;
        }
        .hero {
            display: flex;
            justify-content: space-between;
            gap: 28px;
            align-items: stretch;
            flex-wrap: wrap;
        }
        .hero-main {
            flex: 1 1 580px;
        }
        .hero-side {
            width: 240px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 18px;
        }
        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 700;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 14px;
        }
        h1 {
            margin: 0;
            font-size: 40px;
            line-height: 1.05;
            letter-spacing: -0.03em;
        }
        .subtitle {
            margin-top: 10px;
            font-size: 22px;
            font-weight: 600;
            color: #334155;
        }
        .company {
            margin-top: 8px;
            font-size: 15px;
            color: #6366f1;
            font-weight: 600;
        }
        .meta {
            margin-top: 22px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .meta-item {
            padding: 10px 14px;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            font-size: 14px;
            color: #334155;
        }
        .note {
            margin-top: 20px;
            padding: 14px 16px;
            border-radius: 18px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            color: #92400e;
            font-size: 14px;
            line-height: 1.6;
        }
        .photo {
            width: 92px;
            height: 92px;
            border-radius: 24px;
            object-fit: cover;
            border: 1px solid #cbd5e1;
            display: block;
            margin-bottom: 16px;
        }
        .section {
            margin-top: 28px;
        }
        .section-title {
            margin: 0 0 14px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
        }
        .section-body {
            color: #334155;
            line-height: 1.6;
            white-space: pre-line;
            font-size: 15px;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill {
            padding: 8px 14px;
            border-radius: 999px;
            background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
            color: #3730a3;
            font-size: 13px;
            font-weight: 600;
            border: 1px solid #c7d2fe;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
        }
        .item {
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 18px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .item-title {
            font-weight: 700;
            color: #0f172a;
            font-size: 16px;
        }
        .item-subtitle {
            margin-top: 8px;
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
        }
        .side-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            margin-bottom: 12px;
        }
        .side-list {
            display: grid;
            gap: 12px;
        }
        .side-card {
            padding: 14px;
            border-radius: 18px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
        }
        .side-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 6px;
        }
        .side-value {
            font-size: 15px;
            color: #0f172a;
            font-weight: 600;
        }
        .empty-state {
            padding: 22px;
            border-radius: 22px;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
        }
        .empty-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #0f172a;
        }
        .muted {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
        }
        a {
            color: #4338ca;
        }
        @media (max-width: 768px) {
            .container {
                padding: 12px;
            }
            .content {
                padding: 18px;
            }
            .topbar {
                padding: 16px 18px;
            }
            h1 {
                font-size: 32px;
            }
            .hero-side {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    @php
        $experience = $resume['experience'] ?? [];
        $education = collect($resume['education'] ?? [])->filter(function ($item) {
            return !empty($item['title']) || !empty($item['subtitle']);
        })->values();
        $projects = $resume['projects'] ?? [];
        $hasContent = !empty($resume['summary']) || !empty($resume['skills']) || !empty(array_filter($experience)) || $education->isNotEmpty() || !empty($projects);
    @endphp

    <div class="container">
        <div class="card">
            <div class="topbar">
                <div>
                    <div class="topbar-title">Generated Resume Preview</div>
                    <div class="topbar-subtitle">Built from candidate profile and application snapshot.</div>
                </div>
                <div class="status-pill">Fallback Preview Active</div>
            </div>

            <div class="content">
                <div class="hero">
                    <div class="hero-main">
                        <div class="eyebrow">Candidate Snapshot</div>
                        <h1>{{ $resume['name'] ?? 'Candidate' }}</h1>
                        @if(!empty($resume['job_title']))
                            <div class="subtitle">{{ $resume['job_title'] }}</div>
                        @endif
                        @if(!empty($resume['company']))
                            <div class="company">{{ $resume['company'] }}</div>
                        @endif

                        <div class="meta">
                            @if(!empty($resume['email']))
                                <div class="meta-item">{{ $resume['email'] }}</div>
                            @endif
                            @if(!empty($resume['phone']))
                                <div class="meta-item">{{ $resume['phone'] }}</div>
                            @endif
                            @if(!empty($resume['location']))
                                <div class="meta-item">{{ $resume['location'] }}</div>
                            @endif
                        </div>

                        <div class="note">
                            The originally uploaded resume file is unavailable, so this version is generated from the candidate information currently saved in the system.
                        </div>
                    </div>

                    <div class="hero-side">
                        @if(!empty($resume['profile_photo_url']))
                            <img src="{{ $resume['profile_photo_url'] }}" alt="{{ $resume['name'] ?? 'Candidate' }}" class="photo">
                        @endif

                        <div class="side-title">Quick Overview</div>
                        <div class="side-list">
                            @if(!empty($experience['total_years']))
                                <div class="side-card">
                                    <div class="side-label">Experience</div>
                                    <div class="side-value">{{ $experience['total_years'] }}</div>
                                </div>
                            @endif

                            @if(!empty($experience['current_designation']))
                                <div class="side-card">
                                    <div class="side-label">Current Designation</div>
                                    <div class="side-value">{{ $experience['current_designation'] }}</div>
                                </div>
                            @endif

                            @if(!empty($experience['current_company']))
                                <div class="side-card">
                                    <div class="side-label">Current Company</div>
                                    <div class="side-value">{{ $experience['current_company'] }}</div>
                                </div>
                            @endif

                            @if(!empty($experience['expected_salary_amount']))
                                <div class="side-card">
                                    <div class="side-label">Expected Salary</div>
                                    <div class="side-value">{{ $experience['expected_salary_amount'] }} {{ $experience['expected_salary_unit'] ?? '' }}</div>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                @if(!empty($resume['summary']))
                    <div class="section">
                        <h2 class="section-title">Professional Summary</h2>
                        <div class="section-body">{{ $resume['summary'] }}</div>
                    </div>
                @endif

                @if(!empty($resume['skills']))
                    <div class="section">
                        <h2 class="section-title">Key Skills</h2>
                        <div class="skills">
                            @foreach($resume['skills'] as $skill)
                                <span class="skill">{{ $skill }}</span>
                            @endforeach
                        </div>
                    </div>
                @endif

                @if(!empty(array_filter($experience)))
                    <div class="section">
                        <h2 class="section-title">Experience Snapshot</h2>
                        <div class="grid">
                            @if(!empty($experience['total_years']))
                                <div class="item">
                                    <div class="item-title">Total Experience</div>
                                    <div class="item-subtitle">{{ $experience['total_years'] }}</div>
                                </div>
                            @endif
                            @if(!empty($experience['current_company']))
                                <div class="item">
                                    <div class="item-title">Current Company</div>
                                    <div class="item-subtitle">{{ $experience['current_company'] }}</div>
                                </div>
                            @endif
                            @if(!empty($experience['current_designation']))
                                <div class="item">
                                    <div class="item-title">Current Designation</div>
                                    <div class="item-subtitle">{{ $experience['current_designation'] }}</div>
                                </div>
                            @endif
                            @if(!empty($experience['last_salary_amount']))
                                <div class="item">
                                    <div class="item-title">Last Salary</div>
                                    <div class="item-subtitle">{{ $experience['last_salary_amount'] }} {{ $experience['last_salary_unit'] ?? '' }}</div>
                                </div>
                            @endif
                            @if(!empty($experience['expected_salary_amount']))
                                <div class="item">
                                    <div class="item-title">Expected Salary</div>
                                    <div class="item-subtitle">{{ $experience['expected_salary_amount'] }} {{ $experience['expected_salary_unit'] ?? '' }}</div>
                                </div>
                            @endif
                        </div>
                    </div>
                @endif

                @if($education->isNotEmpty())
                    <div class="section">
                        <h2 class="section-title">Education</h2>
                        <div class="grid">
                            @foreach($education as $item)
                                <div class="item">
                                    <div class="item-title">{{ $item['title'] ?: 'Education' }}</div>
                                    @if(!empty($item['subtitle']))
                                        <div class="item-subtitle">{{ $item['subtitle'] }}</div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                @if(!empty($projects))
                    <div class="section">
                        <h2 class="section-title">Projects</h2>
                        <div class="grid">
                            @foreach($projects as $project)
                                <div class="item">
                                    <div class="item-title">{{ $project['title'] ?: 'Project' }}</div>
                                    @if(!empty($project['description']))
                                        <div class="item-subtitle">{{ $project['description'] }}</div>
                                    @endif
                                    @if(!empty($project['link']))
                                        <div class="item-subtitle">
                                            <a href="{{ $project['link'] }}" target="_blank" rel="noreferrer">{{ $project['link'] }}</a>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                @if(!$hasContent)
                    <div class="section">
                        <div class="empty-state">
                            <div class="empty-title">Limited Resume Data Available</div>
                            <div class="muted">
                                Detailed resume sections were not found in the saved candidate profile. Only the application snapshot and contact details are available for preview.
                            </div>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</body>
</html>
