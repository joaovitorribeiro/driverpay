<?php

namespace Database\Factories;

use App\Models\PixPayment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PixPayment>
 */
class PixPaymentFactory extends Factory
{
    protected $model = PixPayment::class;

    public function definition(): array
    {
        return [
            'provider' => 'mercadopago',
            'payment_id' => (string) fake()->unique()->numberBetween(100000, 999999),
            'user_id' => User::factory(),
            'plan' => fake()->randomElement(['monthly', 'annual']),
            'status' => fake()->randomElement(['pending', 'approved', 'cancelled', 'rejected', 'in_process']),
            'amount_brl' => '9.90',
            'cpf' => null,
            'raw' => null,
            'expires_at' => null,
            'paid_at' => null,
        ];
    }
}

