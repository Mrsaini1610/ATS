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
        if (!Schema::hasTable('job_applications') || Schema::hasColumn('job_applications', 'screening_answers')) {
            return;
        }

        Schema::table('job_applications', function (Blueprint $table) {
            $table->json('screening_answers')->nullable()->after('answers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('job_applications') || !Schema::hasColumn('job_applications', 'screening_answers')) {
            return;
        }

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('screening_answers');
        });
    }
};
