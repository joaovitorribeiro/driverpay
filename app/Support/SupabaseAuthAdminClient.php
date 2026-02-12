<?php

namespace App\Support;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class SupabaseAuthAdminClient
{
    private readonly string $baseUrl;

    public function __construct(
        string $baseUrl,
        private readonly string $serviceRoleKey,
    ) {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public static function fromEnv(): ?self
    {
        $baseUrl = env('SUPABASE_URL');
        $serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');

        if (!is_string($baseUrl) || trim($baseUrl) === '') {
            return null;
        }

        if (!is_string($serviceRoleKey) || trim($serviceRoleKey) === '') {
            return null;
        }

        return new self($baseUrl, $serviceRoleKey);
    }

    public function createUserIfMissing(string $email, string $password, ?string $name = null, bool $emailConfirmed = true): void
    {
        $email = trim($email);
        if ($email === '' || !str_contains($email, '@')) {
            return;
        }

        $payload = [
            'email' => $email,
            'password' => $password,
            'email_confirm' => $emailConfirmed,
        ];

        if (is_string($name) && trim($name) !== '') {
            $payload['user_metadata'] = ['name' => $name];
        }

        $response = $this->http()
            ->post('/auth/v1/admin/users', $payload);

        if ($response->successful()) {
            return;
        }

        $body = $response->body();
        $message = (string) data_get($response->json(), 'msg', '');
        if ($message === '') {
            $message = (string) data_get($response->json(), 'message', '');
        }

        if (
            $response->status() === 422
            && Str::contains(Str::lower($message), ['already', 'registered', 'exists'])
        ) {
            return;
        }

        if (
            $response->status() === 500
            && Str::contains(Str::lower($body), ['already', 'registered', 'exists', 'duplicate'])
        ) {
            return;
        }

        throw new \RuntimeException("Supabase Auth error {$response->status()}: {$body}");
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->acceptJson()
            ->asJson()
            ->withHeaders([
                'apikey' => $this->serviceRoleKey,
                'Authorization' => 'Bearer '.$this->serviceRoleKey,
            ]);
    }
}
