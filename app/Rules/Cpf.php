<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Cpf implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) && ! is_numeric($value)) {
            $fail('CPF inválido.');
            return;
        }

        $cpf = preg_replace('/\D+/', '', (string) $value);
        if (! is_string($cpf) || ! $this->isValid($cpf)) {
            $fail('CPF inválido.');
        }
    }

    private function isValid(string $cpf): bool
    {
        if (strlen($cpf) !== 11) {
            return false;
        }

        if (preg_match('/^(\d)\1{10}$/', $cpf) === 1) {
            return false;
        }

        $d1 = $this->calcDigit(substr($cpf, 0, 9), 10);
        $d2 = $this->calcDigit(substr($cpf, 0, 10), 11);

        return (int) $cpf[9] === $d1 && (int) $cpf[10] === $d2;
    }

    private function calcDigit(string $base, int $factor): int
    {
        $sum = 0;
        $len = strlen($base);
        for ($i = 0; $i < $len; $i++) {
            $sum += ((int) $base[$i]) * ($factor - $i);
        }

        $mod = ($sum * 10) % 11;

        return $mod === 10 ? 0 : $mod;
    }
}

