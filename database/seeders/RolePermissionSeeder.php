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

        $permissions = array_unique(array_merge(
            Permissions::getPermissions(Roles::MASTER),
            Permissions::getPermissions(Roles::ADMIN),
            Permissions::getPermissions(Roles::DRIVER),
        ));

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, $guard);
        }

        $master = Role::findOrCreate(Roles::MASTER, $guard);
        $admin = Role::findOrCreate(Roles::ADMIN, $guard);
        $driver = Role::findOrCreate(Roles::DRIVER, $guard);

        $master->syncPermissions(Permissions::getPermissions(Roles::MASTER));
        $admin->syncPermissions(Permissions::getPermissions(Roles::ADMIN));
        $driver->syncPermissions(Permissions::getPermissions(Roles::DRIVER));

        $assignFirstUserAsMaster = filter_var(
            env('SEED_ASSIGN_FIRST_USER_MASTER', false),
            FILTER_VALIDATE_BOOL
        );
        if ($assignFirstUserAsMaster) {
            $firstUser = User::query()->orderBy('id')->first();
            if ($firstUser && $firstUser->roles()->count() === 0) {
                $firstUser->assignRole(Roles::MASTER);
            }
        }
    }
}
