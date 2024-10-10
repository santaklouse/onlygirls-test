<?php

use App\Http\Controllers\ModelController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/models');
});

Route::get('/models/{modelId?}', [ModelController::class, 'index'])
    ->whereNumber('modelId')
    ->name('models.index');
;
