<?php

use App\Models\Member;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('check_in_outs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Member::class)->nullable()->constrained()->nullOnDelete();
            $table->date('date')->nullable(false);
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->string('check_in_ip', 45)->nullable();
            $table->string('check_out_ip', 45)->nullable();
            $table->text('check_in_notes')->nullable();
            $table->text('check_out_notes')->nullable();
            $table->integer('total_minutes')->nullable()->comment('Total minutes worked');
            $table->integer('edited_by')->nullable()->comment('Admin who edited the record');
            $table->timestamp('edited_at')->nullable();
            $table->string('role')->nullable()->default(null);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('check_in_outs');
    }
};
