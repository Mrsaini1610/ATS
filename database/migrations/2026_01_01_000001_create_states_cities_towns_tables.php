<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('states', function (Blueprint $table) {
            $table->increments('id');
            $table->uuid('uuid')->index();
            $table->string('name', 100);
            $table->string('country_code', 10)->default('IN');
            $table->string('country_name', 100)->default('India');
            $table->string('state_code', 20);
            $table->string('type', 50)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->string('state_uuid', 40)->index();
            $table->string('name', 150);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });

        Schema::create('towns', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->uuid('city_uuid')->index();
            $table->string('name', 150);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->unique(['name', 'city_uuid'], 'unique_town_per_city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('towns');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('states');
    }
};
