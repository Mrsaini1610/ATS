<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\SuperAdmin;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('uuid');
                $table->string('slug');
                $table->string('name');
                $table->boolean('status')->default(1);
                $table->foreignIdFor(SuperAdmin::class, 'created_by');
                $table->timestamps();
                $table->softDeletes();
                $table->unique('slug', 'roles_slug_unique_2');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
