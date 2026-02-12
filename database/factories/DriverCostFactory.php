<?php

namespace Database\Factories;

use App\Models\DriverCost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverCostFactory extends Factory
{
    protected $model = DriverCost::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => $this->faker->date(),
            'description' => $this->faker->sentence(3),
            'amount_cents' => $this->faker->numberBetween(0, 250_000),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}

