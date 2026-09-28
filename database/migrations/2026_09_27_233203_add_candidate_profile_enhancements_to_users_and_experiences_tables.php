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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'linkedin')) {
                $table->string('linkedin')->nullable()->after('pincode');
            }
            if (!Schema::hasColumn('users', 'github')) {
                $table->string('github')->nullable()->after('linkedin');
            }
            if (!Schema::hasColumn('users', 'portfolio')) {
                $table->string('portfolio')->nullable()->after('github');
            }
            if (!Schema::hasColumn('users', 'languages')) {
                $table->longText('languages')->nullable()->after('skills');
            }
            if (!Schema::hasColumn('users', 'job_type')) {
                $table->string('job_type')->nullable()->after('education');
            }
            if (!Schema::hasColumn('users', 'work_mode')) {
                $table->string('work_mode')->nullable()->after('job_type');
            }
            if (!Schema::hasColumn('users', 'is_open_to_work')) {
                $table->boolean('is_open_to_work')->default(1)->after('work_mode');
            }
        });

        Schema::table('user_experiences', function (Blueprint $table) {
            if (!Schema::hasColumn('user_experiences', 'location')) {
                $table->string('location')->nullable()->after('designation');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['linkedin', 'github', 'portfolio', 'languages', 'job_type', 'work_mode', 'is_open_to_work'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::table('user_experiences', function (Blueprint $table) {
            if (Schema::hasColumn('user_experiences', 'location')) {
                $table->dropColumn('location');
            }
        });
    }
};
