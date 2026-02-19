<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'pro' => \App\Http\Middleware\EnsureProAccess::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\ResponseTiming::class,
            \App\Http\Middleware\NoCacheForAuthenticatedRoutes::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() !== 419) {
                return null;
            }

            Log::warning('csrf.token_mismatch', [
                'method' => $request->method(),
                'path' => $request->path(),
                'user_id' => $request->user()?->id,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'is_inertia' => (bool) $request->header('X-Inertia'),
            ]);

            if (auth()->check()) {
                auth()->logout();
            }

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            if ($request->header('X-Inertia')) {
                return response('', 409)->header('X-Inertia-Location', route('login'));
            }

            return redirect()->route('login');
        });
    })->create();
