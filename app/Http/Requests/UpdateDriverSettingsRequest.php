<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDriverSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];

        foreach (['fuel_price_brl', 'consumption_km_per_l', 'maintenance_monthly_brl', 'rent_monthly_brl'] as $key) {
            $value = $this->input($key);
            if (! is_string($value)) {
                continue;
            }

            $normalized[$key] = str_replace(',', '.', trim($value));
        }

        if ($normalized) {
            $this->merge($normalized);
        }
    }

    public function rules(): array
    {
        return [
            'fuel_price_brl' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'consumption_km_per_l' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'maintenance_monthly_brl' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'rent_monthly_brl' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }
}

