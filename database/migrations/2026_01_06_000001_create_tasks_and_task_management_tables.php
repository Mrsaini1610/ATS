<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->index();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('priority', 50)->default('medium');
            $table->string('task_type', 50)->default('one_time');
            $table->string('specific_day')->nullable();
            $table->string('specific_date')->nullable();
            $table->boolean('is_stage')->default(0);
            $table->text('recurring_type')->nullable();
            $table->longText('recurring_days')->nullable();
            $table->text('start_from')->nullable();
            $table->unsignedBigInteger('member_id')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status')->default('running');
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->index();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->unsignedBigInteger('assigned_to');
            $table->unsignedBigInteger('assigned_by');
            $table->string('assigned_by_type')->default('superadmin');
            $table->boolean('is_transferred')->default(0);
            $table->unsignedBigInteger('parent_assignment_id')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_instances', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->unsignedBigInteger('assigned_to');
            $table->date('due_date');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'overdue'])->default('pending');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_logs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->index();
            $table->unsignedBigInteger('task_assignment_id');
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('performed_by');
            $table->date('log_date');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->index();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->tinyInteger('is_admin')->default(0);
            $table->unsignedBigInteger('performed_by');
            $table->text('action')->nullable();
            $table->longText('changes')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->index();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->unsignedBigInteger('reply_note_id')->nullable();
            $table->unsignedBigInteger('commented_by');
            $table->text('comment');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->unsignedBigInteger('uploaded_by');
            $table->string('link')->nullable();
            $table->string('path');
            $table->string('type')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_documents');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('task_activity_logs');
        Schema::dropIfExists('task_logs');
        Schema::dropIfExists('task_instances');
        Schema::dropIfExists('task_assignments');
        Schema::dropIfExists('tasks');
    }
};
