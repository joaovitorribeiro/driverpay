<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MercadoPagoCancelSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancel_subscription_calls_mp_and_marks_subscription_canceled(): void
    {
        config()->set('services.mercadopago.access_token', 'token');

        $user = User::factory()->create();

        $sub = Subscription::create([
            'user_id' => $user->id,
            'provider' => 'mercadopago',
            'purchase_token' => 'pre_123',
            'plan' => 'monthly',
            'status' => 'pending',
            'auto_renewing' => true,
            'raw' => null,
        ]);

        Http::fake([
            'https://api.mercadopago.com/preapproval/*' => Http::response([
                'id' => $sub->purchase_token,
                'status' => 'cancelled',
            ], 200),
        ]);

        $this->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->post(route('billing.mercadopago.cancel'))
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', url('/billing/mercadopago'));

        $sub->refresh();
        $this->assertSame('canceled', $sub->status);
        $this->assertFalse((bool) $sub->auto_renewing);
        $this->assertNotNull($sub->canceled_at);
        $this->assertNotNull($sub->ended_at);
    }
}
