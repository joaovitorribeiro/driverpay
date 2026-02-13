<?php

namespace App\Http\Controllers;

use App\Support\Referral;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DriverAccountController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        if ($user && ! $user->public_id) {
            $user->forceFill([
                'public_id' => (string) Str::uuid(),
            ])->save();
        }

        if ($user && ! $user->referral_code) {
            $user->forceFill([
                'referral_code' => Referral::makeCode($user),
            ])->save();
        }

        $settings = $user?->driverSetting;

        return Inertia::render('Driver/Account', [
            'account' => [
                'id' => $user?->id,
                'public_id' => $user?->public_id,
                'name' => $user?->name,
                'email' => $user?->email,
                'referral_code' => $user?->referral_code,
            ],
            'driver_settings' => [
                'fuel_price_brl' => $settings?->fuel_price_brl !== null ? (string) $settings->fuel_price_brl : '0',
                'consumption_km_per_l' => $settings?->consumption_km_per_l !== null ? (string) $settings->consumption_km_per_l : '0',
                'maintenance_monthly_brl' => $settings?->maintenance_monthly_brl !== null ? (string) $settings->maintenance_monthly_brl : '0',
                'rent_monthly_brl' => $settings?->rent_monthly_brl !== null ? (string) $settings->rent_monthly_brl : '0',
            ],
            'status' => session('account_status'),
        ]);
    }

    public function sendPasswordResetLink(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->email) {
            return redirect()
                ->route('account')
                ->with('account_status', 'Não foi possível enviar o link.');
        }

        $result = Password::sendResetLink([
            'email' => $user->email,
        ]);

        $message = $result === Password::RESET_LINK_SENT
            ? 'Link enviado para seu e-mail.'
            : 'Não foi possível enviar o link. Tente novamente.';

        return redirect()
            ->route('account')
            ->with('account_status', $message);
    }
}

