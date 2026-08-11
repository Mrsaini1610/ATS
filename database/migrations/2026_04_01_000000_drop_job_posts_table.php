<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop table if exists to clean up
        Schema::dropIfExists('job_posts');
    }

    public function down(): void
    {
        // Nothing to rollback
    }
};
