<?php

namespace App\Http\Controllers\Webhooks;

use App\Models\BillingNotification;
use App\Models\Subscription;
use App\Models\User;
use App\Services\MercadoPagoService;
use App\Support\MercadoPagoWebhookSignature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use RuntimeException;
use Throwable;

class MercadoPagoWebhookController
{
    public function __invoke(Request $request, MercadoPagoService $mp): JsonResponse
    {
        $provider = 'mercadopago';
        $receivedAt = now();

        $eventType = $this->eventType($request);
        $notification = null;
        try {
            $notification = BillingNotification::create([
                'provider' => $provider,
                'event_type' => $eventType,
                'headers' => $request->headers->all(),
                'payload' => $request->all(),
                'received_at' => $receivedAt,
            ]);
        } catch (Throwable $e) {
            report($e);
        }

        try {
            $secret = config('services.mercadopago.webhook_secret');
            if (! is_string($secret) || trim($secret) === '') {
                throw new RuntimeException('MP webhook secret not configured.');
            }

            $dataId = $this->dataId($request);
            if (! MercadoPagoWebhookSignature::verify(
                $secret,
                $request->header('x-signature'),
                $request->header('x-request-id'),
                $dataId,
            )) {
                if ($notification) {
                    $notification->forceFill([
                        'processed_at' => now(),
                        'processing_error' => 'invalid_signature',
                    ])->save();
                }

                return response()->json(['ok' => false], 401);
            }

            [$preapproval, $payment] = $this->resolveResources($request, $mp, $dataId);

            if ($preapproval) {
                $user = $this->resolveUser($preapproval);
                if (! $user) {
                    throw new RuntimeException('User not resolved for preapproval.');
                }

                $subscription = $this->upsertSubscription($user, $preapproval);

                $subscription->events()->create([
                    'provider' => $provider,
                    'event_type' => $eventType,
                    'occurred_at' => $this->occurredAt($request),
                    'payload' => [
                        'webhook' => $request->all(),
                        'preapproval' => $preapproval,
                        'payment' => $payment,
                    ],
                ]);

                if ($notification) {
                    $notification->forceFill([
                        'processed_at' => now(),
                        'processing_error' => null,
                        'user_id' => $user->id,
                        'subscription_id' => $subscription->id,
                    ])->save();
                }
            } elseif ($payment) {
                $user = $this->resolveUserFromPayment($payment);
                if (! $user) {
                    throw new RuntimeException('User not resolved for payment.');
                }

                // Handle single payment (PIX)
                $this->processSinglePayment($user, $payment);

                if ($notification) {
                    $notification->forceFill([
                        'processed_at' => now(),
                        'processing_error' => null,
                        'user_id' => $user->id,
                    ])->save();
                }
            }

            return response()->json(['ok' => true]);
        } catch (Throwable $e) {
            report($e);

            if ($notification) {
                $notification->forceFill([
                    'processed_at' => now(),
                    'processing_error' => mb_substr($e->getMessage(), 0, 2000),
                ])->save();
            }

            return response()->json(['ok' => false], 500);
        }
    }

    private function eventType(Request $request): string
    {
        $type = $request->query('type') ?? $request->input('type');
        if (is_string($type) && trim($type) !== '') {
            return $type;
        }

        $topic = $request->query('topic') ?? $request->input('topic');
        if (is_string($topic) && trim($topic) !== '') {
            return $topic;
        }

        $action = $request->input('action');
        if (is_string($action) && trim($action) !== '') {
            return $action;
        }

        return 'unknown';
    }

    private function dataId(Request $request): ?string
    {
        $fromQuery = $request->query('data.id')
            ?? $request->query('data_id')
            ?? $request->query('id')
            ?? $request->query('resource');
        if (is_string($fromQuery) && trim($fromQuery) !== '') {
            return $fromQuery;
        }

        $fromBody = $request->input('data.id')
            ?? $request->input('data_id')
            ?? $request->input('id');
        if (is_string($fromBody) && trim($fromBody) !== '') {
            return $fromBody;
        }

        $data = $request->input('data');
        if (is_array($data) && is_string($data['id'] ?? null) && trim((string) $data['id']) !== '') {
            return (string) $data['id'];
        }

        return null;
    }

    private function resolveResources(Request $request, MercadoPagoService $mp, ?string $dataId): array
    {
        $type = $this->eventType($request);

        $looksLikePreapproval = str_contains($type, 'preapproval') || str_contains($type, 'subscription_preapproval');
        if ($looksLikePreapproval) {
            $preapprovalId = is_string($dataId) ? $this->resourceId($dataId) : null;
            if (! is_string($preapprovalId) || trim($preapprovalId) === '') {
                throw new RuntimeException('Preapproval id missing.');
            }

            return [$mp->getPreapproval($preapprovalId), null];
        }

        $looksLikePayment = str_contains($type, 'payment') || str_contains($type, 'subscription_authorized_payment');
        if ($looksLikePayment) {
            $paymentId = is_string($dataId) ? $this->resourceId($dataId) : null;
            if (! is_string($paymentId) || trim($paymentId) === '') {
                throw new RuntimeException('Payment id missing.');
            }

            $payment = $mp->getPayment($paymentId);
            
            // Check if it's a subscription payment
            $preapprovalId = is_string($payment['preapproval_id'] ?? null) ? $payment['preapproval_id'] : null;
            if ($preapprovalId) {
                return [$mp->getPreapproval($preapprovalId), $payment];
            }

            // It's a regular payment (PIX, etc)
            return [null, $payment];
        }

        if (is_string($dataId) && trim($dataId) !== '') {
            return [$mp->getPreapproval($this->resourceId($dataId)), null];
        }

        throw new RuntimeException('Unable to resolve resource.');
    }

