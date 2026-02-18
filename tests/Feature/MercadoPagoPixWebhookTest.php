<?php

namespace Tests\Feature;

use App\Models\PixPayment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MercadoPagoPixWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_webhook_updates_pix_payment_and_grants_pro_bonus(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-02-18 12:00:00'));

        $secret = 'secret';
        config()->set('services.mercadopago.access_token', 'token');
        config()->set('services.mercadopago.webhook_secret', $secret);

        $user = User::factory()->create([
            'pro_bonus_until' => null,
        ]);

        $paymentId = 'pay_123';

        PixPayment::create([
            'provider' => 'mercadopago',
            'payment_id' => $paymentId,
            'user_id' => $user->id,
            'plan' => 'monthly',
            'status' => 'pending',
            'amount_brl' => 9.90,
            'cpf' => null,
            'raw' => null,
            'paid_at' => null,
        ]);

        $requestId = 'req_1';
        $ts = '1';
        $manifest = "id:{$paymentId};request-id:{$requestId};ts:{$ts};";
        $hash = hash_hmac('sha256', $manifest, $secret);

        Http::fake([
            'https://api.mercadopago.com/v1/payments/*' => Http::response([
                'id' => $paymentId,
                'status' => 'approved',
                'status_detail' => 'accredited',
                'transaction_amount' => 9.90,
                'external_reference' => 'user:'.$user->id.';plan:monthly;kind:pix',
                'metadata' => [
                    'kind' => 'pro_pix_30d',
                    'plan' => 'monthly',
                    'user_id' => $user->id,
                ],
                'payer' => [
                    'email' => null,
                ],
            ], 200),
        ]);

        $response = $this->postJson(
            '/api/webhooks/mercadopago?type=payment.updated',
            [
                'type' => 'payment.updated',
                'date_created' => now()->toISOString(),
                'data' => ['id' => $paymentId],
            ],
            [
                'x-request-id' => $requestId,
                'x-signature' => "ts={$ts},v1={$hash}",
            ],
        );

        $response->assertOk();

        $user->refresh();
        $this->assertNotNull($user->pro_bonus_until);
        $this->assertTrue($user->pro_bonus_until->equalTo(Carbon::now()->addDays(30)));

        $this->assertDatabaseHas('pix_payments', [
            'provider' => 'mercadopago',
            'payment_id' => $paymentId,
            'user_id' => $user->id,
            'status' => 'approved',
        ]);
    }
}

