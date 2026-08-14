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
       Schema::create('user_educations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('degree'); // BCA, B.Tech, MCA
    $table->string('institution');
    $table->string('field_of_study')->nullable();
    $table->integer('start_year');
    $table->integer('end_year')->nullable();
    $table->decimal('percentage_or_cgpa', 4, 2)->nullable();
    $table->timestamps();

    
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_educations');
    }
};
