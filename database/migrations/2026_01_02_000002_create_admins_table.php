<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');
            $table->enum('role', ['super_admin', 'admin', 'team_member'])->default('team_member')->index();
            $table->json('permissions')->nullable();
            $table->string('profile_image')->nullable();
            $table->boolean('status')->default(1)->comment('1: Active, 0: Inactive');
            $table->boolean('must_change_password')->default(0);
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->rememberToken();
            $table->string('reset_password_token')->nullable();
            $table->timestamp('reset_password_token_expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
