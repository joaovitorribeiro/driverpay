<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class LogViewerController extends Controller
{
    public function index(Request $request): Response
    {
        $path = storage_path('logs/laravel.log');
        $exists = File::exists($path);

        $content = '';
        $size = 0;
        $lastModified = null;

        if ($exists) {
            $size = File::size($path);
            $lastModified = File::lastModified($path);
            $content = $this->tailBytes($path, 300_000);
        }

        return Inertia::render('Logs/Index', [
            'log' => [
                'exists' => $exists,
                'size' => $size,
                'last_modified' => $lastModified,
                'content' => $content,
            ],
        ]);
    }

    private function tailBytes(string $path, int $maxBytes): string
    {
        $handle = fopen($path, 'rb');
        if (! $handle) {
            return '';
        }

        $stat = fstat($handle);
        $size = is_array($stat) && isset($stat['size']) ? (int) $stat['size'] : 0;
        $start = max($size - $maxBytes, 0);

        fseek($handle, $start);
        $chunk = stream_get_contents($handle) ?: '';
        fclose($handle);

        if ($start > 0) {
            $firstNewline = strpos($chunk, "\n");
            if ($firstNewline !== false) {
                $chunk = substr($chunk, $firstNewline + 1);
            }
        }

        return $chunk;
    }
}

