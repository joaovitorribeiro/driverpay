<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDriverCostRequest;
use App\Http\Requests\UpdateDriverCostRequest;
use App\Models\DriverCost;
use App\Support\Roles;
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
        $query = DriverCost::query()->with('user:id,name,email')->orderByDesc('date')->orderByDesc('id');

        if ($user && $user->hasRole(Roles::DRIVER)) {
            $query->where('user_id', $user->id);
        }

        $costs = $query
            ->paginate(20)
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

