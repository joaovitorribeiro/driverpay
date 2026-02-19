<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MercadoPagoWebhookSubscriptionPreapprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscription_preapproval_webhook_with_data_dot_id_is_processed(): void
    {
        config()->set('services.mercadopago.webhook_secret', 'sekret');
        config()->set('services.mercadopago.access_token', 'token');

        $user = User::factory()->create();

        Http::fake([
            'https://api.mercadopago.com/preapproval/123' => Http::response([
                'id' => '123',
                'status' => 'authorized',
                'external_reference' => "user:{$user->id};plan:pro",
                'auto_recurring' => [
                    'start_date' => '2026-02-12T02:00:00.000-03:00',
                    'next_payment_date' => '2026-03-12T02:00:00.000-03:00',
                ],
                'payer_email' => $user->email,
            ], 200),
        ]);

        $ts = '1700000000';
        $requestId = 'req-1';
        $manifest = "id:123;request-id:{$requestId};ts:{$ts};";
        $v1 = hash_hmac('sha256', $manifest, 'sekret');

        $response = $this->postJson(
            '/api/webhooks/mercadopago?type=subscription_preapproval&data.id=123',
            [],
            [
                'x-request-id' => $requestId,
                'x-signature' => "ts={$ts}, v1={$v1}",
            ],
        );

        $response->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseHas('subscriptions', [
            'provider' => 'mercadopago',
            'purchase_token' => '123',
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseCount('subscription_events', 1);
    }

    public function test_payment_webhook_for_pix_grants_pro_bonus_days(): void
    {
        config()->set('services.mercadopago.webhook_secret', 'sekret');
        config()->set('services.mercadopago.access_token', 'token');

        $user = User::factory()->create([
            'pro_bonus_until' => null,
        ]);

        Http::fake([
            'https://api.mercadopago.com/v1/payments/999' => Http::response([
                'id' => '999',
                'status' => 'approved',
                'status_detail' => 'accredited',
                'payment_method_id' => 'pix',
                'external_reference' => "user:{$user->id};plan:monthly;kind:pix",
                'metadata' => [
                    'kind' => 'pro_pix_30d',
                    'plan' => 'monthly',
                    'user_id' => $user->id,
                ],
                'payer' => [
                    'email' => 'other@email.invalid',
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/webhooks/mercadopago?topic=payment&id=999');
        $response->assertOk()->assertJson(['ok' => true]);

        $until = $user->fresh()->pro_bonus_until;
        $this->assertNotNull($until);
        $this->assertTrue($until->isFuture());
    }

    public function test_payment_webhook_for_subscription_does_not_grant_pix_bonus(): void
    {
        config()->set('services.mercadopago.webhook_secret', 'sekret');
        config()->set('services.mercadopago.access_token', 'token');

        $user = User::factory()->create([
            'pro_bonus_until' => null,
        ]);

        Http::fake([
            'https://api.mercadopago.com/v1/payments/pay-1' => Http::response([
                'id' => 'pay-1',
                'status' => 'approved',
                'status_detail' => 'accredited',
                'preapproval_id' => 'pre-1',
                'payer' => [
                    'email' => $user->email,
                ],
            ], 200),
            'https://api.mercadopago.com/preapproval/pre-1' => Http::response([
                'id' => 'pre-1',
                'status' => 'authorized',
                'external_reference' => "user:{$user->id};plan:monthly",
                'auto_recurring' => [
                    'start_date' => '2026-02-12T02:00:00.000-03:00',
                    'next_payment_date' => '2026-03-12T02:00:00.000-03:00',
                ],
                'payer_email' => $user->email,
            ], 200),
        ]);

        $response = $this->postJson('/api/webhooks/mercadopago?type=payment&data.id=pay-1');
        $response->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseHas('subscriptions', [
            'provider' => 'mercadopago',
            'purchase_token' => 'pre-1',
            'user_id' => $user->id,
        ]);

        $this->assertNull($user->fresh()->pro_bonus_until);
    }
}
