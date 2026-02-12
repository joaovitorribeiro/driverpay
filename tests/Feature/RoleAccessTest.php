<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
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

    public function test_dashboard_component_switches_by_role(): void
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $html = $this->actingAs($master)->get('/dashboard')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $this->actingAs($master)
            ->get('/dashboard', $headers)
            ->assertOk()
            ->assertJsonPath('component', 'Dashboard/Master');

        $this->actingAs($admin)
            ->get('/dashboard', $headers)
            ->assertOk()
            ->assertJsonPath('component', 'Dashboard/Admin');

        $this->actingAs($driver)
            ->get('/dashboard', $headers)
            ->assertOk()
            ->assertJsonPath('component', 'Dashboard/Driver');
    }

    public function test_only_master_can_view_logs(): void
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $this->actingAs($master)->get('/logs')->assertOk();
        $this->actingAs($admin)->get('/logs')->assertForbidden();
        $this->actingAs($driver)->get('/logs')->assertForbidden();
    }

    public function test_users_management_requires_permission(): void
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $this->actingAs($master)->get('/users')->assertOk();
        $this->actingAs($admin)->get('/users')->assertOk();
        $this->actingAs($driver)->get('/users')->assertForbidden();
    }
}
