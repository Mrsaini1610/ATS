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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('job_id')->constrained('jobs')->onDelete('cascade'); // Main Jobs Table
            $table->foreignId('resume_id')->nullable()->constrained('user_resumes')->onDelete('set null');
            
            $table->decimal('expected_ctc', 10, 2)->nullable();
            $table->integer('notice_period_days')->nullable();
            $table->text('cover_note')->nullable();
            
            // Application Status Pipeline
            $table->enum('status', [
                'applied', 
                'under_review', 
                'shortlisted', 
                'rejected', 
                'hired'
            ])->default('applied');

            // ATS Scrutiny Score (Percentage match between job skills & candidate skills)
            $table->decimal('match_score', 5, 2)->default(0.00)->comment('ATS match percentage 0-100%');

            $table->timestamps();

            // Unique Constraint: Ek candidate ek job par ek hi baar apply kar sake
            $table->unique(['user_id', 'job_id']);
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