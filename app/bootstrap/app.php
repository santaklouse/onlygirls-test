<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ProtectApi;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Http\Middleware\TrimStrings;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Middleware\ValidatePostSize;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

ini_set('memory_limit', '2048M');

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        $middleware->alias([
            'protect_api' => ProtectApi::class
        ]);
        $middleware->authenticateSessions();
        $middleware
            ->web(append: [
                HandleInertiaRequests::class,
            ],remove: [AuthenticateSession::class, ValidateCsrfToken::class, EncryptCookies::class, AddQueuedCookiesToResponse::class])
            ->api(append: [
                StartSession::class,
                'protect_api'
            ])
        ;
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function ($response, Throwable $exception, Request $request) {
            if (! app()->environment(['local', 'testing', 'dev']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return inertia('Error', [
                    'status' => $response->getStatusCode(),
                    'appName' => Inertia::always(config('app.name')),
                ])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }
            return $response;
        });
    })
    ->create();
