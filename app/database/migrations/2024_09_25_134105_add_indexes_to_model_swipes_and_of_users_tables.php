<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('model_swipes', function (Blueprint $table) {
            $table->index(['model_id', 'like'], 'model_id_like_index');
        });

        Schema::table('of_users', function (Blueprint $table) {
            $table->index('favorites_count');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('model_swipes', function (Blueprint $table) {
            $table->dropIndex('model_id_like_index');
        });

        Schema::table('of_users', function (Blueprint $table) {
            $table->dropIndex(['favorites_count']);
        });
    }
};
