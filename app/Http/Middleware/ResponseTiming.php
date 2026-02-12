<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResponseTiming
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = hrtime(true);
        $response = $next($request);
        $durationMs = (hrtime(true) - $start) / 1_000_000;

        $response->headers->set('Server-Timing', 'app;dur='.number_format($durationMs, 2, '.', ''));
        $response->headers->set('X-Response-Time', number_format($durationMs, 2, '.', '').'ms');

        return $response;
    }
}

