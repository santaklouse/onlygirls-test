<?php

use App\Http\Controllers\ModelController;
use Illuminate\Support\Facades\Route;

Route::get('/models/replace-viewed', [ModelController::class, 'replaceViewed'])
    ->name('api.models.replace-viewed')
;

Route::get('/models/viewed', [ModelController::class, 'getViewed'])
    ->name('api.models.viewed')
;
Route::put('/models/grade', [ModelController::class, 'grade'])
    ->name('api.models.grade')
;
