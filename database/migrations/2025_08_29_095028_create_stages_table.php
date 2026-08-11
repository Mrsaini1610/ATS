<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Task;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('stages', function (Blueprint $table) {
    $table->id();
                $table->foreignIdFor(User::class);
            $table->foreignIdFor(Task::class)->nullable();
    $table->string('name');
    $table->integer('min_days');
    $table->integer('max_days');
    $table->integer('order')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamp('created_date')->useCurrent();
    $table->timestamp('last_change_stage_date')->nullable();
    $table->timestamp('stage_overdue_date')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stages');
    }
};
