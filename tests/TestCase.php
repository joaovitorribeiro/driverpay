<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $manifestPath = base_path('public/build/manifest.json');
        if (! is_file($manifestPath)) {
            @mkdir(dirname($manifestPath), 0775, true);
            @file_put_contents($manifestPath, json_encode([
                'resources/js/app.jsx' => [
                    'file' => 'assets/app.js',
                    'isEntry' => true,
                    'src' => 'resources/js/app.jsx',
                ],
            ], JSON_UNESCAPED_SLASHES));
        }
    }
}
