<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_free_user_is_blocked_from_pro_routes(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Roles::DRIVER);

        $this->actingAs($user)->get('/costs/export')->assertStatus(403);
    }

    public function test_paid_user_passes_pro_middleware(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Roles::DRIVER);

        Subscription::create([
            'user_id' => $user->id,
            'provider' => 'mercadopago',
            'status' => 'active',
            'current_period_end_at' => now()->addDay(),
        ]);

        $this->actingAs($user)->get('/costs/export')->assertStatus(422);
    }
}
