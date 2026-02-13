<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

class Referral
{
    public static function normalize(?string $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $value = Str::of($value)
            ->replaceMatches('/[^a-zA-Z0-9]+/', '')
            ->upper()
            ->toString();

        return $value !== '' ? $value : null;
    }

    public static function makeCode(User $user): string
    {
        $slug = Str::of($user->name)->slug('')->upper()->toString();
        $slug = $slug !== '' ? Str::substr($slug, 0, 6) : 'DRIVER';

        for ($i = 0; $i < 10; $i++) {
            $code = self::normalize($slug.Str::upper(Str::random(6)));
            if (! $code) {
                continue;
            }

            $exists = User::query()
                ->where('referral_code', $code)
                ->exists();

            if (! $exists) {
                return $code;
            }
        }

        return self::normalize('DP'.$user->id.Str::upper(Str::random(10))) ?? ('DP'.$user->id);
    }
}
