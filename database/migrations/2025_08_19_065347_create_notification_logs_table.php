<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->string('type')->nullable();
            $table->text('morphs')->nullable();
            $table->text('data')->nullable();
            $table->string('title')->nullable();
            $table->text('message');
            $table->string('channel');
            $table->string('status')->default('sent');
            $table->text('error')->nullable();
            $table->string('redirect_url')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
                        $table->foreignIdFor(User::class,'sender_id')->nullable();
                                    $table->foreignIdFor(User::class,'receiver_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
