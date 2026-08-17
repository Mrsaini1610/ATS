<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            
            // Foreign Keys
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->foreignId('sub_category_id')->nullable()->constrained('subcategories')->onDelete('set null');
            
            // Job Details
            $table->string('title');
            $table->string('company')->nullable();
            $table->text('company_about')->nullable();
            $table->string('company_size')->nullable();
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('job_type')->nullable(); // e.g., Full-time, Part-time, Remote
            $table->string('badge')->nullable(); // e.g., Featured, Urgent
            $table->integer('openings')->default(1);
            $table->string('experience')->nullable();
            $table->integer('min_age')->nullable();
            $table->integer('max_age')->nullable();
            $table->string('salary')->nullable();
            
            // JSON Fields (Matched with Model $casts)
            $table->json('skills')->nullable();
            $table->json('perks')->nullable();
            $table->text('key_responsibilities')->nullable();
            $table->text('qualifications')->nullable();
            $table->json('assets')->nullable();
            $table->json('application_questions')->nullable();
            
            // Dates & Contact Info
            $table->date('last_date')->nullable();
            $table->string('company_image')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('company_address')->nullable();
            
            // Status & Applicants
            $table->integer('applicants')->default(0);
            $table->enum('status', ['active', 'inactive', 'pending', 'rejected'])->default('active');
            
            // Audit & Approval Logs
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('resubmitted_at')->nullable();
            $table->json('approval_logs')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};