<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverSettingsTest extends TestCase
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

    public function test_driver_can_view_settings_page(): void
    {
        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $html = $this->actingAs($driver)->get('/settings')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $response = $this->actingAs($driver)->get('/settings', $headers);

        $response->assertOk();
        $response->assertJsonPath('component', 'Driver/Settings');
    }

    public function test_driver_can_update_settings(): void
    {
        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $this->actingAs($driver)
            ->patch('/settings', [
                'fuel_price_brl' => '7,19',
                'consumption_km_per_l' => '12',
                'maintenance_monthly_brl' => '500',
                'rent_monthly_brl' => '0',
            ])
            ->assertRedirect('/settings');

        $this->assertDatabaseHas('driver_settings', [
            'user_id' => $driver->id,
            'fuel_price_brl' => '7.19',
            'consumption_km_per_l' => '12.00',
            'maintenance_monthly_brl' => '500.00',
            'rent_monthly_brl' => '0.00',
        ]);
    }
}

