<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'candidate_uuid')) {
                $table->string('candidate_uuid')->nullable()->after('candidate_id')->index();
            }
            if (!Schema::hasColumn('job_applications', 'current_salary')) {
                $table->string('current_salary')->nullable()->after('candidate_experience');
            }
            if (!Schema::hasColumn('job_applications', 'expected_salary')) {
                $table->string('expected_salary')->nullable()->after('current_salary');
            }
            if (!Schema::hasColumn('job_applications', 'last_company')) {
                $table->string('last_company')->nullable()->after('expected_salary');
            }
            if (!Schema::hasColumn('job_applications', 'notice_period')) {
                $table->string('notice_period')->nullable()->after('last_company');
            }
            if (!Schema::hasColumn('job_applications', 'last_working_day')) {
                $table->date('last_working_day')->nullable()->after('notice_period');
            }
            if (!Schema::hasColumn('job_applications', 'city')) {
                $table->string('city')->nullable()->after('last_working_day');
            }
        });

        // Backfill candidate_uuid for any existing records
        try {
            DB::statement("UPDATE job_applications ja JOIN users u ON ja.candidate_id = u.id SET ja.candidate_uuid = u.uuid WHERE ja.candidate_uuid IS NULL");
        } catch (\Throwable $e) {
            // Ignore if join fails
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $cols = ['candidate_uuid', 'current_salary', 'expected_salary', 'last_company', 'notice_period', 'last_working_day', 'city'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('job_applications', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
