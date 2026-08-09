<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->string('username')->nullable()->change();
            $table->char('uuid', 36)->nullable()->change();
            $table->longText('roles')->nullable()->change();
            $table->string('name')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('whatsapp_phone')->nullable()->change();
            $table->string('password')->nullable()->change();
            $table->tinyInteger('status')->nullable()->default(1)->change();
            $table->timestamp('created_at')->nullable()->change();
            $table->timestamp('updated_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->string('username')->nullable(false)->change();
            $table->char('uuid', 36)->nullable(false)->change();
            $table->longText('roles')->nullable(false)->change();
            $table->string('name')->nullable(false)->change();
            $table->string('email')->nullable(false)->change();
            $table->string('phone')->nullable(false)->change();
            $table->string('whatsapp_phone')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
            $table->tinyInteger('status')->nullable(false)->default(1)->change();
            $table->timestamp('created_at')->nullable()->change();
            $table->timestamp('updated_at')->nullable()->change();
        });
    }
};
