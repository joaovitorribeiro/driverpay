<?php

namespace Tests\Feature;

use App\Models\DriverDayRecord;
use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverDayRecordTest extends TestCase
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

    public function test_driver_can_save_day_record_and_see_it_in_history_props(): void
    {
        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $this->actingAs($driver)
            ->postJson('/day-records', [
                'date' => '2026-02-14',
                'gains_brl' => '1.234,56',
                'km' => '120,5',
                'expenses' => [
                    ['id' => 'a1', 'label' => 'Pedágio', 'amount_brl' => '10.50'],
                    ['id' => 'a2', 'label' => 'Estacionamento', 'amount_brl' => '7,40'],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $record = DriverDayRecord::query()
            ->where('user_id', $driver->id)
            ->whereDate('date', '2026-02-14')
            ->first();

        $this->assertNotNull($record);
        $this->assertSame(123456, (int) $record->gains_cents);
        $this->assertSame('120.5', (string) $record->km);

        $this->assertIsArray($record->expenses);
        $this->assertCount(2, $record->expenses);
        $this->assertSame(1050, (int) ($record->expenses[0]['amount_cents'] ?? 0));
        $this->assertSame(740, (int) ($record->expenses[1]['amount_cents'] ?? 0));

        $html = $this->actingAs($driver)->get('/costs')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $response = $this->actingAs($driver)->get('/costs', $headers);
        $response->assertOk();
        $response->assertJsonPath('component', 'Costs/Driver/Index');
        $response->assertJsonPath('props.day_records.0.date', '2026-02-14');
        $response->assertJsonPath('props.day_records.0.gains_cents', 123456);
        $response->assertJsonPath('props.day_records.0.km', 120.5);
    }
}
