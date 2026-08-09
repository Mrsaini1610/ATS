<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('notifications');

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('model');
            $table->unsignedBigInteger('listing_id');
            $table->unsignedBigInteger('job_id')->nullable();
            $table->string('type');
            $table->string('status')->default('unread');
            $table->timestamp('viewed_at')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['model', 'listing_id', 'status']);
            $table->index(['model', 'listing_id', 'viewed_at']);
            $table->index(['job_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

