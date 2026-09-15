<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('job_posts', 'company_uuid')) {
                $table->uuid('company_uuid')->nullable()->after('company_id');
            }
            if (!Schema::hasColumn('job_posts', 'min_salary')) {
                $table->decimal('min_salary', 12, 2)->nullable()->after('max_age');
            }
            if (!Schema::hasColumn('job_posts', 'max_salary')) {
                $table->decimal('max_salary', 12, 2)->nullable()->after('min_salary');
            }
            if (!Schema::hasColumn('job_posts', 'salary_type')) {
                $table->string('salary_type', 30)->nullable()->after('max_salary');
            }
            if (!Schema::hasColumn('job_posts', 'working_days')) {
                $table->string('working_days')->nullable()->after('job_type');
            }
            if (!Schema::hasColumn('job_posts', 'shift_timing')) {
                $table->string('shift_timing')->nullable()->after('working_days');
            }
            if (!Schema::hasColumn('job_posts', 'interview_details')) {
                $table->text('interview_details')->nullable()->after('shift_timing');
            }
            if (!Schema::hasColumn('job_posts', 'min_experience')) {
                $table->decimal('min_experience', 5, 2)->nullable()->after('experience');
            }
            if (!Schema::hasColumn('job_posts', 'max_experience')) {
                $table->decimal('max_experience', 5, 2)->nullable()->after('min_experience');
            }
            if (!Schema::hasColumn('job_posts', 'certifications')) {
                $table->json('certifications')->nullable()->after('assets');
            }
            if (!Schema::hasColumn('job_posts', 'preferred_industries')) {
                $table->json('preferred_industries')->nullable()->after('certifications');
            }
            if (!Schema::hasColumn('job_posts', 'assigned_to')) {
                $table->unsignedBigInteger('assigned_to')->nullable()->after('created_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $columns = [
                'company_uuid', 'min_salary', 'max_salary', 'salary_type',
                'shift_timing', 'interview_details', 'min_experience',
                'max_experience', 'certifications', 'preferred_industries',
                'working_days', 'assigned_to',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('job_posts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
