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
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'is_online')) {
                $table->boolean('is_online')->default(false)->after('last_web_login_at');
            }
            if (!Schema::hasColumn('admins', 'last_active')) {
                $table->timestamp('last_active')->nullable()->after('is_online');
            }
            if (!Schema::hasColumn('admins', 'web_is_online')) {
                $table->boolean('web_is_online')->default(false)->after('last_active');
            }
            if (!Schema::hasColumn('admins', 'web_last_active')) {
                $table->timestamp('web_last_active')->nullable()->after('web_is_online');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn([
                'is_online',
                'last_active',
                'web_is_online',
                'web_last_active',
            ]);
        });
    }
};

