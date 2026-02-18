<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MercadoPagoPixExpirationPayloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_pix_start_sends_date_of_expiration_with_timezone_offset(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-02-18 12:00:00', 'America/Sao_Paulo'));
        config()->set('app.timezone', 'America/Sao_Paulo');
        config()->set('services.mercadopago.access_token', 'token');

        $user = User::factory()->create([
            'name' => 'Teste',
        ]);

        Http::fake([
            'https://api.mercadopago.com/v1/payments' => Http::response([
                'id' => 'pay_1',
                'status' => 'pending',
                'point_of_interaction' => [
                    'transaction_data' => [
                        'qr_code' => 'qr',
                        'qr_code_base64' => 'base64',
                    ],
                ],
            ], 200),
        ]);

        $this->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->post(route('billing.mercadopago.start'), [
                'plan' => 'monthly',
                'method' => 'pix',
                'cpf' => '39053344705',
                'save_cpf' => false,
            ])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('billing.mercadopago.pix', ['id' => 'pay_1']));

        Http::assertSent(function ($request) {
            $data = $request->data();
            $value = $data['date_of_expiration'] ?? null;
            if (! is_string($value)) return false;
            return preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/', $value) === 1;
        });
    }
}
