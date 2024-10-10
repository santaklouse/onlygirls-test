<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::dropIfExists('model_swipes');
        Schema::create('model_swipes', function (Blueprint $table) {
            $table->integer('model_id');
            $table->boolean('like');
            $table->string('ip', 15)->collation('utf8mb4_unicode_ci');
            $table->string('session_id', 255);
            $table->timestamp('date')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->unique(['ip', 'model_id', 'date']);

            $table->index(['model_id', 'like']);

            $table->foreign('model_id')
                ->references('id')
                ->on('of_users')
            ;
        });
    }

    public function down()
    {
        Schema::dropIfExists('model_swipes');
    }
};
