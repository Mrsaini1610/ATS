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
            // Number of openings
            $table->unsignedInteger('openings')->default(1)->after('job_type');

            // Additional information - age requirement
            $table->unsignedTinyInteger('min_age')->nullable()->after('experience');
            $table->unsignedTinyInteger('max_age')->nullable()->after('min_age');

            // Assets required (optional chip-based multi-select)
            $table->json('assets')->nullable()->after('qualifications');

            // Company details
            $table->string('contact_person')->nullable()->after('company_image');
            $table->string('contact_phone', 30)->nullable()->after('contact_person');
            $table->string('contact_email')->nullable()->after('contact_phone');
            $table->text('company_address')->nullable()->after('contact_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn([
                'openings',
                'min_age',
                'max_age',
                'assets',
                'contact_person',
                'contact_phone',
                'contact_email',
                'company_address',
            ]);
        });
    }
};
