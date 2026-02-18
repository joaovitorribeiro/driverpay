<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $configuredCompiled = config('view.compiled');
        $compiledPath = is_string($configuredCompiled) ? $configuredCompiled : null;

        $fallbackCompiled = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR)
            .DIRECTORY_SEPARATOR.'driverpay'
            .DIRECTORY_SEPARATOR.'views';

        $ensureDir = function (?string $path): bool {
            if (! is_string($path) || trim($path) === '') {
                return false;
            }

            if (! is_dir($path)) {
                @mkdir($path, 0775, true);
            }

            return is_dir($path) && is_writable($path);
        };

        if (! $ensureDir($compiledPath) && $ensureDir($fallbackCompiled)) {
            config(['view.compiled' => $fallbackCompiled]);
        }

        $logsPath = storage_path('logs');
        if (! $ensureDir($logsPath)) {
            config(['logging.default' => 'stderr']);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
