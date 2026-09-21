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
            $table->uuid('uuid')->nullable()->unique();
            $table->char('company_uuid', 36)->nullable();
            $table->foreignId('company_id')->nullable()->constrained('companies')->cascadeOnDelete();
            $table->string('title');
            $table->string('company')->nullable();
            $table->text('company_about')->nullable();
            $table->string('company_size')->nullable();
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('job_type')->nullable();
            $table->string('working_days', 100)->nullable();
            $table->string('shift_timing', 100)->nullable();
            $table->text('interview_details')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('sub_category_id')->nullable()->constrained('subcategories')->nullOnDelete();
            $table->string('badge')->nullable();
            $table->integer('openings')->default(1);
            $table->string('experience')->nullable();
            $table->integer('min_age')->nullable();
            $table->integer('max_age')->nullable();
            $table->decimal('min_salary', 10, 2)->nullable();
            $table->decimal('max_salary', 10, 2)->nullable();
            $table->enum('salary_type', ['yearly', 'halfyearly', 'quarterly', 'monthly', 'weekly'])->default('yearly');
            $table->enum('bonus_offered', ['yes', 'no'])->default('no');
            $table->longText('skills')->nullable();
            $table->string('languages')->nullable();
            $table->longText('perks')->nullable();
            $table->text('key_responsibilities')->nullable();
            $table->text('qualifications')->nullable();
            $table->longText('assets')->nullable();
            $table->longText('application_questions')->nullable();
            $table->date('last_date')->nullable();
            $table->string('company_image')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('company_address')->nullable();
            $table->integer('applicants')->default(0);
            $table->string('status')->default('pending');
            $table->text('remark')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('admins')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('resubmitted_at')->nullable();
            $table->longText('approval_logs')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
