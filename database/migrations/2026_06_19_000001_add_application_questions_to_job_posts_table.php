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
        if (!Schema::hasTable('job_posts') || Schema::hasColumn('job_posts', 'application_questions')) {
            return;
        }

        Schema::table('job_posts', function (Blueprint $table) {
            $table->json('application_questions')->nullable()->after('assets');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('job_posts') || !Schema::hasColumn('job_posts', 'application_questions')) {
            return;
        }

        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn('application_questions');
        });
    }
};
