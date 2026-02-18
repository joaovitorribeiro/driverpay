<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MercadoPagoWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        config()->set('services.mercadopago.access_token', 'token');
        config()->set('services.mercadopago.webhook_secret', 'secret');

        $dataId = 'pre_123';
        $requestId = 'req_1';

        $response = $this->postJson(
            '/api/webhooks/mercadopago?type=subscription_preapproval',
            [
                'type' => 'subscription_preapproval',
                'data' => ['id' => $dataId],
            ],
            [
                'x-request-id' => $requestId,
                'x-signature' => 'ts=1,v1=invalid',
            ],
        );

        $response->assertStatus(401);

        $this->assertDatabaseHas('billing_notifications', [
            'provider' => 'mercadopago',
            'processing_error' => 'invalid_signature',
        ]);
    }

    public function test_webhook_updates_subscription_from_preapproval(): void
    {
        $secret = 'secret';

        config()->set('services.mercadopago.access_token', 'token');
        config()->set('services.mercadopago.webhook_secret', $secret);

        $user = User::factory()->create();

        $dataId = 'pre_123';
        $requestId = 'req_1';
        $ts = '1';
        $manifest = "id:{$dataId};request-id:{$requestId};ts:{$ts};";
        $hash = hash_hmac('sha256', $manifest, $secret);

        Http::fake([
            'https://api.mercadopago.com/preapproval/*' => Http::response([
                'id' => $dataId,
                'status' => 'authorized',
                'external_reference' => 'user:'.$user->id.';plan:monthly',
                'payer_email' => $user->email,
                'auto_recurring' => [
                    'start_date' => now()->subDay()->toISOString(),
                    'next_payment_date' => now()->addMonth()->toISOString(),
                ],
                'date_created' => now()->subDay()->toISOString(),
            ], 200),
        ]);

        $response = $this->postJson(
            '/api/webhooks/mercadopago?type=subscription_preapproval',
            [
                'type' => 'subscription_preapproval',
                'date_created' => now()->toISOString(),
                'data' => ['id' => $dataId],
            ],
            [
                'x-request-id' => $requestId,
                'x-signature' => "ts={$ts},v1={$hash}",
            ],
        );

        $response->assertOk();

        $this->assertDatabaseHas('subscriptions', [
            'provider' => 'mercadopago',
            'purchase_token' => $dataId,
            'user_id' => $user->id,
            'status' => 'active',
            'plan' => 'monthly',
        ]);

        $this->assertDatabaseHas('subscription_events', [
            'provider' => 'mercadopago',
            'event_type' => 'subscription_preapproval',
        ]);

        $this->assertDatabaseHas('billing_notifications', [
            'provider' => 'mercadopago',
            'processing_error' => null,
        ]);
    }
}
