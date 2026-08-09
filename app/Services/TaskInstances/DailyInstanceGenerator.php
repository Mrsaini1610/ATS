<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\TaskInstance;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class DailyTaskAssign extends Command
{
    protected $signature = 'app:daily-task-assign';
    protected $description = 'Generate daily task instances for recurring tasks';

    public function handle()
    {
        $today = strtolower(now()->format('l'));
        $tasks = Task::where('status', 1)
            ->where('task_type', 'recurring')
            ->where('recurring_type', 'daily')
            ->whereNull('deleted_at')
            ->with('assignedMembers')
            ->get();
        foreach ($tasks as $task) {
            $days = is_array($task->specific_day)
                ? $task->specific_day
                : (is_string($task->specific_day) ? explode(',', strtolower($task->specific_day)) : []);
            if (empty($days) || in_array($today, $days)) {
                try {
                    $lastInstance = $task->instances()->latest('due_date')->first();
                    $nextDate = $lastInstance
                        ? Carbon::parse($lastInstance->due_date)->addDay()
                        : ($task->start_from === 'today' ? now() : now()->addDay());

                    foreach ($task->assignedMembers as $member) {
                        $task->instances()->create([
                            'assigned_to' => $member->id,
                            'due_date' => $nextDate,
                            'status' => 'pending',
                        ]);
                    }

                    Log::info("Generated daily instances for task ID: {$task->id}");
                } catch (\Exception $e) {
                    Log::error("Failed to generate instance for task ID {$task->id}: " . $e->getMessage());
                }
            }
        }
    }
}
