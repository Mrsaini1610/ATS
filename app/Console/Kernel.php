<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Task;
use App\Models\TaskInstance;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('app:daily-task-assign')->dailyAt('00:01');
        $schedule->command('app:weekly-task-assign')->weeklyOn(1, '01:00');
        $schedule->command('app:monthly-task-assign')->monthlyOn(1, '02:00');
        $schedule->command('app:quarterly-task-assign')->quarterly()->at('03:00');
        $schedule->command('app:half-yearly-task-assign')->cron('0 4 1 1,7 *');
        $schedule->command('app:yearly-task-assign')->yearly()->at('05:00');
        $schedule->command('tasks:check-overdue')->dailyAt('12:00');
        $schedule->command('tasks:check-stages')->daily();
        $schedule->command('app:demo-cron-test')->everyMinute();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
