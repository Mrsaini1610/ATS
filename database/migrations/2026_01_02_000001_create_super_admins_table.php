<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('super_admins', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->nullable()->index();
            $table->string('name')->nullable();
            $table->string('username')->nullable()->unique();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('whatsapp_phone')->nullable();
            $table->string('password')->nullable();
            $table->string('profile_image')->nullable();
            $table->longText('roles')->nullable();
            $table->tinyInteger('status')->default(1);
            $table->rememberToken();
            $table->string('reset_password_token')->nullable();
            $table->timestamp('reset_password_token_expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('super_admin_password_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->string('email')->nullable()->index();
            $table->string('role')->nullable();
            $table->string('new_password')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('super_admin_password_logs');
        Schema::dropIfExists('super_admins');
    }
};
