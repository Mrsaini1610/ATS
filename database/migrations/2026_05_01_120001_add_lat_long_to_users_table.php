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
            // Check karein ki agar latitude column nahi hai tabhi add karein
            if (!Schema::hasColumn('users', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->comment('User location latitude');
            }

            // Check karein ki agar longitude column nahi hai tabhi add karein
            if (!Schema::hasColumn('users', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->comment('User location longitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('users', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};