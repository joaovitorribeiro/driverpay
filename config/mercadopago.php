<?php

return [
    'reason' => env('MP_PREAPPROVAL_REASON', 'Driver Pay - Plano Pro'),
    'currency' => env('MP_CURRENCY', 'BRL'),
    'plans' => [
        'monthly' => [
            'frequency' => 1,
            'frequency_type' => 'months',
            'transaction_amount' => (float) env('MP_PRICE_MONTHLY', 9.90),
        ],
        'annual' => [
            'frequency' => 12,
            'frequency_type' => 'months',
            'transaction_amount' => (float) env('MP_PRICE_ANNUAL', 79.90),
        ],
    ],
];
