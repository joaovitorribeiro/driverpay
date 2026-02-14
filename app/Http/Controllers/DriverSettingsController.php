<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateDriverSettingsRequest;
use App\Models\DriverSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverSettingsController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $settings = $user?->driverSetting;

        return Inertia::render('Driver/Settings', [
            'settings' => [
                'fuel_price_brl' => $settings?->fuel_price_brl !== null ? (string) $settings->fuel_price_brl : '0',
                'consumption_km_per_l' => $settings?->consumption_km_per_l !== null ? (string) $settings->consumption_km_per_l : '0',
                'maintenance_monthly_brl' => $settings?->maintenance_monthly_brl !== null ? (string) $settings->maintenance_monthly_brl : '',
                'maintenance_items' => $settings?->maintenance_items ?? [],
                'rent_monthly_brl' => $settings?->rent_monthly_brl !== null ? (string) $settings->rent_monthly_brl : '',
                'rent_items' => $settings?->rent_items ?? [],
            ],
        ]);
    }

    public function update(UpdateDriverSettingsRequest $request): RedirectResponse
    {
        $user = $request->user();

        DriverSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'fuel_price_brl' => $request->validated('fuel_price_brl'),
                'consumption_km_per_l' => $request->validated('consumption_km_per_l'),
                'maintenance_monthly_brl' => $request->validated('maintenance_monthly_brl'),
                'maintenance_items' => $request->validated('maintenance_items', []),
                'rent_monthly_brl' => $request->validated('rent_monthly_brl'),
                'rent_items' => $request->validated('rent_items', []),
            ],
        );

        return redirect()->route('settings');
    }
}
