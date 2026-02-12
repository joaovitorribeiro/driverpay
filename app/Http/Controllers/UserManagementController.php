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
            ]);

        return Inertia::render($this->page($request), [
            'users' => $users,
            'roles' => [
                Roles::MASTER,
                Roles::ADMIN,
                Roles::DRIVER,
            ],
            'canAssignMaster' => $request->user()?->hasRole(Roles::MASTER) ?? false,
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();

        $data = $request->validate([
            'role' => ['required', 'string', Rule::in([Roles::MASTER, Roles::ADMIN, Roles::DRIVER])],
        ]);

        if ($data['role'] === Roles::MASTER && ! $actor->hasRole(Roles::MASTER)) {
            abort(403);
        }

        $user->syncRoles([$data['role']]);

        return back();
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

