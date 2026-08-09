<?php

use App\Models\SuperAdmin;
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
        Schema::table('task_assignments', function (Blueprint $table) {
            $table->string('assigned_by_type')->default('superadmin')->after('assigned_by');
            $table->boolean('is_transferred')->default(false)->after('assigned_by_type');
            $table->foreignIdFor(SuperAdmin::class, 'parent_assignment_id')->nullable()->after('is_transferred');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_assignments', function (Blueprint $table) {
         $table->dropColumn(['assigned_by_type', 'is_transferred', 'parent_assignment_id']);
        });
    }
};
