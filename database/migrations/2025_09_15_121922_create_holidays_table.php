<?php

use App\Models\SuperAdmin;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(SuperAdmin::class)->nullable();
            $table->date('date')->nullable(false);
            $table->string('name', 255)->nullable(false);
            $table->text('description')->nullable();
            $table->integer('created_by')->nullable();
            $table->string('role')->nullable()->default(null);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('holidays');
    }
};
