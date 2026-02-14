<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverDayRecord extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'gains_cents',
        'km',
        'expenses',
    ];

    protected $casts = [
        'date' => 'date',
        'km' => 'decimal:1',
        'expenses' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
