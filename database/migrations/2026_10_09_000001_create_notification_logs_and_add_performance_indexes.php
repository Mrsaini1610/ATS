<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create notification_logs table for push notification tracking & audit
        if (!Schema::hasTable('notification_logs')) {
            Schema::create('notification_logs', function (Blueprint $table) {
                $table->id();
                $table->uuid('uuid')->unique();
                $table->unsignedBigInteger('receiver_id')->index();
                $table->unsignedBigInteger('sender_id')->nullable()->index();
                $table->string('type', 50)->default('general')->index();
                $table->string('channel', 30)->default('fcm');
                $table->string('title');
                $table->text('message');
                $table->json('data')->nullable();
                $table->text('token')->nullable();
                $table->string('device_id')->nullable();
                $table->string('status', 30)->default('sent')->index(); // sent, failed, delivered, read
                $table->text('error')->nullable();
                $table->text('redirect_url')->nullable();
                $table->json('response_payload')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['receiver_id', 'status']);
                $table->index(['receiver_id', 'created_at']);
                $table->index(['status', 'created_at']);
            });
        }

        // 2. Add performance & search indexes to core tables if not already present
        Schema::table('job_posts', function (Blueprint $table) {
            $existing = collect(DB::select("SHOW INDEXES FROM job_posts"))->pluck('Key_name')->unique()->toArray();
            
            if (!in_array('job_posts_status_is_deleted_index', $existing)) {
                $table->index(['status', 'is_deleted'], 'job_posts_status_is_deleted_index');
            }
            if (!in_array('job_posts_lat_lng_index', $existing)) {
                $table->index(['latitude', 'longitude'], 'job_posts_lat_lng_index');
            }
            if (!in_array('job_posts_location_index', $existing)) {
                $table->index('location', 'job_posts_location_index');
            }
            if (!in_array('job_posts_created_at_index', $existing)) {
                $table->index('created_at', 'job_posts_created_at_index');
            }
        });

        if (Schema::hasTable('job_applications')) {
            Schema::table('job_applications', function (Blueprint $table) {
                $existing = collect(DB::select("SHOW INDEXES FROM job_applications"))->pluck('Key_name')->unique()->toArray();
                if (!in_array('job_applications_candidate_status_index', $existing)) {
                    $table->index(['candidate_id', 'status'], 'job_applications_candidate_status_index');
                }
                if (!in_array('job_applications_job_status_index', $existing)) {
                    $table->index(['job_id', 'status'], 'job_applications_job_status_index');
                }
            });
        }

        if (Schema::hasTable('fcm_tokens')) {
            Schema::table('fcm_tokens', function (Blueprint $table) {
                $existing = collect(DB::select("SHOW INDEXES FROM fcm_tokens"))->pluck('Key_name')->unique()->toArray();
                if (!in_array('fcm_tokens_user_deleted_index', $existing)) {
                    $table->index(['user_id', 'deleted_at'], 'fcm_tokens_user_deleted_index');
                }
            });
        }

        if (Schema::hasTable('cities')) {
            Schema::table('cities', function (Blueprint $table) {
                $existing = collect(DB::select("SHOW INDEXES FROM cities"))->pluck('Key_name')->unique()->toArray();
                if (!in_array('cities_lat_lng_index', $existing)) {
                    $table->index(['latitude', 'longitude'], 'cities_lat_lng_index');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');

        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropIndex('job_posts_status_is_deleted_index');
            $table->dropIndex('job_posts_lat_lng_index');
            $table->dropIndex('job_posts_location_index');
            $table->dropIndex('job_posts_created_at_index');
        });

        if (Schema::hasTable('job_applications')) {
            Schema::table('job_applications', function (Blueprint $table) {
                $table->dropIndex('job_applications_candidate_status_index');
                $table->dropIndex('job_applications_job_status_index');
            });
        }

        if (Schema::hasTable('fcm_tokens')) {
            Schema::table('fcm_tokens', function (Blueprint $table) {
                $table->dropIndex('fcm_tokens_user_deleted_index');
            });
        }

        if (Schema::hasTable('cities')) {
            Schema::table('cities', function (Blueprint $table) {
                $table->dropIndex('cities_lat_lng_index');
            });
        }
    }
};
