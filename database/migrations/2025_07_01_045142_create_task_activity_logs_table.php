<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Member;
use App\Models\Task;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid');
            $table->foreignIdFor(Task::class, 'task_id');
            $table->foreignIdFor(Member::class, 'performed_by');
            $table->text('action')->nullable();
            $table->json('changes')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_activity_logs');
    }
};
