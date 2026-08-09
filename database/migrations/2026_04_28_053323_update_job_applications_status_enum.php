<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing 'reviewing' statuses to 'pending'
        DB::table('job_applications')->where('status', 'reviewing')->update(['status' => 'pending']);

        // Modify the enum column to include new statuses
        DB::statement("ALTER TABLE job_applications MODIFY COLUMN status ENUM('pending', 'shortlisted', 'waiting_list', 'hired', 'not_selected', 'rejected') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE job_applications MODIFY COLUMN status ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending'");
    }
};
