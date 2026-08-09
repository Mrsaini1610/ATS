<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('members', 'resume_path')) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->string('resume_path')->nullable()->after('candidate_profile');
            $table->string('resume_original_name')->nullable()->after('resume_path');
            $table->string('resume_mime')->nullable()->after('resume_original_name');
            $table->unsignedBigInteger('resume_size')->nullable()->after('resume_mime');
            $table->timestamp('resume_uploaded_at')->nullable()->after('resume_size');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'resume_path',
                'resume_original_name',
                'resume_mime',
                'resume_size',
                'resume_uploaded_at',
            ]);
        });
    }
};
