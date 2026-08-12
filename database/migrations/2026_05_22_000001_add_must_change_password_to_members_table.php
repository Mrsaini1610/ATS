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
        Schema::table('members', function (Blueprint $table) {
            // Check karein ki agar must_change_password column nahi hai tabhi add karein
            if (!Schema::hasColumn('members', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('password');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'must_change_password')) {
                $table->dropColumn('must_change_password');
            }
        });
    }
};