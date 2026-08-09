<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Example console command
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule::command('app:demo-cron-test')->everySecond();
// Schedule::command('tasks:check-stages')->everySecond();
Schedule::command('app:daily-task-assign')->dailyAt('00:01')->timezone('Asia/Kolkata');
Schedule::command('app:weekly-task-assign')->weeklyOn(1, '01:00')->timezone('Asia/Kolkata');
Schedule::command('app:monthly-task-assign')->monthlyOn(1, '02:00')->timezone('Asia/Kolkata');
Schedule::command('app:quarterly-task-assign')->quarterly()->at('03:00')->timezone('Asia/Kolkata');
Schedule::command('app:half-yearly-task-assign')->cron('0 4 1 1,7 *')->timezone('Asia/Kolkata');
Schedule::command('app:yearly-task-assign')->yearly()->at('05:00')->timezone('Asia/Kolkata');
Schedule::command('tasks:check-overdue')->dailyAt('12:00')->timezone('Asia/Kolkata');
Schedule::command('tasks:check-stages')->daily()->timezone('Asia/Kolkata');
// Schedule::command('app:demo-cron-test')->everySecond();
