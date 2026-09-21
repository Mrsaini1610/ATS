<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('admin_id')->constrained('admins')->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['admin_id', 'read_at']);
            $table->index(['admin_id', 'created_at']);
        });

        Schema::create('bulk_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->enum('channel', ['whatsapp', 'email', 'sms'])->default('whatsapp');
            $table->string('target_audience', 100)->default('all');
            $table->integer('recipient_count')->default(0);
            $table->text('message');
            $table->foreignId('sent_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->enum('status', ['queued', 'sent', 'failed'])->default('sent');
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->boolean('is_read')->default(0);
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::create('fcm_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('guard');
            $table->text('device_id')->nullable();
            $table->text('token')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('task_id')->nullable();
            $table->string('subject')->nullable();
            $table->string('to')->nullable();
            $table->string('from')->nullable();
            $table->longText('body_html')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->string('error_code', 100)->nullable();
            $table->text('error_message')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('fcm_tokens');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('bulk_messages');
        Schema::dropIfExists('admin_notifications');
    }
};
