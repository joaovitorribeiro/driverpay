<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MercadoPagoBillingController extends Controller
{
    public function portal(Request $request): Response
    {
        $user = $request->user();

        $subscription = $user?->subscriptions()
            ->where('provider', 'mercadopago')
            ->latest()
            ->first();

        return Inertia::render('Driver/MercadoPagoBilling', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'current_period_end_at' => $subscription->current_period_end_at?->toISOString(),
                'purchase_token' => $subscription->purchase_token,
            ] : null,
        ]);
    }

    public function start(Request $request, MercadoPagoService $mp): SymfonyResponse
    {
        $request->validate([
            'plan' => 'required|in:monthly,annual',
        ]);

        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $plan = $request->string('plan')->toString();
        $planConfig = config("mercadopago.plans.{$plan}");
        if (! is_array($planConfig)) {
            abort(422);
        }

        $webhookUrl = config('services.mercadopago.webhook_url');
        $notificationUrl = is_string($webhookUrl) && trim($webhookUrl) !== ''
            ? $webhookUrl
            : rtrim(config('app.url'), '/').'/api/webhooks/mercadopago';

        $externalReference = $user->public_id
            ? 'user:'.$user->public_id
            : 'user:'.$user->id;

        $payload = [
            'reason' => is_string(config('mercadopago.reason')) ? config('mercadopago.reason') : 'Driver Pay - Pro',
            'payer_email' => $user->email,
            'external_reference' => $externalReference.';plan:'.$plan,
            'auto_recurring' => [
                'frequency' => (int) ($planConfig['frequency'] ?? 1),
                'frequency_type' => (string) ($planConfig['frequency_type'] ?? 'months'),
                'transaction_amount' => (float) ($planConfig['transaction_amount'] ?? 9.90),
                'currency_id' => (string) (config('mercadopago.currency') ?? 'BRL'),
            ],
            'back_url' => route('billing.mercadopago.return'),
            'notification_url' => $notificationUrl,
        ];

        $created = $mp->createPreapproval($payload);

        $preapprovalId = is_string($created['id'] ?? null) ? $created['id'] : null;
        $initPoint = is_string($created['init_point'] ?? null) ? $created['init_point'] : null;
        if (! $preapprovalId || ! $initPoint) {
            abort(502);
        }

        $nextPaymentDate = $created['auto_recurring']['next_payment_date'] ?? $created['next_payment_date'] ?? null;
        $periodEnd = is_string($nextPaymentDate) ? Carbon::parse($nextPaymentDate) : null;

        Subscription::updateOrCreate(
            [
                'provider' => 'mercadopago',
                'purchase_token' => $preapprovalId,
            ],
            [
                'user_id' => $user->id,
                'plan' => $plan,
                'status' => 'pending',
                'auto_renewing' => true,
                'started_at' => now(),
                'current_period_end_at' => $periodEnd,
                'raw' => $created,
            ]
        );

        return Inertia::location($initPoint);
    }

    public function cancel(Request $request, MercadoPagoService $mp): SymfonyResponse
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $subscription = $user->subscriptions()
            ->where('provider', 'mercadopago')
            ->whereNotIn('status', ['canceled'])
            ->latest()
            ->first();

        if (! $subscription || ! is_string($subscription->purchase_token) || trim($subscription->purchase_token) === '') {
            abort(404);
        }

        $cancelled = $mp->cancelPreapproval($subscription->purchase_token);

        $subscription->forceFill([
            'status' => 'canceled',
            'canceled_at' => now(),
            'ended_at' => now(),
            'raw' => $cancelled,
        ])->save();

        return Inertia::location(route('billing.mercadopago.portal'));
    }

    public function back(Request $request): SymfonyResponse
    {
        return Inertia::location(route('billing.mercadopago.portal'));
    }
}
