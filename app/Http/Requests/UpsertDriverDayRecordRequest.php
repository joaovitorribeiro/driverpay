<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertDriverDayRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];

        foreach (['gains_brl', 'km'] as $key) {
            $value = $this->input($key);
            if (! is_string($value)) {
                continue;
            }

            $normalized[$key] = $this->normalizeNumberString($value);
        }

        $expenses = $this->input('expenses');
        if (is_array($expenses)) {
            $next = [];
            foreach ($expenses as $item) {
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

            $normalized['expenses'] = $next;
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
            'date' => ['required', 'date_format:Y-m-d'],
            'gains_brl' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'km' => ['nullable', 'numeric', 'min:0', 'max:999999.9'],
            'expenses' => ['nullable', 'array', 'max:200'],
            'expenses.*.id' => ['nullable', 'string', 'max:50'],
            'expenses.*.label' => ['nullable', 'string', 'max:80'],
            'expenses.*.amount_brl' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }
}

