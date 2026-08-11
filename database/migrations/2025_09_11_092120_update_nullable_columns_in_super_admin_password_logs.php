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
         Schema::table('super_admin_password_logs', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('new_password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('super_admin_password_logs', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->string('new_password')->nullable(false)->change();
        });
    }
};
