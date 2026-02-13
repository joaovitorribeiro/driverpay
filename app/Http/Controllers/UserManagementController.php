<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->orderBy('id')
            ->paginate(20)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'pro_days_remaining' => $user->proDaysRemaining(),
                'pro_bonus_until' => $user->pro_bonus_until?->format('Y-m-d'),
            ]);

        $actor = $request->user();
        $canManageRoles = $actor?->hasRole(Roles::MASTER) ?? false;

        return Inertia::render($this->page($request), [
            'users' => $users,
            'roles' => [
                Roles::MASTER,
                Roles::ADMIN,
                Roles::DRIVER,
            ],
            'canAssignMaster' => $canManageRoles,
            'canManageRoles' => $canManageRoles,
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();

        if (! $actor || ! $actor->hasRole(Roles::MASTER)) {
            abort(403);
        }

        $data = $request->validate([
            'role' => ['required', 'string', Rule::in([Roles::MASTER, Roles::ADMIN, Roles::DRIVER])],
        ]);

        $user->syncRoles([$data['role']]);

        return back();
    }

    public function addProDays(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();

        if (! $actor || ! $actor->hasRole(Roles::MASTER)) {
            abort(403);
        }

        $data = $request->validate([
            'days' => ['required', 'integer', 'min:1'],
        ]);

        $currentUntil = $user->pro_bonus_until;
        
        if ($currentUntil && $currentUntil->isFuture()) {
            $user->pro_bonus_until = $currentUntil->addDays($data['days']);
        } else {
            $user->pro_bonus_until = now()->addDays($data['days']);
        }

        $user->save();

        return back()->with('success', "Adicionado {$data['days']} dias de PRO para {$user->name}.");
    }

    private function page(Request $request): string
    {
        $user = $request->user();

        if ($user && $user->hasRole(Roles::MASTER)) {
            return 'Users/Master/Index';
        }

        return 'Users/Admin/Index';
    }
}
