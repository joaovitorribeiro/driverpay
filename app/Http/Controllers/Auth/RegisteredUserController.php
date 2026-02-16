<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Permissions;
use App\Support\Referral;
use App\Support\Roles;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'referral' => $request->query('ref'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'referral' => 'nullable|string|max:64',
        ]);

        $referral = Referral::normalize($request->input('referral'));
        $referrer = null;
        if ($referral) {
            $referrer = User::query()->where('referral_code', $referral)->first();
            if (! $referrer) {
                return back()->withErrors([
                    'referral' => 'Código de indicação inválido.',
                ])->onlyInput('referral');
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'public_id' => (string) Str::uuid(),
        ]);

        $user->forceFill([
            'referred_by_user_id' => $referrer?->id,
        ])->save();

        if (! $user->referral_code) {
            $user->forceFill([
                'referral_code' => Referral::makeCode($user),
            ])->save();
        }

        $role = Role::findOrCreate(Roles::DRIVER);

        if ($role->permissions()->count() === 0) {
            $permissions = Permissions::getPermissions(Roles::DRIVER);
            foreach ($permissions as $permission) {
                Permission::findOrCreate($permission);
            }
            $role->syncPermissions($permissions);
        }

        $user->assignRole($role);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
