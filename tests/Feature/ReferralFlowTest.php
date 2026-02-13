<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralFlowTest extends TestCase
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

    public function test_refer_page_generates_code_and_shows_list(): void
    {
        $driver = User::factory()->create();
        $driver->assignRole(Roles::DRIVER);

        $html = $this->actingAs($driver)->get('/refer')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $response = $this->actingAs($driver)->get('/refer', $headers);

        $response->assertOk();
        $response->assertJsonPath('component', 'Driver/Refer');

        $driver->refresh();
        $this->assertNotNull($driver->referral_code);
    }

    public function test_register_accepts_referral_code(): void
    {
        $referrer = User::factory()->create([
            'referral_code' => 'TESTE123',
        ]);
        $referrer->assignRole(Roles::DRIVER);

        $response = $this->post('/register', [
            'name' => 'Novo Usuario',
            'email' => 'novo@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'referral' => 'teste-123',
        ]);

        $response->assertRedirect('/dashboard');

        $newUser = User::query()->where('email', 'novo@example.com')->first();
        $this->assertNotNull($newUser);
        $this->assertSame($referrer->id, $newUser->referred_by_user_id);
        $this->assertNotNull($newUser->referral_code);
    }
}

