<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskInstanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid' => $this->faker->uuid(),
            'task_id' => Task::factory(),
            'assigned_to' => Member::factory(),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'completed']),
            'completed_at' => $this->faker->optional(0.3)->dateTimeThisYear()
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'completed_at' => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => $this->faker->dateTimeThisYear(),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => $this->faker->dateTimeBetween('-1 month', '-1 day')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['pending', 'in_progress']),
            'completed_at' => null,
        ]);
    }
}
