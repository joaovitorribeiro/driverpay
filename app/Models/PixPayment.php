<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PixPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'payment_id',
        'user_id',
        'plan',
        'status',
        'amount_brl',
        'cpf',
        'raw',
        'expires_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'raw' => 'array',
            'cpf' => 'encrypted',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'amount_brl' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
