<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminMasterSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = env('SEED_DEFAULT_PASSWORD');

        $master = [
            'role' => Roles::MASTER,
            'name' => env('MASTER_NAME', env('SEED_MASTER_NAME', 'Master')),
            'email' => env('MASTER_EMAIL', env('SEED_MASTER_EMAIL')),
            'password' => env('MASTER_PASSWORD', env('SEED_MASTER_PASSWORD', $defaultPassword)),
        ];

        $adminPassword = env('ADMIN_PASSWORD', env('SEED_ADMIN_PASSWORD', $defaultPassword));
        $adminName = env('ADMIN_NAME', env('SEED_ADMIN_NAME', 'Admin'));
        $adminEmailsRaw = env('ADMIN_EMAILS');
        $adminEmails = is_string($adminEmailsRaw) && trim($adminEmailsRaw) !== ''
            ? preg_split('/[,\s;]+/', $adminEmailsRaw, -1, PREG_SPLIT_NO_EMPTY)
            : array_filter([env('ADMIN_EMAIL', env('SEED_ADMIN_EMAIL'))]);

        $usersToSeed = [$master];

        $index = 0;
        foreach ($adminEmails as $email) {
            $index++;
            $usersToSeed[] = [
                'role' => Roles::ADMIN,
                'name' => $index === 1 ? $adminName : ($adminName.' '.$index),
                'email' => $email,
                'password' => $adminPassword,
            ];
        }

        foreach ($usersToSeed as $userToSeed) {
            $email = $userToSeed['email'];
            $password = $userToSeed['password'];

            if (! is_string($email) || trim($email) === '') {
                continue;
            }

            if (! is_string($password) || trim($password) === '') {
                continue;
            }

            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => is_string($userToSeed['name']) ? $userToSeed['name'] : 'User',
                    'password' => $password,
                    'public_id' => (string) Str::uuid(),
                ]
            );

            $shouldName = $userToSeed['name'];
            if (is_string($shouldName) && trim($shouldName) !== '' && $user->name !== $shouldName) {
                $user->forceFill(['name' => $shouldName])->save();
            }

            if (! $user->public_id) {
                $user->forceFill(['public_id' => (string) Str::uuid()])->save();
            }

            if (! $user->hasRole($userToSeed['role'])) {
                $user->syncRoles([$userToSeed['role']]);
            }
        }
    }
}
