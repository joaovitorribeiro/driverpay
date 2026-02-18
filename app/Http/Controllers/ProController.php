<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ProController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $isPro = $user ? $user->isProAccess() : false;
        $mpEnabled = is_string(config('services.mercadopago.access_token')) && trim((string) config('services.mercadopago.access_token')) !== '';

        return Inertia::render('Driver/Pro', [
            'entitlements' => [
                'is_pro' => $isPro,
            ],
            'pricing' => [
                'monthly_brl' => '9,90',
                'annual_brl' => '79,90',
            ],
            'google_billing' => [
                'manage_url' => $this->googleManageUrl(),
                'package_name' => env('GOOGLE_PLAY_PACKAGE_NAME'),
                'sku_monthly' => env('GOOGLE_PLAY_SUBSCRIPTION_SKU_MONTHLY'),
                'sku_annual' => env('GOOGLE_PLAY_SUBSCRIPTION_SKU_ANNUAL'),
            ],
            'mercadopago_billing' => [
                'enabled' => $mpEnabled,
                'portal_url' => route('billing.mercadopago.portal'),
            ],
        ]);
    }

    public function start(Request $request): SymfonyResponse
    {
        $request->validate([
            'plan' => 'required|in:monthly,annual',
        ]);

        $plan = $request->string('plan')->toString();

        $sku = $plan === 'annual'
            ? env('GOOGLE_PLAY_SUBSCRIPTION_SKU_ANNUAL')
            : env('GOOGLE_PLAY_SUBSCRIPTION_SKU_MONTHLY');

        $packageName = env('GOOGLE_PLAY_PACKAGE_NAME');

        $url = $this->googleManageUrl($packageName, is_string($sku) ? $sku : null);

        return Inertia::location($url);
    }

    public function manage(): SymfonyResponse
    {
        return Inertia::location($this->googleManageUrl());
    }

    private function googleManageUrl(?string $packageName = null, ?string $sku = null): string
    {
        $base = 'https://play.google.com/store/account/subscriptions';

        $package = $packageName ?? env('GOOGLE_PLAY_PACKAGE_NAME');
        $query = [];

        if (is_string($package) && trim($package) !== '') {
            $query['package'] = $package;
        }

        if (is_string($sku) && trim($sku) !== '') {
            $query['sku'] = $sku;
        }

        if (! $query) {
            return $base;
        }

        return $base.'?'.http_build_query($query);
    }
}
