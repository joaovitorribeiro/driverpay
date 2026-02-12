<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use App\Support\SupabaseAuthAdminClient;
use App\Models\User;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('supabase:auth:seed-users {--from-db : Cria no Supabase Auth a partir da tabela users} {--password= : Senha padrão para usuários criados} {--unconfirmed : Não confirma email automaticamente}', function () {
    $client = SupabaseAuthAdminClient::fromEnv();
    if (!$client) {
        $this->error('SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env');
        return 1;
    }

    $password = $this->option('password');
    if (!is_string($password) || trim($password) === '') {
        $password = env('SUPABASE_AUTH_DEFAULT_PASSWORD', env('SEED_DEFAULT_PASSWORD', 'password'));
    }

    if (!is_string($password) || trim($password) === '') {
        $this->error('Senha vazia. Defina --password=... ou SUPABASE_AUTH_DEFAULT_PASSWORD no .env');
        return 1;
    }

    $emailConfirmed = !$this->option('unconfirmed');

    if ($this->option('from-db')) {
        $users = User::query()->select(['name', 'email'])->orderBy('id')->get();
        foreach ($users as $user) {
            $email = is_string($user->email) ? $user->email : '';
            $name = is_string($user->name) ? $user->name : null;

            try {
                $client->createUserIfMissing($email, $password, $name, $emailConfirmed);
                $this->line('ok '.$email);
            } catch (\Throwable $e) {
                $this->error('erro '.$email.' '.$e->getMessage());
                return 1;
            }
        }

        return 0;
    }

    $emails = [
        env('SEED_MASTER_EMAIL', 'master@example.com'),
        env('SEED_ADMIN_EMAIL', 'admin@example.com'),
        env('SEED_DRIVER_EMAIL', 'motorista@example.com'),
    ];

    $emails = array_values(array_unique(array_filter(array_map(
        fn ($e) => is_string($e) ? trim($e) : '',
        $emails
    ))));

    foreach ($emails as $email) {
        if ($email === '' || !Str::contains($email, '@')) {
            continue;
        }

        try {
            $client->createUserIfMissing($email, $password, null, $emailConfirmed);
            $this->line('ok '.$email);
        } catch (\Throwable $e) {
            $this->error('erro '.$email.' '.$e->getMessage());
            return 1;
        }
    }

    return 0;
})->purpose('Cria usuários no Supabase Auth (admin) com service role key');
