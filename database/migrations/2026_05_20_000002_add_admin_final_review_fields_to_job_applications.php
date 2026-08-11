<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'admin_final_decision')) {
                $table->string('admin_final_decision')->nullable()->after('hiring_decision_updated_at');
            }

            if (!Schema::hasColumn('job_applications', 'admin_final_decision_reason')) {
                $table->text('admin_final_decision_reason')->nullable()->after('admin_final_decision');
            }

            if (!Schema::hasColumn('job_applications', 'admin_final_decision_updated_at')) {
                $table->timestamp('admin_final_decision_updated_at')->nullable()->after('admin_final_decision_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $columns = [
                'admin_final_decision',
                'admin_final_decision_reason',
                'admin_final_decision_updated_at',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('job_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
