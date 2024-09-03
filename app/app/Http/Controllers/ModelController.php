<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ModelController extends Controller
{

    public function index()
    {
        $response = Http::get('http://onlygirls-test-db-api:3000/models');
        $models = $response->json();

        return Inertia::render('Models', [
            'models' => $models,
        ]);
    }

    public function swipe(Request $request)
    {
        Http::post('http://onlygirls-test-db-api:3000/swipe', [
            'model_id' => $request->input('model_id'),
            'like' => $request->input('like'),
            'ip' => $request->ip(),
            'date' => now()->toDateTimeString(),
        ]);
    }
}
