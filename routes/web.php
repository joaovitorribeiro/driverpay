<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverAccountController;
use App\Http\Controllers\DriverCostController;
use App\Http\Controllers\DriverReferController;
use App\Http\Controllers\DriverSettingsController;
use App\Http\Controllers\LogViewerController;
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

Route::get('/privacy-policy', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('privacy.policy');

Route::get('/terms-of-use', function () {
    return Inertia::render('Legal/TermsOfUse');
})->name('terms.use');

Route::get('/dashboard', [DashboardController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/upgrade', fn () => redirect()->route('pro'))->name('upgrade');

    Route::get('/pro', [ProController::class, 'show'])->name('pro');
    Route::post('/billing/google/start', [ProController::class, 'start'])->name('billing.google.start');
    Route::get('/billing/google/manage', [ProController::class, 'manage'])->name('billing.google.manage');

    Route::get('/refer', [DriverReferController::class, 'show'])->name('refer');

    Route::get('/account', [DriverAccountController::class, 'show'])->name('account');
    Route::post('/account/password-reset', [DriverAccountController::class, 'sendPasswordResetLink'])->name('account.password_reset');

    Route::get('/settings', [DriverSettingsController::class, 'show'])->name('settings');
    Route::patch('/settings', [DriverSettingsController::class, 'update'])->name('settings.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('costs', DriverCostController::class)->except(['show']);

    Route::get('/users', [UserManagementController::class, 'index'])
        ->middleware('permission:users.manage')
        ->name('users.index');
    Route::put('/users/{user}/role', [UserManagementController::class, 'updateRole'])
        ->middleware('permission:users.manage')
        ->name('users.role.update');

    Route::get('/logs', [LogViewerController::class, 'index'])
        ->middleware('permission:logs.view')
        ->name('logs.index');
});

require __DIR__.'/auth.php';
