<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Roles;
use App\Support\SupabaseAuthAdminClient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(AdminMasterSeeder::class);

        $seedExampleUsers = filter_var(
            env('SEED_EXAMPLE_USERS', app()->environment(['local', 'testing'])),
            FILTER_VALIDATE_BOOL
        );
        if (! $seedExampleUsers) {
            return;
        }

        $defaultPassword = env('SEED_DEFAULT_PASSWORD', 'password');

        $usersToSeed = [
            [
                'role' => Roles::MASTER,
                'name' => env('SEED_MASTER_NAME', 'Master'),
                'email' => env('SEED_MASTER_EMAIL', 'master@example.com'),
                'password' => env('SEED_MASTER_PASSWORD', $defaultPassword),
            ],
            [
                'role' => Roles::ADMIN,
                'name' => env('SEED_ADMIN_NAME', 'Admin'),
                'email' => env('SEED_ADMIN_EMAIL', 'admin@example.com'),
                'password' => env('SEED_ADMIN_PASSWORD', $defaultPassword),
            ],
            [
                'role' => Roles::DRIVER,
                'name' => env('SEED_DRIVER_NAME', 'Motorista'),
                'email' => env('SEED_DRIVER_EMAIL', 'motorista@example.com'),
                'password' => env('SEED_DRIVER_PASSWORD', $defaultPassword),
            ],
        ];

        foreach ($usersToSeed as $userToSeed) {
            $email = $userToSeed['email'];
            if (! is_string($email) || trim($email) === '') {
                continue;
            }

            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => $userToSeed['name'],
                    'password' => $userToSeed['password'],
                ]
            );

            if ($user->name !== $userToSeed['name']) {
                $user->forceFill(['name' => $userToSeed['name']])->save();
            }

            if (! $user->hasRole($userToSeed['role'])) {
                $user->assignRole($userToSeed['role']);
            }
        }

        $seedSupabaseAuthUsers = filter_var(
            env('SEED_SUPABASE_AUTH_USERS', false),
            FILTER_VALIDATE_BOOL
        );
        if (! $seedSupabaseAuthUsers) {
            return;
        }

        $client = SupabaseAuthAdminClient::fromEnv();
        if (! $client) {
            return;
        }

        foreach ($usersToSeed as $userToSeed) {
            $email = $userToSeed['email'];
            if (! is_string($email) || trim($email) === '') {
                continue;
            }

            $password = $userToSeed['password'];
            if (! is_string($password) || trim($password) === '') {
                continue;
            }

            $client->createUserIfMissing(
                $email,
                $password,
                is_string($userToSeed['name']) ? $userToSeed['name'] : null,
                true
            );
        }
    }
}
