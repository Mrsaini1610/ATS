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
            // Modify status column to include 'closed' value
            $table->enum('status', ['pending', 'active', 'inactive', 'declined', 'closed'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('status', ['pending', 'active', 'inactive', 'declined'])->default('pending')->change();
        });
    }
};
