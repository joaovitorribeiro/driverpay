<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MercadoPagoPixCpfTest extends TestCase
{
    use RefreshDatabase;

    public function test_pix_requires_cpf(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('billing.mercadopago.start'), [
                'plan' => 'monthly',
                'method' => 'pix',
            ])
            ->assertStatus(302)
            ->assertSessionHasErrors(['cpf']);
    }

    public function test_pix_rejects_invalid_cpf(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('billing.mercadopago.start'), [
                'plan' => 'monthly',
                'method' => 'pix',
                'cpf' => '111.111.111-11',
            ])
            ->assertStatus(302)
            ->assertSessionHasErrors(['cpf']);
    }
}
