<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('username')->nullable()->unique();
            $table->string('full_name')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable()->unique();
            $table->string('password')->nullable();
            $table->string('gender')->nullable();
            $table->date('dob')->nullable();
            $table->string('total_experience_years')->nullable();
            $table->string('current_ctc')->nullable();
            $table->string('expected_ctc')->nullable();
            $table->integer('notice_period_days')->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_picture')->nullable();
            $table->longText('skills')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_online')->default(0);
            $table->timestamp('last_active')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('user_educations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->uuid('user_uuid')->index();
            $table->string('degree');
            $table->string('institution');
            $table->string('field_of_study')->nullable();
            $table->integer('start_year');
            $table->integer('end_year')->nullable();
            $table->string('percentage_or_cgpa', 50)->nullable();
            $table->boolean('is_delete')->default(0);
            $table->timestamps();

            $table->foreign('user_uuid')->references('uuid')->on('users')->cascadeOnDelete();
        });

        Schema::create('user_experiences', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->uuid('user_uuid')->index();
            $table->string('company_name');
            $table->string('designation');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_delete')->default(0);
            $table->timestamps();

            $table->foreign('user_uuid')->references('uuid')->on('users')->cascadeOnDelete();
        });

        Schema::create('user_resumes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->uuid('user_uuid')->index();
            $table->string('title')->default('Default Resume');
            $table->string('file_path');
            $table->string('file_type')->default('pdf');
            $table->boolean('is_default')->default(0);
            $table->boolean('is_delete')->default(0);
            $table->timestamps();

            $table->foreign('user_uuid')->references('uuid')->on('users')->cascadeOnDelete();
        });

        Schema::create('user_certificates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->index();
            $table->uuid('user_uuid')->index();
            $table->string('title');
            $table->string('issuing_organization')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('credential_id')->nullable();
            $table->string('credential_url')->nullable();
            $table->boolean('is_delete')->default(0);
            $table->timestamps();

            $table->foreign('user_uuid')->references('uuid')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_certificates');
        Schema::dropIfExists('user_resumes');
        Schema::dropIfExists('user_experiences');
        Schema::dropIfExists('user_educations');
        Schema::dropIfExists('users');
    }
};
