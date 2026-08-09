<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('job_applications')) {
            return;
        }

        DB::statement("
            ALTER TABLE job_applications
            MODIFY COLUMN status VARCHAR(100) NOT NULL DEFAULT 'applied'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('job_applications')) {
            return;
        }

        $allowedStatuses = [
            'applied',
            'viewed',
            'shortlisted',
            'rejected',
            'waiting_list',
            'hired',
            'not_selected',
            'assigned_to_calling_member',
            'calling_in_progress',
            'calling_approved',
            'calling_rejected',
            'admin_review',
            'offer_letter_generated',
        ];

        DB::table('job_applications')
            ->whereNull('status')
            ->orWhereNotIn('status', $allowedStatuses)
            ->update(['status' => 'applied']);

        DB::statement("
            ALTER TABLE job_applications
            MODIFY COLUMN status ENUM(
                'applied',
                'viewed',
                'shortlisted',
                'rejected',
                'waiting_list',
                'hired',
                'not_selected',
                'assigned_to_calling_member',
                'calling_in_progress',
                'calling_approved',
                'calling_rejected',
                'admin_review',
                'offer_letter_generated'
            ) NOT NULL DEFAULT 'applied'
        ");
    }
};
