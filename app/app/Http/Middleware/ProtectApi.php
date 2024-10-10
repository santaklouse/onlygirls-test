<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ProtectApi
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->headers->get('X-CSRF-Token');
        if (!$request->ajax() || $token != $request->session()->token()) {
            return response()->json(['message' => 'API access is restricted'], 403);
        }

        return $next($request);
    }

}
