<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use App\Support\Referral;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverReferController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        if ($user && ! $user->referral_code) {
            $user->forceFill([
                'referral_code' => Referral::makeCode($user),
            ])->save();
        }

        $code = $user?->referral_code;
        $link = $code ? url('/register?ref='.$code) : url('/register');

        $activeSubscriptionExists = Subscription::query()
            ->selectRaw('1')
            ->whereColumn('subscriptions.user_id', 'users.id')
            ->whereIn('status', ['active', 'trialing', 'grace_period'])
            ->where(function ($query) {
                $query
                    ->whereNull('current_period_end_at')
                    ->orWhere('current_period_end_at', '>', now());
            })
            ->limit(1);

        $referrals = User::query()
            ->where('referred_by_user_id', $user->id)
            ->orderByDesc('created_at')
            ->addSelect([
                'id',
                'name',
                'email',
                'created_at',
                'is_pro',
            ])
            ->selectSub($activeSubscriptionExists, 'has_active_subscription')
            ->paginate(20)
            ->appends($request->query())
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'plan' => ((bool) $u->is_pro || (bool) $u->has_active_subscription) ? 'pro' : 'free',
                'created_at' => $u->created_at?->toISOString(),
            ]);

        return Inertia::render('Driver/Refer', [
            'referral' => [
                'code' => $code,
                'link' => $link,
            ],
            'referrals' => $referrals,
        ]);
    }
}
