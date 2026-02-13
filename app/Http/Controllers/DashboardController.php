<?php

namespace App\Http\Controllers;

use App\Models\DriverCost;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $query = DriverCost::query();

        $isAdminOrMaster = $user && ($user->hasRole(Roles::MASTER) || $user->hasRole(Roles::ADMIN));

        if ($user && $user->hasRole(Roles::DRIVER)) {
            $query->where('user_id', $user->id);
        }

        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $todayTotalCents = (int) (clone $query)->whereDate('date', $today)->sum('amount_cents');
        $monthTotalCents = (int) (clone $query)->whereDate('date', '>=', $monthStart)->sum('amount_cents');
        $monthCount = (int) (clone $query)->whereDate('date', '>=', $monthStart)->count();

        $latest = (clone $query)
            ->with('user:id,name,email')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (DriverCost $cost) => [
                'id' => $cost->id,
                'date' => $cost->date?->format('Y-m-d'),
                'description' => $cost->description,
                'amount_cents' => $cost->amount_cents,
                'user' => $cost->relationLoaded('user') && $cost->user ? [
                    'id' => $cost->user->id,
                    'name' => $cost->user->name,
                    'email' => $cost->user->email,
                ] : null,
            ]);

        $driversOverview = null;

        if ($isAdminOrMaster) {
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

            $subscriptionEndSub = Subscription::query()
                ->whereColumn('subscriptions.user_id', 'users.id')
                ->whereIn('status', ['active', 'trialing', 'grace_period'])
                ->selectRaw('max(current_period_end_at)');

            $drivers = User::query()
                ->role(Roles::DRIVER)
                ->orderByDesc('created_at')
                ->addSelect([
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'is_pro',
                    'pro_bonus_until',
                ])
                ->selectSub($activeSubscriptionExists, 'has_active_subscription')
                ->selectSub($subscriptionEndSub, 'subscription_end_at')
                ->limit(200)
                ->get()
                ->map(function (User $driver) {
                    $isManualPro = (bool) $driver->is_pro;
                    $hasActiveSubscription = (bool) $driver->has_active_subscription;
                    $bonusUntil = $driver->pro_bonus_until;
                    $subEnd = $driver->subscription_end_at ? \Illuminate\Support\Carbon::parse($driver->subscription_end_at) : null;

                    $expiresAt = null;
                    if (! $isManualPro) {
                        if ($subEnd && $bonusUntil) {
                            $expiresAt = $subEnd->greaterThan($bonusUntil) ? $subEnd : $bonusUntil;
                        } elseif ($subEnd) {
                            $expiresAt = $subEnd;
                        } elseif ($bonusUntil) {
                            $expiresAt = $bonusUntil;
                        }
                    }

                    $isPro = $isManualPro
                        || $hasActiveSubscription
                        || ($bonusUntil !== null && $bonusUntil->isFuture());

                    $daysRemaining = $expiresAt ? now()->startOfDay()->diffInDays($expiresAt->startOfDay(), false) : null;
                    $daysRemaining = is_int($daysRemaining) && $daysRemaining > 0 ? $daysRemaining : 0;

                    return [
                        'id' => $driver->id,
                        'name' => $driver->name,
                        'email' => $driver->email,
                        'plan' => $isPro ? 'pro' : 'free',
                        'pro_source' => $isManualPro ? 'manual' : ($hasActiveSubscription ? 'subscription' : ($bonusUntil ? 'bonus' : null)),
                        'expires_at' => $expiresAt?->toISOString(),
                        'days_remaining' => $expiresAt ? $daysRemaining : null,
                        'created_at' => $driver->created_at?->toISOString(),
                    ];
                });

            $driversCount = (int) User::query()->role(Roles::DRIVER)->count();
            $driversProCount = (int) $drivers->where('plan', 'pro')->count();
            $expiringSoonCount = (int) $drivers
                ->filter(fn ($d) => $d['plan'] === 'pro' && is_int($d['days_remaining']) && $d['days_remaining'] <= 7)
                ->count();

            $driversOverview = [
                'total' => $driversCount,
                'pro' => $driversProCount,
                'free' => $driversCount - $driversProCount,
                'expiring_7d' => $expiringSoonCount,
                'items' => $drivers,
            ];
        }

        return Inertia::render($this->page($request), [
            'metrics' => [
                'today_total_cents' => $todayTotalCents,
                'month_total_cents' => $monthTotalCents,
                'month_count' => $monthCount,
            ],
            'latest' => $latest,
            'drivers' => $driversOverview,
        ]);
    }

    private function page(Request $request): string
    {
        $user = $request->user();

        if ($user && $user->hasRole(Roles::MASTER)) {
            return 'Dashboard/Master';
        }

        if ($user && $user->hasRole(Roles::ADMIN)) {
            return 'Dashboard/Admin';
        }

        return 'Dashboard/Driver';
    }
}
