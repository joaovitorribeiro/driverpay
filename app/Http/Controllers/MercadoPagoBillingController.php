<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\MercadoPagoService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

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
        $traceId = (string) Str::uuid();

        $request->validate([
            'plan' => 'required|in:monthly,annual',
            'method' => 'nullable|in:card,pix',
            'cpf' => 'nullable|string',
        ]);

        $mpEnabled = is_string(config('services.mercadopago.access_token')) && trim((string) config('services.mercadopago.access_token')) !== '';
        if (! $mpEnabled) {
            Log::error('mercadopago.start.missing_access_token', [
                'trace_id' => $traceId,
                'user_id' => $request->user()?->id,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Configure o MP_ACCESS_TOKEN para habilitar o Mercado Pago. (código {$traceId})",
            ]);
        }

        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $plan = $request->string('plan')->toString();
        $method = $request->string('method')->toString();
        $planConfig = config("mercadopago.plans.{$plan}");
        if (! is_array($planConfig)) {
            Log::error('mercadopago.start.invalid_plan', [
                'trace_id' => $traceId,
                'user_id' => $user->id,
                'plan' => $plan,
                'method' => $method,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Plano inválido. (código {$traceId})",
            ]);
        }

        $webhookUrl = config('services.mercadopago.webhook_url');
        $notificationUrl = is_string($webhookUrl) && trim($webhookUrl) !== ''
            ? $webhookUrl
            : rtrim(config('app.url'), '/').'/api/webhooks/mercadopago';

        $notificationUrl = trim((string) $notificationUrl);
        $notificationUrl = str_replace(["`", "\r", "\n", "\t"], '', $notificationUrl);
        $notificationUrl = trim($notificationUrl, " \"'");

        if (! filter_var($notificationUrl, FILTER_VALIDATE_URL)) {
            Log::error('mercadopago.start.invalid_notification_url', [
                'trace_id' => $traceId,
                'user_id' => $user->id,
                'plan' => $plan,
                'method' => $method,
                'notification_url' => $notificationUrl,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Webhook URL inválida. Verifique APP_URL/MP_WEBHOOK_URL. (código {$traceId})",
            ]);
        }

        // Se for PIX, cria pagamento avulso
        if ($method === 'pix') {
            $cpfDigits = preg_replace('/\D+/', '', (string) $request->input('cpf'));
            $cpfDigits = is_string($cpfDigits) ? trim($cpfDigits) : '';
            if ($cpfDigits === '' || strlen($cpfDigits) !== 11) {
                throw ValidationException::withMessages([
                    'cpf' => 'Informe um CPF válido (11 dígitos).',
                ]);
            }

            return $this->startPix($user, $mp, $plan, $planConfig, $notificationUrl, $cpfDigits);
        }

        // Caso contrário, segue fluxo de assinatura (Card)
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
            'back_url' => rtrim(config('app.url'), '/').'/billing/mercadopago/return',
            'notification_url' => $notificationUrl,
        ];

        try {
            $created = $mp->createPreapproval($payload);
        } catch (RequestException $e) {
            $status = $e->response?->status();
            $json = $e->response?->json();
            $mpMessage = is_array($json) && is_string($json['message'] ?? null) ? $json['message'] : null;
            $mpError = is_array($json) && is_string($json['error'] ?? null) ? $json['error'] : null;

            report($e);
            Log::error('mercadopago.start.preapproval_request_failed', [
                'trace_id' => $traceId,
                'user_id' => $user->id,
                'plan' => $plan,
                'status' => $status,
                'mp_error' => $mpError,
                'mp_message' => $mpMessage,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Não foi possível iniciar a assinatura no Mercado Pago. (código {$traceId})",
            ]);
        } catch (Throwable $e) {
            report($e);
            Log::error('mercadopago.start.preapproval_failed', [
                'trace_id' => $traceId,
                'user_id' => $user->id,
                'plan' => $plan,
                'exception' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Não foi possível iniciar a assinatura no Mercado Pago. (código {$traceId})",
            ]);
        }

        $preapprovalId = is_string($created['id'] ?? null) ? $created['id'] : null;
        $initPoint = is_string($created['init_point'] ?? null) ? $created['init_point'] : null;
        if (! $preapprovalId || ! $initPoint) {
            Log::error('mercadopago.start.preapproval_invalid_response', [
                'trace_id' => $traceId,
                'user_id' => $user->id,
                'plan' => $plan,
                'has_id' => (bool) $preapprovalId,
                'has_init_point' => (bool) $initPoint,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Resposta inválida do Mercado Pago ao iniciar assinatura. (código {$traceId})",
            ]);
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
                'auto_renewing' => 'true',
                'started_at' => now(),
                'current_period_end_at' => $periodEnd,
                'raw' => $created,
            ]
        );

        return Inertia::location($initPoint);
    }

    private function startPix($user, MercadoPagoService $mp, string $plan, array $planConfig, string $notificationUrl, string $cpfDigits): SymfonyResponse
    {
        $traceId = (string) Str::uuid();

        $token = config('services.mercadopago.access_token');
        if (is_string($token) && str_starts_with($token, 'TEST-')) {
            Log::error('mercadopago.start.pix_test_token', [
                'trace_id' => $traceId,
                'user_id' => $user?->id,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "PIX não pode ser iniciado com token de teste em produção. Use credenciais de produção (APP_USR-...). (código {$traceId})",
            ]);
        }

        try {
            $hasPix = $mp->hasPaymentMethod('pix');
        } catch (Throwable $e) {
            report($e);
            $hasPix = true;
        }

        if (! $hasPix) {
            Log::error('mercadopago.start.pix_not_available', [
                'trace_id' => $traceId,
                'user_id' => $user?->id,
                'plan' => $plan,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "PIX não está habilitado para este access token/conta do Mercado Pago. Verifique se a conta é BR e se PIX está disponível. (código {$traceId})",
            ]);
        }

        $amount = (float) ($planConfig['transaction_amount'] ?? 9.90);
        $expiresAt = now()->addMinutes(15);
        $expiresAtIso = $expiresAt
            ->copy()
            ->setTimezone('UTC')
            ->format('Y-m-d\\TH:i:s\\U\\T\\C');
        $externalReference = $user->public_id
            ? 'user:'.$user->public_id
            : 'user:'.$user->id;
        
        $payload = [
            'transaction_amount' => $amount,
            'description' => 'Driver Pay - Plano Pro (PIX 30 dias)',
            'external_reference' => $externalReference.';plan:'.$plan.';kind:pix',
            'metadata' => [
                'kind' => 'pro_pix_30d',
                'plan' => $plan,
                'user_id' => $user->id,
                'user_public_id' => $user->public_id,
            ],
            'payment_method_id' => 'pix',
            'payer' => [
                'email' => $user->email,
                'identification' => [
                    'type' => 'CPF',
                    'number' => $cpfDigits,
                ],
            ],
            'notification_url' => $notificationUrl,
            'date_of_expiration' => $expiresAtIso,
        ];

        try {
            $payment = $mp->createPayment($payload);
        } catch (RequestException $e) {
            $status = $e->response?->status();
            $json = $e->response?->json();
            $mpMessage = is_array($json) && is_string($json['message'] ?? null) ? $json['message'] : null;
            $mpError = is_array($json) && is_string($json['error'] ?? null) ? $json['error'] : null;

            report($e);
            Log::error('mercadopago.start.pix_request_failed', [
                'trace_id' => $traceId,
                'user_id' => $user?->id,
                'plan' => $plan,
                'status' => $status,
                'mp_error' => $mpError,
                'mp_message' => $mpMessage,
                'date_of_expiration' => $expiresAtIso,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Não foi possível gerar o PIX no Mercado Pago. MP: ".trim((string) ($mpMessage ?: $mpError ?: $status ?: 'erro')).". (código {$traceId})",
            ]);
        } catch (Throwable $e) {
            report($e);
            Log::error('mercadopago.start.pix_failed', [
                'trace_id' => $traceId,
                'user_id' => $user?->id,
                'plan' => $plan,
                'exception' => $e->getMessage(),
                'date_of_expiration' => $expiresAtIso,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Não foi possível gerar o PIX no Mercado Pago. (código {$traceId})",
            ]);
        }

        $paymentId = $payment['id'] ?? null;
        $qrCode = $payment['point_of_interaction']['transaction_data']['qr_code'] ?? null;
        $qrCodeBase64 = $payment['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null;

        if (!$paymentId || !$qrCode) {
            Log::error('mercadopago.start.pix_invalid_response', [
                'trace_id' => $traceId,
                'user_id' => $user?->id,
                'plan' => $plan,
                'has_id' => (bool) $paymentId,
                'has_qr_code' => (bool) $qrCode,
                'date_of_expiration' => $expiresAtIso,
            ]);

            throw ValidationException::withMessages([
                'mercadopago' => "Resposta inválida do Mercado Pago ao gerar o PIX. (código {$traceId})",
            ]);
        }

        return Inertia::location(route('billing.mercadopago.pix', ['id' => $paymentId]));
    }

    public function showPix(Request $request, string $id, MercadoPagoService $mp): Response
    {
        try {
            $payment = $mp->getPayment($id);
        } catch (Throwable $e) {
            abort(404);
        }

        $status = $payment['status'] ?? 'pending';
        
        // Verifica se expirou
        $expiresAt = $payment['date_of_expiration'] ?? null;
        $isExpired = false;
        if ($expiresAt && Carbon::parse($expiresAt)->isPast() && $status === 'pending') {
            $status = 'cancelled';
            $isExpired = true;
        }

        $qrCode = null;
        $qrCodeBase64 = null;
        if ($status === 'pending') {
            $qrCode = $payment['point_of_interaction']['transaction_data']['qr_code'] ?? null;
            $qrCodeBase64 = $payment['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null;
        }

        $plan = $payment['metadata']['plan'] ?? null;

        return Inertia::render('Driver/MercadoPagoPix', [
            'id' => $id,
            'qr_code' => $qrCode,
            'qr_code_base64' => $qrCodeBase64,
            'status' => $status,
            'amount' => $payment['transaction_amount'] ?? 0,
            'expires_at' => $expiresAt,
            'plan' => is_string($plan) ? $plan : null,
            'is_expired' => $isExpired,
        ]);
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

        return Inertia::location(url('/billing/mercadopago'));
    }

    public function back(Request $request): SymfonyResponse
    {
        return Inertia::location(url('/billing/mercadopago'));
    }
}
