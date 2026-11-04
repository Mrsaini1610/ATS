<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. job_applications: Ensure candidate_uuid, user_uuid, job_uuid are present, and candidate_id is nullable
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'candidate_uuid')) {
                $table->string('candidate_uuid')->nullable()->after('candidate_id')->index();
            }
            if (!Schema::hasColumn('job_applications', 'user_uuid')) {
                $table->string('user_uuid')->nullable()->after('candidate_uuid')->index();
            }
            if (!Schema::hasColumn('job_applications', 'job_uuid')) {
                $table->string('job_uuid')->nullable()->after('job_id')->index();
            }
            $table->unsignedBigInteger('candidate_id')->nullable()->change();
            $table->unsignedBigInteger('job_id')->nullable()->change();
        });

        // Backfill job_applications
        try {
            DB::statement("UPDATE job_applications ja JOIN users u ON ja.candidate_id = u.id SET ja.candidate_uuid = u.uuid WHERE (ja.candidate_uuid IS NULL OR ja.candidate_uuid = '')");
            DB::statement("UPDATE job_applications SET user_uuid = candidate_uuid WHERE (user_uuid IS NULL OR user_uuid = '') AND candidate_uuid IS NOT NULL");
            DB::statement("UPDATE job_applications ja JOIN job_posts jp ON ja.job_id = jp.id SET ja.job_uuid = jp.uuid WHERE (ja.job_uuid IS NULL OR ja.job_uuid = '')");
        } catch (\Throwable $e) {}

        // 2. interviews: Ensure candidate_uuid, job_uuid, application_uuid exist
        Schema::table('interviews', function (Blueprint $table) {
            if (!Schema::hasColumn('interviews', 'candidate_uuid')) {
                $table->string('candidate_uuid')->nullable()->after('application_id')->index();
            }
            if (!Schema::hasColumn('interviews', 'job_uuid')) {
                $table->string('job_uuid')->nullable()->after('candidate_uuid')->index();
            }
            if (!Schema::hasColumn('interviews', 'application_uuid')) {
                $table->string('application_uuid')->nullable()->after('job_uuid')->index();
            }
        });

        // Backfill interviews
        try {
            DB::statement("UPDATE interviews i JOIN job_applications ja ON i.application_id = ja.id SET i.application_uuid = ja.uuid, i.candidate_uuid = ja.candidate_uuid, i.job_uuid = ja.job_uuid WHERE i.application_uuid IS NULL");
        } catch (\Throwable $e) {}

        // 3. user_notifications: Add user_uuid
        Schema::table('user_notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('user_notifications', 'user_uuid')) {
                $table->string('user_uuid')->nullable()->after('user_id')->index();
            }
        });
        try {
            DB::statement("UPDATE user_notifications un JOIN users u ON un.user_id = u.id SET un.user_uuid = u.uuid WHERE un.user_uuid IS NULL");
        } catch (\Throwable $e) {}

        // 4. fcm_tokens: Add user_uuid
        Schema::table('fcm_tokens', function (Blueprint $table) {
            if (!Schema::hasColumn('fcm_tokens', 'user_uuid')) {
                $table->string('user_uuid')->nullable()->after('user_id')->index();
            }
        });
        try {
            DB::statement("UPDATE fcm_tokens ft JOIN users u ON ft.user_id = u.id SET ft.user_uuid = u.uuid WHERE ft.user_uuid IS NULL");
        } catch (\Throwable $e) {}

        // 5. email_logs: Add user_uuid
        Schema::table('email_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('email_logs', 'user_uuid')) {
                $table->string('user_uuid')->nullable()->after('user_id')->index();
            }
        });
        try {
            DB::statement("UPDATE email_logs el JOIN users u ON el.user_id = u.id SET el.user_uuid = u.uuid WHERE el.user_uuid IS NULL");
        } catch (\Throwable $e) {}

        // 6. activity_logs: Add user_uuid
        Schema::table('activity_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('activity_logs', 'user_uuid')) {
                $table->string('user_uuid')->nullable()->after('user_id')->index();
            }
        });
        try {
            DB::statement("UPDATE activity_logs al JOIN users u ON al.user_id = u.id SET al.user_uuid = u.uuid WHERE al.user_uuid IS NULL");
        } catch (\Throwable $e) {}
    }

    public function down(): void
    {
    }
};

