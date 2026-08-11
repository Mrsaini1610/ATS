<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('resumes')) {
            Schema::create('resumes', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('job_title')->nullable();
                $table->string('email');
                $table->string('phone')->nullable();
                $table->string('location')->nullable();
                $table->string('linkedin')->nullable();
                $table->string('github')->nullable();
                $table->string('portfolio')->nullable();
                $table->text('summary')->nullable();
                $table->string('profile_photo')->nullable();
                $table->timestamps();

                $table->index(['email']);
            });
        }

        if (!Schema::hasTable('resume_skills')) {
            Schema::create('resume_skills', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('skill_name');
                $table->enum('skill_type', ['technical', 'soft'])->default('technical');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('resume_experiences')) {
            Schema::create('resume_experiences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('company_name');
                $table->string('job_title');
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->string('location')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('resume_educations')) {
            Schema::create('resume_educations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('degree')->nullable();
                $table->string('institute')->nullable();
                $table->string('start_year')->nullable();
                $table->string('end_year')->nullable();
                $table->string('percentage')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('resume_projects')) {
            Schema::create('resume_projects', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('title');
                $table->string('technologies')->nullable();
                $table->string('project_link')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('resume_certifications')) {
            Schema::create('resume_certifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('title');
                $table->string('platform')->nullable();
                $table->string('year')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('resume_achievements')) {
            Schema::create('resume_achievements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('resume_languages')) {
            Schema::create('resume_languages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resume_id')->constrained('resumes')->cascadeOnDelete();
                $table->string('language');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_languages');
        Schema::dropIfExists('resume_achievements');
        Schema::dropIfExists('resume_certifications');
        Schema::dropIfExists('resume_projects');
        Schema::dropIfExists('resume_educations');
        Schema::dropIfExists('resume_experiences');
        Schema::dropIfExists('resume_skills');
        Schema::dropIfExists('resumes');
    }
};
