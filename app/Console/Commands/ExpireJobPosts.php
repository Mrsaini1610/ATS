<?php

namespace App\Console\Commands;

use App\Models\JobPost;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireJobPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jobs:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically deactivates job posts whose last_date has passed (status = deactivated, is_deleted = 1)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->toDateString();

        $query = JobPost::whereNotNull('last_date')
            ->whereDate('last_date', '<', $today)
            ->where(function ($q) {
                $q->where('status', '!=', 'deactivated')
                  ->orWhere('is_deleted', 0)
                  ->orWhereNull('is_deleted');
            });

        $count = $query->count();

        if ($count === 0) {
            $this->info("No expired jobs found to deactivate for {$today}.");
            return Command::SUCCESS;
        }

        $query->update([
            'status'     => 'deactivated',
            'is_deleted' => 1,
            'updated_at' => now(),
        ]);

        $message = "[jobs:expire] Successfully deactivated {$count} job post(s) (status = deactivated, is_deleted = 1) whose last date has passed on {$today}.";
        $this->info($message);
        Log::info($message);

        return Command::SUCCESS;
    }
}
