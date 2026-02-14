<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverSetting extends Model
{
    protected $fillable = [
        'user_id',
        'fuel_price_brl',
        'consumption_km_per_l',
        'maintenance_monthly_brl',
        'maintenance_items',
        'rent_monthly_brl',
        'rent_items',
        'extra_monthly_items',
    ];

    protected $casts = [
        'fuel_price_brl' => 'decimal:2',
        'consumption_km_per_l' => 'decimal:2',
        'maintenance_monthly_brl' => 'decimal:2',
        'maintenance_items' => 'array',
        'rent_monthly_brl' => 'decimal:2',
        'rent_items' => 'array',
        'extra_monthly_items' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
