<?php

namespace Tests\Feature;

use App\Models\DriverCost;
use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverCostAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function inertiaHeadersFromHtml(string $html): array
    {
        preg_match('/&quot;version&quot;:&quot;([^&]+?)&quot;/', $html, $matches);
        $version = $matches[1] ?? '0';

        return [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $version,
        ];
    }

    public function test_driver_sees_only_own_costs(): void
    {
        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $other = User::factory()->create();
        $other->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'description' => 'Custo do motorista A',
        ]);

        DriverCost::factory()->create([
            'user_id' => $other->id,
            'description' => 'Custo do motorista B',
        ]);

        $html = $this->actingAs($driver)->get('/costs')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $response = $this->actingAs($driver)->get('/costs', $headers);

        $response->assertOk();
        $response->assertJsonPath('component', 'Costs/Driver/Index');

        $json = $response->json();
        $data = $json['props']['costs']['data'] ?? [];

        $this->assertCount(1, $data);
        $this->assertSame('Custo do motorista A', $data[0]['description']);
    }

    public function test_only_master_can_delete_costs(): void
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $cost = DriverCost::factory()->create([
            'user_id' => $driver->id,
        ]);

        $this->actingAs($driver)
            ->delete(route('costs.destroy', $cost))
            ->assertForbidden();

        $this->actingAs($admin)
            ->delete(route('costs.destroy', $cost))
            ->assertForbidden();

        $this->actingAs($master)
            ->delete(route('costs.destroy', $cost))
            ->assertRedirect(route('costs.index'));

        $this->assertDatabaseMissing('driver_costs', ['id' => $cost->id]);
    }
}
