<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRememberTokenToSuperAdminsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (! Schema::hasTable('super_admins')) {
            return;
        }

        if (! Schema::hasColumn('super_admins', 'remember_token')) {
            Schema::table('super_admins', function (Blueprint $table) {
                $table->string('remember_token', 100)->nullable()->after('password');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (! Schema::hasTable('super_admins')) {
            return;
        }

        if (Schema::hasColumn('super_admins', 'remember_token')) {
            Schema::table('super_admins', function (Blueprint $table) {
                $table->dropColumn('remember_token');
            });
        }
    }
}
