<?php

namespace Tests\Feature;

use App\Models\DriverCost;
use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverCostReportsTest extends TestCase
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

    public function test_driver_pro_can_view_month_report_and_navigate_months(): void
    {
        $driver = User::factory()->create([
            'is_pro' => true,
        ]);
        $driver->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-02-01',
            'amount_cents' => 1500,
        ]);
        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-02-03',
            'amount_cents' => 2500,
        ]);

        $html = $this->actingAs($driver)->get('/costs')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $this->actingAs($driver)
            ->get('/costs?period=month&month=2026-02', $headers)
            ->assertOk()
            ->assertJsonPath('component', 'Costs/Driver/Index')
            ->assertJsonPath('props.filters.period', 'month')
            ->assertJsonPath('props.report.type', 'month')
            ->assertJsonPath('props.report.totals.records', 2)
            ->assertJsonPath('props.report.totals.expenses_cents', 4000);
    }

    public function test_driver_pro_can_view_year_report(): void
    {
        $driver = User::factory()->create([
            'is_pro' => true,
        ]);
        $driver->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-02-01',
            'amount_cents' => 1500,
        ]);
        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-05-10',
            'amount_cents' => 2500,
        ]);

        $html = $this->actingAs($driver)->get('/costs')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $this->actingAs($driver)
            ->get('/costs?period=year&year=2026', $headers)
            ->assertOk()
            ->assertJsonPath('component', 'Costs/Driver/Index')
            ->assertJsonPath('props.filters.period', 'year')
            ->assertJsonPath('props.report.type', 'year')
            ->assertJsonPath('props.report.totals.records', 2)
            ->assertJsonPath('props.report.totals.expenses_cents', 4000);
    }

    public function test_driver_pro_can_export_month_csv(): void
    {
        $driver = User::factory()->create([
            'is_pro' => true,
        ]);
        $driver->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-02-01',
            'amount_cents' => 1500,
        ]);

        $response = $this->actingAs($driver)->get('/costs/export?period=month&month=2026-02');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertStringContainsString("Dia,Registros,Ganhos,Km,Combustível,Despesas", $content);
        $this->assertStringContainsString("Fixos (estim.)", $content);
    }

    public function test_driver_pro_can_export_month_pdf_html(): void
    {
        $driver = User::factory()->create([
            'is_pro' => true,
        ]);
        $driver->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-02-01',
            'amount_cents' => 1500,
        ]);

        $response = $this->actingAs($driver)->get('/costs/export?period=month&month=2026-02&format=pdf');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/html; charset=UTF-8');
        $response->assertSee('Relatório Pro', false);
    }

    public function test_driver_pro_can_export_last_7_days_csv(): void
    {
        $driver = User::factory()->create([
            'is_pro' => true,
        ]);
        $driver->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => now()->subDays(2)->toDateString(),
            'amount_cents' => 1500,
        ]);

        $response = $this->actingAs($driver)->get('/costs/export?period=7d&format=csv');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertStringContainsString("Dia,Registros,Ganhos,Km,Combustível,Despesas", $content);
    }

    public function test_driver_pro_can_export_range_pdf_html(): void
    {
        $driver = User::factory()->create([
            'is_pro' => true,
        ]);
        $driver->assignRole(Roles::DRIVER);

        DriverCost::factory()->create([
            'user_id' => $driver->id,
            'date' => '2026-02-01',
            'amount_cents' => 1500,
        ]);

        $response = $this->actingAs($driver)->get('/costs/export?period=range&from=2026-02-01&to=2026-02-07&format=pdf');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/html; charset=UTF-8');
        $response->assertSee('Relatório Pro', false);
    }
}
