<?php

namespace App\Http\Controllers;

use App\Models\DriverCost;
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

        return Inertia::render($this->page($request), [
            'metrics' => [
                'today_total_cents' => $todayTotalCents,
                'month_total_cents' => $monthTotalCents,
                'month_count' => $monthCount,
            ],
            'latest' => $latest,
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

