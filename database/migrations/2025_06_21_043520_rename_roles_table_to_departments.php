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
        if (Schema::hasTable('roles') && ! Schema::hasTable('departments')) {
            Schema::rename('roles', 'departments');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('departments') && ! Schema::hasTable('roles')) {
            Schema::rename('departments', 'roles');
        }
    }
};
