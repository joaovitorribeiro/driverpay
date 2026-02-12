<?php

namespace App\Http\Requests;

use App\Models\DriverCost;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDriverCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var DriverCost|null $driverCost */
        $driverCost = $this->route('cost');

        return $driverCost ? $this->user()?->can('update', $driverCost) ?? false : false;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'amount_cents' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