    private function resolveUserFromPayment(array $payment): ?User
    {
        $email = $payment['payer']['email'] ?? null;
        if (is_string($email) && trim($email) !== '') {
            return User::query()->where('email', $email)->first();
        }

        return null;
    }

    private function processSinglePayment(User $user, array $payment): void
    {
        $status = $payment['status'] ?? null;
        $statusDetail = $payment['status_detail'] ?? null;

        if ($status === 'approved' && $statusDetail === 'accredited') {
            // Grant 30 days of access
            $currentBonus = $user->pro_bonus_until;
            $start = ($currentBonus && $currentBonus->isFuture()) ? $currentBonus : now();
            
            $user->forceFill([
                'pro_bonus_until' => $start->addDays(30),
            ])->save();
        }
    }

    private function resolveUser(array $preapproval): ?User
    {
        $external = $preapproval['external_reference'] ?? null;
        if (is_string($external) && trim($external) !== '') {
            $parts = explode(';', $external);
            foreach ($parts as $part) {
                $trim = trim($part);
                if (str_starts_with($trim, 'user:')) {
                    $id = trim(substr($trim, 5));
                    if ($id !== '') {
                        return User::query()
                            ->where('public_id', $id)
                            ->orWhere('id', $id)
                            ->first();
                    }
                }
            }
        }

        $email = $preapproval['payer_email'] ?? $preapproval['payer']['email'] ?? null;
        if (is_string($email) && trim($email) !== '') {
            return User::query()->where('email', $email)->first();
        }

        return null;
    }

    private function upsertSubscription(User $user, array $preapproval): Subscription
    {
        $preapprovalId = is_string($preapproval['id'] ?? null) ? $preapproval['id'] : null;
        if (! $preapprovalId) {
            throw new RuntimeException('Preapproval id missing in API response.');
        }

        $mpStatus = is_string($preapproval['status'] ?? null) ? $preapproval['status'] : null;
        $status = match ($mpStatus) {
            'authorized' => 'active',
            'paused' => 'paused',
            'cancelled' => 'canceled',
            'pending' => 'pending',
            default => 'unknown',
        };

        $startDate = $preapproval['auto_recurring']['start_date'] ?? $preapproval['date_created'] ?? null;
        $nextPayment = $preapproval['auto_recurring']['next_payment_date'] ?? $preapproval['next_payment_date'] ?? null;

        $startedAt = is_string($startDate) ? Carbon::parse($startDate) : null;
        $periodEnd = is_string($nextPayment) ? Carbon::parse($nextPayment) : null;

        if ($status === 'active' && ! $periodEnd) {
            $status = 'pending';
        }

        $subscription = Subscription::updateOrCreate(
            [
                'provider' => 'mercadopago',
                'purchase_token' => $preapprovalId,
            ],
            [
                'user_id' => $user->id,
                'plan' => $this->planFromExternalReference($preapproval['external_reference'] ?? null),
                'status' => $status,
                'auto_renewing' => $status === 'active' ? 'true' : 'false',
                'started_at' => $startedAt,
                'current_period_start_at' => $startedAt,
                'current_period_end_at' => $periodEnd,
                'canceled_at' => $status === 'canceled' ? now() : null,
                'ended_at' => $status === 'canceled' ? now() : null,
                'raw' => $preapproval,
            ],
        );

        return $subscription;
    }

    private function planFromExternalReference(mixed $externalReference): ?string
    {
        if (! is_string($externalReference) || trim($externalReference) === '') {
            return null;
        }

        $parts = explode(';', $externalReference);
        foreach ($parts as $part) {
            $trim = trim($part);
            if (str_starts_with($trim, 'plan:')) {
                $plan = trim(substr($trim, 5));
                return $plan !== '' ? $plan : null;
            }
        }

        return null;
    }

    private function occurredAt(Request $request): ?Carbon
    {
        $date = $request->input('date_created');
        if (is_string($date) && trim($date) !== '') {
            return Carbon::parse($date);
        }

        return null;
    }

    private function resourceId(string $value): string
    {
        $trim = trim($value);
        if ($trim === '') {
            return '';
        }

        $parsed = @parse_url($trim);
        if (is_array($parsed) && is_string($parsed['path'] ?? null)) {
            $base = basename($parsed['path']);
            if (is_string($base) && $base !== '' && $base !== '.') {
                return $base;
            }
        }

        if (str_contains($trim, '/')) {
            $base = basename($trim);
            return is_string($base) ? $base : $trim;
        }

        return $trim;
    }
}
