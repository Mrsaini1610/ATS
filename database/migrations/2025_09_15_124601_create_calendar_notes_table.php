<?php

use App\Models\Member;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('calendar_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Member::class)->nullable();
            $table->date('date')->nullable(false);
            $table->text('note')->nullable(false);
            $table->boolean('is_private')->default(true);
            $table->string('role')->nullable()->default(null);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('calendar_notes');
    }
};
