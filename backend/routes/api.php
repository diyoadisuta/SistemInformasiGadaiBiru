<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('customers', \App\Http\Controllers\Api\CustomersController::class);
    Route::apiResource('transactions', \App\Http\Controllers\Api\TransactionsController::class);
    Route::post('transactions/{transaction}/repay', [\App\Http\Controllers\Api\TransactionsController::class, 'repay']);
    
    Route::get('dashboard/stats', [\App\Http\Controllers\Api\ReportController::class, 'stats']);
});
