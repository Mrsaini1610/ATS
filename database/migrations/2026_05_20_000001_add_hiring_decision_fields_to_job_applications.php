<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'hiring_decision')) {
                $table->string('hiring_decision')->nullable()->after('offer_letter_triggered_at');
            }

            if (!Schema::hasColumn('job_applications', 'hiring_decision_reason')) {
                $table->text('hiring_decision_reason')->nullable()->after('hiring_decision');
            }

            if (!Schema::hasColumn('job_applications', 'hiring_decision_updated_at')) {
                $table->timestamp('hiring_decision_updated_at')->nullable()->after('hiring_decision_reason');
            }
        });

        DB::statement(
            "ALTER TABLE job_applications MODIFY COLUMN status ENUM(
                'pending',
                'shortlisted',
                'waiting_list',
                'hired',
                'not_selected',
                'rejected',
                'assigned_to_calling_team',
                'interested',
                'interview_scheduled',
                'selected',
                'on_hold',
                'on_hold_not_interested',
                'approved',
                'follow_up',
                'no_response'
            ) DEFAULT 'pending'"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE job_applications MODIFY COLUMN status ENUM(
                'pending',
                'shortlisted',
                'waiting_list',
                'hired',
                'not_selected',
                'rejected',
                'assigned_to_calling_team',
                'interested',
                'interview_scheduled',
                'selected',
                'on_hold',
                'on_hold_not_interested'
            ) DEFAULT 'pending'"
        );

        Schema::table('job_applications', function (Blueprint $table) {
            $columns = [
                'hiring_decision',
                'hiring_decision_reason',
                'hiring_decision_updated_at',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('job_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
