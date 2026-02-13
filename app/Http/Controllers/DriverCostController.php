<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDriverCostRequest;
use App\Http\Requests\UpdateDriverCostRequest;
use App\Models\DriverCost;
use App\Support\Roles;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverCostController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DriverCost::class);

        $user = $request->user();
        $isPro = $user ? $user->isProAccess() : false;

        $query = DriverCost::query()
            ->with('user:id,name,email')
            ->orderByDesc('date')
            ->orderByDesc('id');

        $period = $request->query('period');
        $resolvedPeriod = in_array($period, ['7d', '30d', 'all'], true) ? $period : null;

        if (! $isPro && $resolvedPeriod && $resolvedPeriod !== '7d') {
            $resolvedPeriod = '7d';
        }

        if ($user && $user->hasRole(Roles::DRIVER)) {
            $query->where('user_id', $user->id);

            if (! $resolvedPeriod) {
                $resolvedPeriod = '7d';
            }
        }

        if ($resolvedPeriod === '7d' || $resolvedPeriod === '30d') {
            $days = $resolvedPeriod === '30d' ? 30 : 7;
            $from = CarbonImmutable::now()->subDays($days - 1)->startOfDay()->toDateString();
            $query->whereDate('date', '>=', $from);
        }

        $summaryQuery = (clone $query)->reorder();
        $totalCents = (int) (clone $summaryQuery)->sum('amount_cents');

        $daily = (clone $summaryQuery)
            ->selectRaw('date, sum(amount_cents) as total_cents')
            ->groupBy('date');

        $bestDay = (clone $daily)->orderBy('total_cents')->first();
        $worstDay = (clone $daily)->orderByDesc('total_cents')->first();

        $bestDate = $bestDay?->date;
        $worstDate = $worstDay?->date;

        $costs = $query
            ->paginate(20)
            ->appends($request->query())
            ->through(fn (DriverCost $cost) => [
                'id' => $cost->id,
                'date' => $cost->date?->format('Y-m-d'),
                'description' => $cost->description,
                'amount_cents' => $cost->amount_cents,
                'notes' => $cost->notes,
                'user' => $cost->relationLoaded('user') && $cost->user ? [
                    'id' => $cost->user->id,
                    'name' => $cost->user->name,
                    'email' => $cost->user->email,
                ] : null,
                'can' => [
                    'update' => $request->user()?->can('update', $cost) ?? false,
                    'delete' => $request->user()?->can('delete', $cost) ?? false,
                ],
            ]);

        return Inertia::render($this->page('Index', $request), [
            'costs' => $costs,
            'filters' => [
                'period' => $resolvedPeriod,
            ],
            'entitlements' => [
                'is_pro' => $isPro,
            ],
            'summary' => [
                'total_cents' => $totalCents,
                'best_day' => $bestDate ? [
                    'date' => is_string($bestDate) ? $bestDate : $bestDate->format('Y-m-d'),
                    'total_cents' => (int) $bestDay->total_cents,
                ] : null,
                'worst_day' => $worstDate ? [
                    'date' => is_string($worstDate) ? $worstDate : $worstDate->format('Y-m-d'),
                    'total_cents' => (int) $worstDay->total_cents,
                ] : null,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', DriverCost::class);

        return Inertia::render($this->page('Create', $request), []);
    }

    public function store(StoreDriverCostRequest $request): RedirectResponse
    {
        $user = $request->user();

        DriverCost::create([
            'user_id' => $user->id,
            'date' => $request->validated('date'),
            'description' => $request->validated('description'),
            'amount_cents' => $request->validated('amount_cents'),
            'notes' => $request->validated('notes'),
        ]);

        return redirect()->route('costs.index');
    }

    public function edit(Request $request, DriverCost $cost): Response
    {
        $this->authorize('update', $cost);

        return Inertia::render($this->page('Edit', $request), [
            'cost' => [
                'id' => $cost->id,
                'date' => $cost->date?->format('Y-m-d'),
                'description' => $cost->description,
                'amount_cents' => $cost->amount_cents,
                'notes' => $cost->notes,
            ],
        ]);
    }

    public function update(UpdateDriverCostRequest $request, DriverCost $cost): RedirectResponse
    {
        $cost->update($request->validated());

        return redirect()->route('costs.index');
    }

    public function destroy(Request $request, DriverCost $cost): RedirectResponse
    {
        $this->authorize('delete', $cost);

        $cost->delete();

        return redirect()->route('costs.index');
    }

    private function page(string $suffix, Request $request): string
    {
        $user = $request->user();

        if ($user && $user->hasRole(Roles::MASTER)) {
            return "Costs/Master/{$suffix}";
        }

        if ($user && $user->hasRole(Roles::ADMIN)) {
            return "Costs/Admin/{$suffix}";
        }

        return "Costs/Driver/{$suffix}";
    }
}
