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
        Schema::table('users', function (Blueprint $table) {
            // Web Tracking
            $table->decimal('web_latitude', 10, 8)->nullable()->after('longitude');
            $table->decimal('web_longitude', 11, 8)->nullable()->after('web_latitude');
            $table->boolean('web_is_online')->default(0)->after('web_longitude');
            $table->timestamp('web_last_active')->nullable()->after('web_is_online');

            // App Tracking
            $table->decimal('app_latitude', 10, 8)->nullable()->after('web_last_active');
            $table->decimal('app_longitude', 11, 8)->nullable()->after('app_latitude');
            $table->boolean('app_is_online')->default(0)->after('app_longitude');
            $table->timestamp('app_last_active')->nullable()->after('app_is_online');

            // Profile Fields & Completion Flag
            $table->string('job_title')->nullable()->after('pincode');
            $table->string('education')->nullable()->after('job_title');
            $table->boolean('is_profile_complete')->default(0)->after('education');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'web_latitude',
                'web_longitude',
                'web_is_online',
                'web_last_active',
                'app_latitude',
                'app_longitude',
                'app_is_online',
                'app_last_active',
                'job_title',
                'education',
                'is_profile_complete',
            ]);
        });
    }
};
