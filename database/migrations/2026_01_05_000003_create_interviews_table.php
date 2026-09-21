<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('application_id')->nullable()->index();
            $table->string('candidate_name');
            $table->string('candidate_phone', 50)->nullable();
            $table->string('job_title')->nullable();
            $table->string('company')->nullable();
            $table->string('scheduled_by')->default('Admin');
            $table->string('interviewer')->nullable();
            $table->date('scheduled_at')->nullable();
            $table->date('interview_date');
            $table->string('interview_time', 20);
            $table->enum('mode', ['phone', 'video', 'in_person'])->default('phone');
            $table->string('round')->nullable();
            $table->string('meeting_link')->nullable();
            $table->enum('status', ['scheduled', 'done', 'no_show', 'rescheduled', 'cancelled'])->default('scheduled');
            $table->boolean('interested')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
