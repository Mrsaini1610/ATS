<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('job_applications')) {
            return;
        }

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            
            // Foreign keys
            $table->unsignedBigInteger('job_id');
            $table->unsignedBigInteger('candidate_id'); // member_id
            
            // Application details
            $table->text('cover_letter')->nullable();
            $table->string('resume_url')->nullable(); // uploaded resume path
            $table->json('answers')->nullable(); // additional questions answers
            
            // Status tracking
            $table->enum('status', ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'])->default('pending');
            $table->text('admin_notes')->nullable(); // notes by admin/superadmin
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable(); // admin who reviewed
            
            // Candidate info snapshot (at time of application)
            $table->string('candidate_name');
            $table->string('candidate_email');
            $table->string('candidate_phone')->nullable();
            $table->json('candidate_skills')->nullable();
            $table->text('candidate_experience')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('job_id')->references('id')->on('job_posts')->onDelete('cascade');
            $table->foreign('candidate_id')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('members')->onDelete('set null');
            
            // Indexes
            $table->index(['candidate_id', 'status']);
            $table->index(['job_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
