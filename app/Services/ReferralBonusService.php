<?php

namespace App\Services;

use App\Models\ReferralBonus;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReferralBonusService
{
    public function maybeGrantForReferredUser(User $referredUser, int $bonusDays = 7): void
    {
        if (! $referredUser->referred_by_user_id) {
            return;
        }

        if (! $referredUser->isPaidPro()) {
            return;
        }

        DB::transaction(function () use ($referredUser, $bonusDays) {
            $alreadyGranted = ReferralBonus::query()
                ->where('referred_user_id', $referredUser->id)
                ->exists();

            if ($alreadyGranted) {
                return;
            }

            $referrer = User::query()
                ->lockForUpdate()
                ->find($referredUser->referred_by_user_id);

            if (! $referrer) {
                return;
            }

            $base = $referrer->pro_bonus_until && $referrer->pro_bonus_until->isFuture()
                ? $referrer->pro_bonus_until
                : now();

            $referrer->forceFill([
                'pro_bonus_until' => Carbon::parse($base)->addDays($bonusDays),
            ])->save();

            ReferralBonus::create([
                'referrer_user_id' => $referrer->id,
                'referred_user_id' => $referredUser->id,
                'bonus_days' => $bonusDays,
                'granted_at' => now(),
            ]);
        });
    }
}

