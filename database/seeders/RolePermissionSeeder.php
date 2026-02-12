<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Permissions;
use App\Support\Roles;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard');

        $permissions = [
            Permissions::LOGS_VIEW,
            Permissions::USERS_MANAGE,
            Permissions::RECORDS_DELETE,
            Permissions::COSTS_VIEW_ANY,
            Permissions::COSTS_VIEW_OWN,
            Permissions::COSTS_CREATE,
            Permissions::COSTS_UPDATE_ANY,
            Permissions::COSTS_UPDATE_OWN,
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, $guard);
        }

        $master = Role::findOrCreate(Roles::MASTER, $guard);
        $admin = Role::findOrCreate(Roles::ADMIN, $guard);
        $driver = Role::findOrCreate(Roles::DRIVER, $guard);

        $master->syncPermissions($permissions);

        $admin->syncPermissions([
            Permissions::USERS_MANAGE,
            Permissions::COSTS_VIEW_ANY,
            Permissions::COSTS_VIEW_OWN,
            Permissions::COSTS_CREATE,
            Permissions::COSTS_UPDATE_ANY,
            Permissions::COSTS_UPDATE_OWN,
        ]);

        $driver->syncPermissions([
            Permissions::COSTS_VIEW_OWN,
            Permissions::COSTS_CREATE,
            Permissions::COSTS_UPDATE_OWN,
        ]);

        $firstUser = User::query()->orderBy('id')->first();
        if ($firstUser && $firstUser->roles()->count() === 0) {
            $firstUser->assignRole(Roles::MASTER);
        }
    }
}
