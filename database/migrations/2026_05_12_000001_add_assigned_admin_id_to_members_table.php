<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('members', 'assigned_admin_id')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_admin_id')->nullable()->after('created_by');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('members', 'assigned_admin_id')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('assigned_admin_id');
        });
    }
};
