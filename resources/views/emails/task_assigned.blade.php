<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Assigned Notification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        .email-header {
            background-color: #5146E6;
            padding: 20px;
            text-align: center;
        }

        .email-body {
            padding: 20px;
        }

        .task-icon {
            text-align: center;
            padding: 30px 0;
        }

        .task-details {
            border: 1px solid #f2f2f2;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }

        .task-detail-item {
            margin-bottom: 15px;
        }

        .task-detail-label {
            font-weight: 600;
            color: #555;
        }

        .email-footer {
            border-top: 1px solid #f2f2f2;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }

        .social-links {
            text-align: center;
            margin: 20px 0;
        }

        .social-link {
            display: inline-block;
            margin: 0 10px;
        }

        .contact-info {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .contact-item {
            display: flex;
            align-items: center;
            margin: 5px 0;
        }

        .contact-icon {
            margin-right: 8px;
        }

        .copyright {
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #f2f2f2;
        }

        @media (max-width: 480px) {
            .contact-info {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with logo -->
        <div class="email-header">
            @if(isset($setting) && !empty($setting->light_logo_url))
                <img src="{{ $setting->light_logo_url }}" alt="{{ $setting->site_name ?? 'Site Logo' }}" style="max-height: 50px;">
            @else
                <img src="https://task.laraveldevelopmentcompany.com/images/logo.png" alt="Default Logo" style="max-height: 50px;">
            @endif
        </div>

        <!-- Email Body -->
        <div class="email-body">
            <div class="task-icon">
                <img src="https://task.laraveldevelopmentcompany.com/images/taskicon.png" alt="Task Icon" style="max-height: 60px;">
            </div>

            <h2 style="text-align: center; margin-bottom: 30px;">New Task Assigned</h2>

            <p>Hi, <strong>{{ $member->name ?? 'Team Member' }}</strong></p>

            <p>You've been assigned a new task by {{ $assigner->name ?? 'a team member' }} in the {{ $setting->site_name ?? 'Task Tracking' }} system.</p>

            <div class="task-details">
                <div class="task-detail-item">
                    <span class="task-detail-label">Task Title:</span>
                    {{ $task->title ?? 'Untitled Task' }}
                </div>

                <div class="task-detail-item">
                    <span class="task-detail-label">Assigned By:</span>
                    {{ $assigner->name ?? 'Unknown' }}
                </div>

                <div class="task-detail-item">
                    <span class="task-detail-label">Status:</span>
                    {{ isset($task->status) ? ucfirst($task->status) : 'Not specified' }}
                </div>

                <div class="task-detail-item">
                    <span class="task-detail-label">Date:</span>
                    @if(isset($task->start_date) && isset($task->end_date))
                        {{ $task->start_date->format('M d, Y') }} to {{ $task->end_date->format('M d, Y') }}
                    @else
                        Date not specified
                    @endif
                </div>

                @if(isset($task->description) && !empty($task->description))
                <div class="task-detail-item">
                    <span class="task-detail-label">Description:</span>
                    {{ $task->description }}
                </div>
                @endif
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="social-links">
                @if(isset($setting) && !empty($setting->facebook_url))
                    <a href="{{ $setting->facebook_url }}" class="social-link">
                        <img src="https://task.laraveldevelopmentcompany.com/images/facebookicon.png" alt="Facebook">
                    </a>
                @endif

                @if(isset($setting) && !empty($setting->twitter_url))
                    <a href="{{ $setting->twitter_url }}" class="social-link">
                        <img src="https://task.laraveldevelopmentcompany.com/images/twittericon.png" alt="Twitter">
                    </a>
                @endif

                @if(isset($setting) && !empty($setting->instagram_url))
                    <a href="{{ $setting->instagram_url }}" class="social-link">
                        <img src="https://task.laraveldevelopmentcompany.com/images/instagram.png" alt="Instagram">
                    </a>
                @endif

                @if(isset($setting) && !empty($setting->linkedin_url))
                    <a href="{{ $setting->linkedin_url }}" class="social-link">
                        <img src="https://task.laraveldevelopmentcompany.com/images/linkedin.png" alt="LinkedIn" style="max-height: 24px;">
                    </a>
                @endif
            </div>

            <div class="contact-info">
                <div class="contact-item">
                    <span class="contact-icon">
                        <img src="https://task.laraveldevelopmentcompany.com/images/phone.png" alt="Phone" style="height: 16px;">
                    </span>
                    <span>
                        {{ $setting->site_phone ?? '(+34) 12233444' }}
                    </span>
                </div>

                <div class="contact-item">
                    <span class="contact-icon">
                        <img src="https://task.laraveldevelopmentcompany.com/images/mailicon.png" alt="Email" style="height: 16px;">
                    </span>
                    <span>
                        <a href="mailto:{{ $setting->site_email ?? 'info@shahsitask@gmail.com' }}" style="color: #1E1E1E; text-decoration: none;">
                            {{ $setting->site_email ?? 'info@shahsitask@gmail.com' }}
                        </a>
                    </span>
                </div>
            </div>

            <div class="copyright">
                © {{ date('Y') }} {{ $setting->site_name ?? 'www.shashi.com' }}
            </div>
        </div>
    </div>
</body>
</html>
