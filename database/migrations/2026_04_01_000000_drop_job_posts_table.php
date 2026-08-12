<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Foreign Key checks ko temporarily disable karein
        Schema::disableForeignKeyConstraints();

        // 2. Table drop karein
        Schema::dropIfExists('job_posts');

        // 3. Foreign Key checks ko waapas enable karein
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};