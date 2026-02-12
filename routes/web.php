<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverCostController;
use App\Http\Controllers\LogViewerController;
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

Route::get('/dashboard', [DashboardController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
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
