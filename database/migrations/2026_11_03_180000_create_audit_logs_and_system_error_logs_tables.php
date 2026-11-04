<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('actor_type', 30)->default('system')->index();
                $table->unsignedBigInteger('actor_id')->nullable()->index();
                $table->string('actor_name')->nullable();
                $table->string('actor_email')->nullable();
                $table->string('action', 80)->index();
                $table->string('module', 50)->default('general')->index();
                $table->string('entity_type', 80)->nullable();
                $table->string('entity_id', 80)->nullable()->index();
                $table->text('description');
                $table->json('details')->nullable();
                $table->string('status', 30)->default('success')->index(); // success, incomplete, stalled, failed, warning
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('platform', 20)->default('web')->index(); // web, app, api
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('system_error_logs')) {
            Schema::create('system_error_logs', function (Blueprint $table) {
                $table->id();
                $table->text('message');
                $table->string('exception_class')->nullable()->index();
                $table->string('file')->nullable();
                $table->integer('line')->nullable();
                $table->longText('trace')->nullable();
                $table->integer('status_code')->default(500)->index();
                $table->text('url')->nullable();
                $table->string('method', 10)->nullable();
                $table->string('actor_type', 30)->nullable();
                $table->unsignedBigInteger('actor_id')->nullable()->index();
                $table->string('actor_name')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->json('request_data')->nullable();
                $table->boolean('is_resolved')->default(false)->index();
                $table->dateTime('resolved_at')->nullable();
                $table->unsignedBigInteger('resolved_by')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_error_logs');
        Schema::dropIfExists('audit_logs');
    }
};

