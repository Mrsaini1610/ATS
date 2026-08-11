<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('members')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            if (! Schema::hasColumn('members', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('resume_uploaded_at');
            }

            if (! Schema::hasColumn('members', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }

            if (! Schema::hasColumn('members', 'current_address')) {
                $table->string('current_address')->nullable()->after('longitude');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('members')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('members', 'current_address')) {
                $columns[] = 'current_address';
            }

            if (Schema::hasColumn('members', 'longitude')) {
                $columns[] = 'longitude';
            }

            if (Schema::hasColumn('members', 'latitude')) {
                $columns[] = 'latitude';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
