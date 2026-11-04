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
            if (!Schema::hasColumn('users', 'profile_prompt_snoozed_until')) {
                $table->timestamp('profile_prompt_snoozed_until')->nullable()->after('is_profile_complete');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'profile_prompt_snoozed_until')) {
                $table->dropColumn('profile_prompt_snoozed_until');
            }
        });
    }
};

