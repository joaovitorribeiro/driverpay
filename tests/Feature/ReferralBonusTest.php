<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralBonusTest extends TestCase
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

    public function test_referrer_gets_bonus_only_after_referred_becomes_paid_pro(): void
    {
        $referrer = User::factory()->create();
        $referrer->assignRole(Roles::DRIVER);

        $referred = User::factory()->create([
            'referred_by_user_id' => $referrer->id,
        ]);
        $referred->assignRole(Roles::DRIVER);

        $this->assertNull($referrer->pro_bonus_until);

        $html = $this->actingAs($referred)->get('/dashboard')->getContent();
        $headers = $this->inertiaHeadersFromHtml($html);

        $this->actingAs($referred)->get('/dashboard', $headers)->assertOk();
        $referrer->refresh();
        $this->assertNull($referrer->pro_bonus_until);

        Subscription::create([
            'user_id' => $referred->id,
            'provider' => 'google',
            'status' => 'active',
            'current_period_end_at' => now()->addMonth(),
        ]);

        $this->actingAs($referred)->get('/dashboard', $headers)->assertOk();
        $referrer->refresh();
        $this->assertNotNull($referrer->pro_bonus_until);
        $this->assertTrue($referrer->pro_bonus_until->isFuture());

        $this->assertDatabaseHas('referral_bonuses', [
            'referrer_user_id' => $referrer->id,
            'referred_user_id' => $referred->id,
            'bonus_days' => 7,
        ]);

        $bonusUntil = $referrer->pro_bonus_until->copy();
        $this->actingAs($referred)->get('/dashboard', $headers)->assertOk();
        $referrer->refresh();
        $this->assertTrue($referrer->pro_bonus_until->equalTo($bonusUntil));
    }
}

