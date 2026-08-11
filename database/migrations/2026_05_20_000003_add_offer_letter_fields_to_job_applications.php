<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'offer_salary_package')) {
                $table->string('offer_salary_package')->nullable()->after('admin_final_decision_updated_at');
            }

            if (!Schema::hasColumn('job_applications', 'offer_joining_date')) {
                $table->date('offer_joining_date')->nullable()->after('offer_salary_package');
            }

            if (!Schema::hasColumn('job_applications', 'offer_letter_path')) {
                $table->string('offer_letter_path')->nullable()->after('offer_joining_date');
            }

            if (!Schema::hasColumn('job_applications', 'offer_letter_sent_at')) {
                $table->timestamp('offer_letter_sent_at')->nullable()->after('offer_letter_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $columns = [
                'offer_salary_package',
                'offer_joining_date',
                'offer_letter_path',
                'offer_letter_sent_at',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('job_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
