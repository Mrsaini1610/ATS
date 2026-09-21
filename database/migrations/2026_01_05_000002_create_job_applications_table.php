<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('job_id')->constrained('job_posts')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->string('resume_url')->nullable();
            $table->longText('answers')->nullable();
            $table->longText('screening_answers')->nullable();
            $table->string('status', 100)->default('applied');
            $table->text('admin_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('members')->nullOnDelete();
            $table->foreignId('assigned_calling_team_member_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('assigned_to_calling_team_at')->nullable();
            $table->string('call_outcome')->nullable();
            $table->text('call_outcome_reason')->nullable();
            $table->text('call_notes')->nullable();
            $table->timestamp('interview_date_time')->nullable();
            $table->string('interview_mode')->nullable();
            $table->text('interview_address')->nullable();
            $table->text('interview_instructions')->nullable();
            $table->string('interview_contact_person')->nullable();
            $table->timestamp('interview_confirmed_at')->nullable();
            $table->timestamp('offer_letter_triggered_at')->nullable();
            $table->string('hiring_decision')->nullable();
            $table->text('hiring_decision_reason')->nullable();
            $table->timestamp('hiring_decision_updated_at')->nullable();
            $table->string('admin_final_decision')->nullable();
            $table->text('admin_final_decision_reason')->nullable();
            $table->timestamp('admin_final_decision_updated_at')->nullable();
            $table->string('offer_salary_package')->nullable();
            $table->date('offer_joining_date')->nullable();
            $table->string('offer_letter_path')->nullable();
            $table->timestamp('offer_letter_sent_at')->nullable();
            $table->string('candidate_name');
            $table->string('candidate_email');
            $table->string('candidate_phone', 50)->nullable();
            $table->longText('candidate_skills')->nullable();
            $table->text('candidate_experience')->nullable();
            $table->timestamps();

            $table->index(['candidate_id', 'status'], 'idx_candidate_status');
            $table->index(['job_id', 'status'], 'idx_job_status');
            $table->index('assigned_calling_team_member_id', 'job_applications_calling_member_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
