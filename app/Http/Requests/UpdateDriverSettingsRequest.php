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

            $normalized[$key] = $this->normalizeNumberString($value);
        }

        foreach (['maintenance_items', 'rent_items', 'extra_monthly_items'] as $itemsKey) {
            $items = $this->input($itemsKey);
            if (! is_array($items)) {
                continue;
            }

            $next = [];
            foreach ($items as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $amount = $item['amount_brl'] ?? null;
                if (is_string($amount)) {
                    $amount = $this->normalizeNumberString($amount);
                }

                $next[] = [
                    'id' => isset($item['id']) ? (string) $item['id'] : null,
                    'label' => isset($item['label']) ? (string) $item['label'] : '',
                    'amount_brl' => $amount,
                ];
            }

            $normalized[$itemsKey] = $next;
        }

        if ($normalized) {
            $this->merge($normalized);
        }
    }

    private function normalizeNumberString(string $value): ?string
    {
        $raw = trim($value);
        $raw = preg_replace('/[^\d,.\-]/', '', $raw);
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        $negative = str_starts_with($raw, '-');
        $raw = str_replace('-', '', $raw);

        if (str_contains($raw, ',')) {
            $raw = str_replace('.', '', $raw);
            $raw = str_replace(',', '.', $raw);
        }

        $parts = explode('.', $raw);
        if (count($parts) > 2) {
            $raw = $parts[0] . '.' . implode('', array_slice($parts, 1));
        }

        return ($negative ? '-' : '') . $raw;
    }

    public function rules(): array
    {
        return [
            'fuel_price_brl' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'consumption_km_per_l' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'maintenance_monthly_brl' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'maintenance_items' => ['nullable', 'array', 'max:200'],
            'maintenance_items.*.id' => ['nullable', 'string', 'max:50'],
            'maintenance_items.*.label' => ['required_with:maintenance_items', 'string', 'max:80'],
            'maintenance_items.*.amount_brl' => ['required_with:maintenance_items', 'numeric', 'min:0', 'max:999999.99'],
            'rent_monthly_brl' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'rent_items' => ['nullable', 'array', 'max:200'],
            'rent_items.*.id' => ['nullable', 'string', 'max:50'],
            'rent_items.*.label' => ['required_with:rent_items', 'string', 'max:80'],
            'rent_items.*.amount_brl' => ['required_with:rent_items', 'numeric', 'min:0', 'max:999999.99'],
            'extra_monthly_items' => ['nullable', 'array', 'max:200'],
            'extra_monthly_items.*.id' => ['nullable', 'string', 'max:50'],
            'extra_monthly_items.*.label' => ['required_with:extra_monthly_items', 'string', 'max:80'],
            'extra_monthly_items.*.amount_brl' => ['required_with:extra_monthly_items', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }
}
