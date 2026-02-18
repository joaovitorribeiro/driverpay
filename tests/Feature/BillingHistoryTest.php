<?php

namespace Tests\Feature;

use App\Models\PixPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BillingHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_history_requires_authentication(): void
    {
        $this->get(route('billing.history'))
            ->assertRedirect(route('login'));
    }

    public function test_history_renders_pix_tab_with_pagination(): void
    {
        $user = User::factory()->create();

        PixPayment::factory()->count(12)->create([
            'provider' => 'mercadopago',
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('billing.history', ['tab' => 'pix', 'status' => 'all']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Driver/BillingHistory')
                ->where('tab', 'pix')
                ->where('status', 'all')
                ->has('pix.data', 10)
                ->has('pix.links')
                ->has('subscriptions.data')
            );
    }
}

