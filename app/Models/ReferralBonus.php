<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralBonus extends Model
{
    protected $fillable = [
        'referrer_user_id',
        'referred_user_id',
        'bonus_days',
        'granted_at',
    ];

    protected $casts = [
        'bonus_days' => 'integer',
        'granted_at' => 'datetime',
    ];

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_user_id');
    }

    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }
}

