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
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'offer_facilities')) {
                $table->text('offer_facilities')->nullable()->after('offer_joining_date');
            }
            if (!Schema::hasColumn('job_applications', 'offer_designation')) {
                $table->string('offer_designation')->nullable()->after('offer_facilities');
            }
            if (!Schema::hasColumn('job_applications', 'offer_work_location')) {
                $table->string('offer_work_location')->nullable()->after('offer_designation');
            }
            if (!Schema::hasColumn('job_applications', 'offer_terms')) {
                $table->text('offer_terms')->nullable()->after('offer_work_location');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['offer_facilities', 'offer_designation', 'offer_work_location', 'offer_terms']);
        });
    }
};

