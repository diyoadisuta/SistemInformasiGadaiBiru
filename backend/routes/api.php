<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/user', [\App\Http\Controllers\Api\AuthController::class, 'user']);

    Route::apiResource('customers', \App\Http\Controllers\Api\CustomersController::class);
    Route::apiResource('transactions', \App\Http\Controllers\Api\TransactionsController::class);
    Route::post('transactions/{transaction}/repay', [\App\Http\Controllers\Api\TransactionsController::class, 'repay']);
    Route::post('transactions/{transaction}/extend', [\App\Http\Controllers\Api\TransactionsController::class, 'extend']);
    Route::get('transactions/{transaction}/print', [\App\Http\Controllers\Api\TransactionsController::class, 'print']);
    
    Route::get('inventory', [\App\Http\Controllers\Api\InventoryController::class, 'index']);
    Route::get('dashboard/stats', [\App\Http\Controllers\Api\ReportController::class, 'stats']);
});
