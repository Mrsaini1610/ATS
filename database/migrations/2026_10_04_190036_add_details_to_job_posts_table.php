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
        Schema::table('job_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('job_posts', 'certifications')) {
                $table->longText('certifications')->nullable()->after('assets');
            }
            if (!Schema::hasColumn('job_posts', 'preferred_industries')) {
                $table->longText('preferred_industries')->nullable()->after('certifications');
            }
            if (!Schema::hasColumn('job_posts', 'min_experience')) {
                $table->decimal('min_experience', 5, 2)->nullable()->after('experience');
            }
            if (!Schema::hasColumn('job_posts', 'max_experience')) {
                $table->decimal('max_experience', 5, 2)->nullable()->after('min_experience');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $cols = ['certifications', 'preferred_industries', 'min_experience', 'max_experience'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('job_posts', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
