<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('task_documents', function (Blueprint $table) {
        $table->string('type')->nullable()->after('path');
    });
}

public function down()
{
    Schema::table('task_documents', function (Blueprint $table) {
        $table->dropColumn('type');
    });
}
};
