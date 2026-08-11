<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\SuperAdmin;
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('image_action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(SuperAdmin::class);
            $table->string('image_url');
            $table->enum('action', ['uploaded', 'deleted']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('image_action_logs');
    }
};
