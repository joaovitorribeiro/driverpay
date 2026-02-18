<?php

use App\Http\Controllers\Webhooks\MercadoPagoWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/mercadopago', MercadoPagoWebhookController::class)
    ->name('api.webhooks.mercadopago');
