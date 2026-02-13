<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMasterCannotDeleteAccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_cannot_delete_account(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $this->actingAs($admin)
            ->delete('/profile', [
                'password' => 'password',
            ])
            ->assertForbidden();

        $this->assertNotNull($admin->fresh());
    }

    public function test_master_cannot_delete_account(): void
    {
        $master = User::factory()->create();
        $master->assignRole(Roles::MASTER);

        $this->actingAs($master)
            ->delete('/profile', [
                'password' => 'password',
            ])
            ->assertForbidden();

        $this->assertNotNull($master->fresh());
    }
}

