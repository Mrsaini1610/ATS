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
        if (!Schema::hasTable('job_posts')) {
            Schema::create('job_posts', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->nullable()->unique();
                $table->string('title');
                $table->string('company')->nullable();
                $table->text('company_about')->nullable();
                $table->string('company_size')->nullable();
                $table->text('description')->nullable();
                $table->string('location')->nullable();
                
                // Coordinates
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
                
                $table->string('job_type')->nullable();
                
                // Foreign Keys
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('sub_category_id')->nullable();
                
                $table->string('badge')->nullable();
                $table->integer('openings')->default(1);
                $table->string('experience')->nullable();
                $table->integer('min_age')->nullable();
                $table->integer('max_age')->nullable();
                $table->string('salary')->nullable();
                
                // JSON Columns (Model me array cast kiye gaye hain)
                $table->json('skills')->nullable();
                $table->json('perks')->nullable();
                $table->text('key_responsibilities')->nullable();
                $table->text('qualifications')->nullable();
                $table->json('assets')->nullable();
                $table->json('application_questions')->nullable();
                
                $table->date('last_date')->nullable();
                $table->string('company_image')->nullable();
                
                // Contact Details
                $table->string('contact_person')->nullable();
                $table->string('contact_phone')->nullable();
                $table->string('contact_email')->nullable();
                $table->text('company_address')->nullable();
                
                $table->integer('applicants')->default(0);
                $table->string('status')->default('pending');
                
                // User Relations
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('approved_by')->nullable();
                
                $table->timestamp('approved_at')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->timestamp('resubmitted_at')->nullable();
                $table->json('approval_logs')->nullable();
                
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};