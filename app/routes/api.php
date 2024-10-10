<?php

use App\Http\Controllers\ModelController;
use Illuminate\Support\Facades\Route;

Route::put('/model/grade', [ModelController::class, 'grade'])
    ->name('api.grade.new')
;
