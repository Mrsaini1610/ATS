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
        if (Schema::hasTable('job_posts')) {
            return;
        }

        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            
            // Job details
            $table->string('title');
            $table->string('company');
            $table->text('description')->nullable();
            $table->string('location');
            $table->string('job_type'); // Full Time, Part Time, Contract, etc.
            $table->string('experience')->nullable();
            $table->string('salary')->nullable();
            $table->json('skills')->nullable();
            $table->json('perks')->nullable();
            $table->text('key_responsibilities')->nullable();
            $table->text('qualifications')->nullable();
            $table->date('last_date')->nullable();
            $table->string('company_image')->nullable();
            $table->integer('applicants')->default(0);
            
            // Approval workflow fields
            $table->enum('status', ['pending', 'active', 'declined'])->default('pending');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('resubmitted_at')->nullable();
            $table->json('approval_logs')->nullable(); // Store approval history
            
            $table->timestamps();
            
            // Add foreign key constraints
            $table->foreign('created_by')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('super_admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
