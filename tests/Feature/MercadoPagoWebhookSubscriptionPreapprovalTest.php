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
}

