<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'package_name',
        'product_id',
        'purchase_token',
        'latest_order_id',
        'plan',
        'status',
        'auto_renewing',
        'started_at',
        'current_period_start_at',
        'current_period_end_at',
        'canceled_at',
        'ended_at',
        'raw',
    ];

    protected $casts = [
        'auto_renewing' => 'boolean',
        'started_at' => 'datetime',
        'current_period_start_at' => 'datetime',
        'current_period_end_at' => 'datetime',
        'canceled_at' => 'datetime',
        'ended_at' => 'datetime',
        'raw' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(SubscriptionEvent::class);
    }
}

