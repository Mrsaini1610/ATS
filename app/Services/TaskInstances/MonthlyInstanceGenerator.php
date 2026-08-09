<?php

namespace App\Services\TaskInstances;

use App\Models\Task;
use Carbon\Carbon;

class MonthlyInstanceGenerator
{
    public function generateFor(Task $task)
{
    $days = $task->recurring_days;
    $lastInstance = $task->instances()->latest('due_date')->first();
    $nextDate = $lastInstance
        ? $lastInstance->due_date->addMonthNoOverflow()
        : $this->getInitialDate($task, $days);
    foreach ($task->assignedMembers as $member) {
        $task->instances()->create([
            'assigned_to' => $member->id,
            'due_date' => $nextDate,
            'status' => 'pending'
        ]);
    }
}

    protected function getInitialDate(Task $task, array $days): Carbon
    {
        $startFrom = $task->start_from === 'today' ? now() : now()->addDay();
        $nextDate = null;
        foreach ($days as $day) {
            try {
                $date = $startFrom->copy()->setDay($day);
                if ($date >= $startFrom && (!$nextDate || $date->lt($nextDate))) {
                    $nextDate = $date;
                }
            } catch (\Exception $e) {
                continue;
            }
        }
        return $nextDate ?? $startFrom->addMonthNoOverflow()->setDay($days[0]);
    }
}
