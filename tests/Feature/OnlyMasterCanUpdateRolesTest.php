<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnlyMasterCanUpdateRolesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_cannot_update_roles(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $target = User::factory()->create();
        $target->assignRole(Roles::DRIVER);

        $this->actingAs($admin)
            ->put(route('users.role.update', $target), [
                'role' => Roles::ADMIN,
            ])
            ->assertForbidden();
    }

    public function test_master_can_update_roles(): void
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $target = User::factory()->create();
        $target->assignRole(Roles::DRIVER);

        $this->actingAs($master)
            ->put(route('users.role.update', $target), [
                'role' => Roles::ADMIN,
            ])
            ->assertRedirect();

        $target->refresh();
        $this->assertTrue($target->hasRole(Roles::ADMIN));
    }
}

