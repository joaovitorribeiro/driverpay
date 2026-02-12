<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoCacheForAuthenticatedRoutes
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $route = $request->route();
        $middlewares = $route ? $route->gatherMiddleware() : [];

        $hasAuth = false;
        foreach ($middlewares as $middleware) {
            if ($middleware === 'auth' || str_starts_with($middleware, 'auth:')) {
                $hasAuth = true;
                break;
            }
        }

        if (! $hasAuth) {
            return $response;
        }

        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}

