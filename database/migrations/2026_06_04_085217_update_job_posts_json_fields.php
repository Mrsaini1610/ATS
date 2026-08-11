<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert existing TEXT data to JSON arrays for backward compatibility
        DB::statement('UPDATE job_posts SET key_responsibilities = NULL WHERE key_responsibilities IS NULL OR TRIM(key_responsibilities) = ""');
        DB::statement('UPDATE job_posts SET qualifications = NULL WHERE qualifications IS NULL OR TRIM(qualifications) = ""');

        $jobs = DB::table('job_posts')->whereNotNull('key_responsibilities')->orWhereNotNull('qualifications')->get();
        foreach ($jobs as $job) {
            $updates = [];

            if (!empty($job->key_responsibilities)) {
                $lines = array_values(array_filter(array_map('trim', explode("\n", $job->key_responsibilities))));
                // Check if already a JSON array
                if (json_decode($job->key_responsibilities) === null) {
                    $updates['key_responsibilities'] = json_encode($lines);
                }
            }

            if (!empty($job->qualifications)) {
                $lines = array_values(array_filter(array_map('trim', explode("\n", $job->qualifications))));
                // Check if already a JSON array
                if (json_decode($job->qualifications) === null) {
                    $updates['qualifications'] = json_encode($lines);
                }
            }

            if (!empty($updates)) {
                DB::table('job_posts')->where('id', $job->id)->update($updates);
            }
        }

        // Change columns from TEXT to JSON
        Schema::table('job_posts', function (Blueprint $table) {
            $table->json('key_responsibilities')->nullable()->change();
            $table->json('qualifications')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->text('key_responsibilities')->nullable()->change();
            $table->text('qualifications')->nullable()->change();
        });
    }
};