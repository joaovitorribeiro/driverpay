<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        $manifest = public_path('build/manifest.json');
        if (File::exists($manifest)) {
            return md5_file($manifest) ?: (parent::version($request) ?? '0');
        }

        $hot = public_path('hot');
        if (File::exists($hot)) {
            return md5(File::get($hot)) ?: (parent::version($request) ?? '0');
        }

        return parent::version($request) ?? '0';
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isPro = $user ? $user->isProAccess() : false;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first(),
                ] : null,
            ],
            'billing' => $user ? [
                'plan' => $isPro ? 'pro' : 'free',
                'label' => $isPro ? 'Pro' : 'Conta Gratuita',
                'is_pro' => $isPro,
            ] : null,
            'can' => $user ? [
                'viewLogs' => $user->can('logs.view'),
                'deleteRecords' => $user->can('records.delete'),
                'manageUsers' => $user->can('users.manage'),
            ] : [],
        ];
    }
}
