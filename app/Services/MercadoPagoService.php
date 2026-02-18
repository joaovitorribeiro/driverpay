<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class MercadoPagoService
{
    private string $baseUrl = 'https://api.mercadopago.com';

    private function token(): string
    {
        $token = config('services.mercadopago.access_token');
        if (! is_string($token) || trim($token) === '') {
            throw new RuntimeException('MP access token not configured.');
        }

        return $token;
    }

    private function client(?string $idempotencyKey = null): PendingRequest
    {
        $client = Http::baseUrl($this->baseUrl)
            ->withToken($this->token())
            ->acceptJson()
            ->asJson()
            ->timeout(20);

        if (is_string($idempotencyKey) && trim($idempotencyKey) !== '') {
            $client = $client->withHeaders([
                'X-Idempotency-Key' => $idempotencyKey,
            ]);
        }

        return $client;
    }

    public function createPreapproval(array $payload): array
    {
        return $this->client((string) Str::uuid())
            ->post('/preapproval', $payload)
            ->throw()
            ->json();
    }

    public function getPreapproval(string $id): array
    {
        return $this->client()
            ->get("/preapproval/{$id}")
            ->throw()
            ->json();
    }

    public function cancelPreapproval(string $id): array
    {
        return $this->client((string) Str::uuid())
            ->put("/preapproval/{$id}", [
                'status' => 'cancelled',
            ])
            ->throw()
            ->json();
    }

    public function getPayment(string $id): array
    {
        return $this->client()
            ->get("/v1/payments/{$id}")
            ->throw()
            ->json();
    }
}
