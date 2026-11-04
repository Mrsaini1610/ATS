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
            if (!Schema::hasColumn('users', 'current_web_session_id')) {
                $table->string('current_web_session_id', 255)->nullable()->after('web_last_active');
            }
            if (!Schema::hasColumn('users', 'current_app_device_id')) {
                $table->string('current_app_device_id', 255)->nullable()->after('current_web_session_id');
            }
            if (!Schema::hasColumn('users', 'last_web_login_at')) {
                $table->timestamp('last_web_login_at')->nullable()->after('current_app_device_id');
            }
            if (!Schema::hasColumn('users', 'last_app_login_at')) {
                $table->timestamp('last_app_login_at')->nullable()->after('last_web_login_at');
            }
        });

        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'current_web_session_id')) {
                $table->string('current_web_session_id', 255)->nullable()->after('status');
            }
            if (!Schema::hasColumn('admins', 'last_web_login_at')) {
                $table->timestamp('last_web_login_at')->nullable()->after('current_web_session_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'current_web_session_id',
                'current_app_device_id',
                'last_web_login_at',
                'last_app_login_at',
            ]);
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn([
                'current_web_session_id',
                'last_web_login_at',
            ]);
        });
    }
};
