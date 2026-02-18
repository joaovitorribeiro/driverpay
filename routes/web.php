<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverAccountController;
use App\Http\Controllers\DriverCostController;
use App\Http\Controllers\DriverDayRecordController;
use App\Http\Controllers\DriverReferController;
use App\Http\Controllers\DriverSettingsController;
use App\Http\Controllers\LegalDocumentController;
use App\Http\Controllers\LogViewerController;
use App\Http\Controllers\MercadoPagoBillingController;
use App\Http\Controllers\ProController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Public Legal Routes
Route::get('/legal/{type}', [LegalDocumentController::class, 'show'])
    ->name('legal.show');
Route::get('/legal/{type}/content', [LegalDocumentController::class, 'content'])
    ->name('legal.content');

// Compatibility redirects
Route::get('/privacy-policy', function () {
    return redirect()->route('legal.show', 'privacy_policy');
})->name('privacy.policy');

Route::get('/terms-of-use', function () {
    return redirect()->route('legal.show', 'terms_of_use');
})->name('terms.use');

Route::get('/dashboard', [DashboardController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/upgrade', fn () => redirect()->route('pro'))->name('upgrade');

    Route::get('/pro', [ProController::class, 'show'])->name('pro');
    Route::post('/billing/google/start', [ProController::class, 'start'])->name('billing.google.start');
    Route::get('/billing/google/manage', [ProController::class, 'manage'])->name('billing.google.manage');
    Route::get('/billing/mercadopago', [MercadoPagoBillingController::class, 'portal'])->name('billing.mercadopago.portal');
    Route::post('/billing/mercadopago/start', [MercadoPagoBillingController::class, 'start'])->name('billing.mercadopago.start');
    Route::get('/billing/mercadopago/pix/{id}', [MercadoPagoBillingController::class, 'showPix'])->name('billing.mercadopago.pix');
    Route::post('/billing/mercadopago/cancel', [MercadoPagoBillingController::class, 'cancel'])->name('billing.mercadopago.cancel');
    Route::get('/billing/mercadopago/return', [MercadoPagoBillingController::class, 'back'])->name('billing.mercadopago.return');

    Route::get('/refer', [DriverReferController::class, 'show'])->name('refer');

    Route::get('/account', [DriverAccountController::class, 'show'])->name('account');
    Route::post('/account/password-reset', [DriverAccountController::class, 'sendPasswordResetLink'])->name('account.password_reset');

    Route::get('/settings', [DriverSettingsController::class, 'show'])->name('settings');
    Route::patch('/settings', [DriverSettingsController::class, 'update'])->name('settings.update');

    Route::post('/day-records', [DriverDayRecordController::class, 'upsert'])
        ->name('day-records.upsert');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/costs/export', [DriverCostController::class, 'export'])
        ->middleware('pro')
        ->name('costs.export');
    Route::resource('costs', DriverCostController::class)->except(['show']);

    Route::get('/users', [UserManagementController::class, 'index'])
        ->middleware('permission:users.manage')
        ->name('users.index');
    Route::put('/users/{user}/role', [UserManagementController::class, 'updateRole'])
        ->middleware('permission:users.manage')
        ->name('users.role.update');
    Route::post('/users/{user}/pro-days', [UserManagementController::class, 'addProDays'])
        ->middleware('role:master')
        ->name('users.pro_days.add');

    Route::get('/logs', [LogViewerController::class, 'index'])
        ->middleware('permission:logs.view')
        ->name('logs.index');

    // Master Legal Editing Routes
    Route::middleware(['role:master'])->prefix('master')->name('master.')->group(function () {
        Route::get('/legal/{type}/edit', [LegalDocumentController::class, 'edit'])->name('legal.edit');
        Route::put('/legal/{type}', [LegalDocumentController::class, 'update'])->name('legal.update');
    });
});

require __DIR__.'/auth.php';
