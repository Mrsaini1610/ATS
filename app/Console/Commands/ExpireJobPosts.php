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
    protected $description = 'Automatically marks job posts whose last_date has passed as expired (is_deleted = 1)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->toDateString();

        $query = JobPost::whereNotNull('last_date')
            ->whereDate('last_date', '<', $today)
            ->where(function ($q) {
                $q->where('is_deleted', 0)
                  ->orWhereNull('is_deleted');
            });

        $count = $query->count();

        if ($count === 0) {
            $this->info("No expired jobs found for {$today}.");
            return Command::SUCCESS;
        }

        $query->update([
            'is_deleted' => 1,
            'updated_at' => now(),
        ]);

        $message = "[jobs:expire] Successfully marked {$count} job post(s) as expired (is_deleted = 1) on {$today}.";
        $this->info($message);
        Log::info($message);

        return Command::SUCCESS;
    }
}
