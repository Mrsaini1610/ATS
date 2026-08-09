<?php

namespace App\Services\TaskInstances;

use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WeeklyInstanceGenerator
{
   public function generateFor(Task $task): void
{
    try {
        $days = $task->recurring_days ?? [];
        if (empty($days)) {
            throw new \Exception("No recurring days specified for weekly task");
        }
        $lastInstance = $task->instances()->latest('due_date')->first();
        $nextDate = $lastInstance
            ? $lastInstance->due_date->addWeek()
            : $this->getInitialDate($task, $days);
        foreach ($task->assignedMembers as $member) {
            $task->instances()->create([
                'assigned_to' => $member->id,
                'due_date' => $nextDate,
                'status' => 'pending'
            ]);
        }
    } catch (\Exception $e) {
        Log::error("Failed to generate weekly instances: " . $e->getMessage());
        throw $e;
    }
}

    protected function getInitialDate(Task $task, array $days): Carbon
    {
        $startFrom = $task->start_from === 'today' ? now() : now()->addDay();
        $nextDate = null;

        foreach ($days as $day) {
            try {
                $date = $startFrom->copy()->next(Carbon::parse($day)->dayOfWeek);
                if (!$nextDate || $date->lt($nextDate)) {
                    $nextDate = $date;
                }
            } catch (\Exception $e) {
                Log::warning("Invalid day '{$day}' in weekly recurring days for Task #{$task->id}");
                continue;
            }
        }

        return $nextDate ?? $startFrom->addWeek();
    }
}
