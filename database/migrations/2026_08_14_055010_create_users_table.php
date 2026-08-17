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
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->string('username')->nullable()->unique();
                $table->string('full_name')->nullable();
                $table->string('email')->nullable()->unique();
                $table->string('phone')->nullable()->unique();
                $table->string('password')->nullable(); // Standard auth password field
                $table->string('gender')->nullable();
                $table->date('dob')->nullable();

                // Experience & CTC Details
                $table->string('total_experience_years')->nullable();
                $table->string('current_ctc')->nullable();
                $table->string('expected_ctc')->nullable();
                $table->integer('notice_period_days')->nullable();

                // Profile Info
                $table->text('bio')->nullable();
                $table->string('profile_picture')->nullable();
                $table->json('skills')->nullable(); // Model me array cast hai

                // Address & Location
                $table->text('address')->nullable();
                $table->string('city')->nullable();
                $table->string('state')->nullable();
                $table->string('pincode')->nullable();
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();

                // User Status
                $table->boolean('is_online')->default(false);
                $table->timestamp('last_active')->nullable();

                $table->rememberToken();
                $table->timestamps();
                if (!Schema::hasColumn('users', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('uuid')->constrained('categories')->onDelete('set null');
            }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};