<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('members', 'candidate_profile')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->json('candidate_profile')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('candidate_profile');
        });
    }
};
