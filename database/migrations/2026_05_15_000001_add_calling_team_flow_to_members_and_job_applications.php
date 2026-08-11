<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'is_calling_team')) {
                $table->boolean('is_calling_team')->default(false)->after('assigned_admin_id');
                $table->index(['assigned_admin_id', 'is_calling_team'], 'members_assigned_admin_calling_idx');
            }
        });

        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'assigned_calling_team_member_id')) {
                $table->unsignedBigInteger('assigned_calling_team_member_id')->nullable()->after('reviewed_by');
                $table->timestamp('assigned_to_calling_team_at')->nullable()->after('assigned_calling_team_member_id');
                $table->string('call_outcome')->nullable()->after('assigned_to_calling_team_at');
                $table->text('call_outcome_reason')->nullable()->after('call_outcome');
                $table->text('call_notes')->nullable()->after('call_outcome_reason');
                $table->timestamp('interview_date_time')->nullable()->after('call_notes');
                $table->string('interview_mode')->nullable()->after('interview_date_time');
                $table->text('interview_address')->nullable()->after('interview_mode');
                $table->text('interview_instructions')->nullable()->after('interview_address');
                $table->string('interview_contact_person')->nullable()->after('interview_instructions');
                $table->timestamp('interview_confirmed_at')->nullable()->after('interview_contact_person');
                $table->timestamp('offer_letter_triggered_at')->nullable()->after('interview_confirmed_at');

                $table->index('assigned_calling_team_member_id', 'job_applications_calling_member_idx');
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
                'on_hold_not_interested'
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
                'rejected'
            ) DEFAULT 'pending'"
        );

        Schema::table('job_applications', function (Blueprint $table) {
            $columns = [
                'assigned_calling_team_member_id',
                'assigned_to_calling_team_at',
                'call_outcome',
                'call_outcome_reason',
                'call_notes',
                'interview_date_time',
                'interview_mode',
                'interview_address',
                'interview_instructions',
                'interview_contact_person',
                'interview_confirmed_at',
                'offer_letter_triggered_at',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('job_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'is_calling_team')) {
                $table->dropIndex('members_assigned_admin_calling_idx');
                $table->dropColumn('is_calling_team');
            }
        });
    }
};
