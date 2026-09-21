<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('super_admin_id')->default(1);
            $table->date('date');
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('status')->default(1);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->string('role')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('calendar_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('member_id')->nullable()->index();
            $table->date('date');
            $table->text('note');
            $table->boolean('is_private')->default(1);
            $table->string('role')->nullable();
            $table->timestamps();
        });

        Schema::create('check_in_outs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('member_id')->nullable()->index();
            $table->date('date');
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->string('check_in_ip', 45)->nullable();
            $table->string('check_out_ip', 45)->nullable();
            $table->text('check_in_notes')->nullable();
            $table->text('check_out_notes')->nullable();
            $table->integer('total_minutes')->nullable();
            $table->integer('edited_by')->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->string('role')->nullable();
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->unsignedBigInteger('super_admin_id')->index();
            $table->string('role')->nullable();
            $table->string('extension')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->enum('user_role', ['admin', 'doer']);
            $table->string('action_type', 50);
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->dateTime('action_time')->useCurrent();
            $table->timestamps();
        });

        Schema::create('image_action_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('super_admin_id')->index();
            $table->string('image_url');
            $table->enum('action', ['uploaded', 'deleted']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('image_action_logs');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('check_in_outs');
        Schema::dropIfExists('calendar_notes');
        Schema::dropIfExists('holidays');
    }
};
