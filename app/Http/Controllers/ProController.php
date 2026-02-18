<?php

namespace App\Http\Controllers;

use App\Models\PixPayment;
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

        $monthlyAmount = (float) config('mercadopago.plans.monthly.transaction_amount', 9.90);
        $annualAmount = (float) config('mercadopago.plans.annual.transaction_amount', 79.90);

        $monthlyBrl = number_format($monthlyAmount, 2, ',', '.');
        $annualBrl = number_format($annualAmount, 2, ',', '.');

        $purchaseWidget = [
            'pending_pix_count' => 0,
            'last_pending_pix' => null,
            'history_url' => route('billing.history', ['tab' => 'pix', 'status' => 'all']),
        ];

        if ($user) {
            $pendingPix = PixPayment::query()
                ->where('provider', 'mercadopago')
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->whereNull('paid_at')
                ->whereNotNull('expires_at')
                ->where('expires_at', '>', now())
                ->orderByDesc('created_at');

            $purchaseWidget['pending_pix_count'] = $pendingPix->count();

            $lastPending = $pendingPix->first();
            if ($lastPending) {
                $purchaseWidget['last_pending_pix'] = [
                    'provider_id' => $lastPending->payment_id,
                    'created_at' => $lastPending->created_at?->toISOString(),
                    'expires_at' => $lastPending->expires_at?->toISOString(),
                    'resume_url' => route('billing.mercadopago.pix', ['id' => $lastPending->payment_id]),
                ];
            }
        }

        return Inertia::render('Driver/Pro', [
            'entitlements' => [
                'is_pro' => $isPro,
            ],
            'pricing' => [
                'monthly_brl' => $monthlyBrl,
                'annual_brl' => $annualBrl,
                'monthly_amount' => $monthlyAmount,
                'annual_amount' => $annualAmount,
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
            'purchase_widget' => $purchaseWidget,
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
