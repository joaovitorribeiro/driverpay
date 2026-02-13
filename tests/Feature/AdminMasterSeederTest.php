<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Database\Seeders\AdminMasterSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMasterSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_master_seeder_creates_users_from_env(): void
    {
        putenv('MASTER_EMAIL=master@test.com');
        putenv('MASTER_PASSWORD=secret123');
        putenv('ADMIN_EMAILS=admin@test.com,admin2@test.com');
        putenv('ADMIN_PASSWORD=secret123');

        $this->seed(AdminMasterSeeder::class);

        $master = User::query()->where('email', 'master@test.com')->first();
        $admin = User::query()->where('email', 'admin@test.com')->first();
        $admin2 = User::query()->where('email', 'admin2@test.com')->first();

        $this->assertNotNull($master);
        $this->assertNotNull($admin);
        $this->assertNotNull($admin2);

        $this->assertTrue($master->hasRole(Roles::MASTER));
        $this->assertTrue($admin->hasRole(Roles::ADMIN));
        $this->assertTrue($admin2->hasRole(Roles::ADMIN));

        $this->assertNotNull($master->public_id);
        $this->assertNotNull($admin->public_id);
        $this->assertNotNull($admin2->public_id);
    }
}
