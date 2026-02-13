<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class AddProDaysTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        Role::firstOrCreate(['name' => Roles::MASTER]);
        Role::firstOrCreate(['name' => Roles::ADMIN]);
        Role::firstOrCreate(['name' => Roles::DRIVER]);
    }

    public function test_master_can_add_pro_days_to_user()
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $user = User::factory()->create();

        $response = $this->actingAs($master)
            ->post(route('users.pro_days.add', $user), [
                'days' => 30,
            ]);

        $response->assertRedirect();
        
        $user->refresh();
        $this->assertNotNull($user->pro_bonus_until);
        $this->assertTrue($user->pro_bonus_until->isFuture());
        // Check if it's roughly 30 days from now (ignoring seconds execution time)
        $this->assertEquals(
            now()->addDays(30)->format('Y-m-d'), 
            $user->pro_bonus_until->format('Y-m-d')
        );
    }

    public function test_master_can_extend_existing_pro_days()
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $user = User::factory()->create([
            'pro_bonus_until' => now()->addDays(10),
        ]);

        $response = $this->actingAs($master)
            ->post(route('users.pro_days.add', $user), [
                'days' => 5,
            ]);

        $response->assertRedirect();
        
        $user->refresh();
        $this->assertEquals(
            now()->addDays(15)->format('Y-m-d'), 
            $user->pro_bonus_until->format('Y-m-d')
        );
    }

    public function test_admin_cannot_add_pro_days()
    {
        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $user = User::factory()->create();

        $response = $this->actingAs($admin)
            ->post(route('users.pro_days.add', $user), [
                'days' => 30,
            ]);

        $response->assertForbidden(); // Or 403
    }
}
