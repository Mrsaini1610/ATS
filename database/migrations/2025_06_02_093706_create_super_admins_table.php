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
        Schema::create('super_admins', function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->longText('roles');
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('whatsapp_phone');
            $table->string('password');
            $table->tinyInteger('status')->default(1)->comment('1-Active, 0-InActive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('super_admins');
    }
};
