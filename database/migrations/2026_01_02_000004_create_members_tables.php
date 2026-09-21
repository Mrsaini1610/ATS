<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->index();
            $table->unsignedBigInteger('created_by')->default(1);
            $table->unsignedBigInteger('assigned_admin_id')->nullable()->index();
            $table->boolean('is_calling_team')->default(0);
            $table->string('name');
            $table->string('username');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->boolean('must_change_password')->default(0);
            $table->string('status')->default('1');
            $table->longText('roles')->nullable();
            $table->longText('designation')->nullable();
            $table->longText('departments')->nullable();
            $table->string('slug');
            $table->string('otp')->nullable();
            $table->timestamp('otp_expire')->nullable();
            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->timestamp('phone_verify_at')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('current_address')->nullable();
            $table->text('image')->nullable();
            $table->longText('candidate_profile')->nullable();
            $table->string('resume_path')->nullable();
            $table->string('resume_original_name')->nullable();
            $table->string('resume_mime')->nullable();
            $table->unsignedBigInteger('resume_size')->nullable();
            $table->timestamp('resume_uploaded_at')->nullable();
            $table->rememberToken();
            $table->string('reset_password_token')->nullable();
            $table->timestamp('reset_password_token_expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['assigned_admin_id', 'is_calling_team'], 'members_assigned_admin_calling_idx');
        });

        Schema::create('member_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('member_department', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('member_designation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('designation_id')->constrained('designations')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_designation');
        Schema::dropIfExists('member_department');
        Schema::dropIfExists('member_roles');
        Schema::dropIfExists('members');
    }
};
