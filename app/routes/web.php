<?php

use App\Http\Controllers\ModelController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/models');
});
Route::get('/models', [ModelController::class, 'index']);
Route::post('/models/swipe', [ModelController::class, 'swipe']);
