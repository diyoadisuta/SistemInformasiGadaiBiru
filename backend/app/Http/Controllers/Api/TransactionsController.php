<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionsController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['customer', 'items']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'loan_amount' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.category' => 'required|string',
            'items.*.estimated_value' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Calculate Interest (Example: 5% flat per 15 days)
            // Simplified logic: 5% of loan amount
            $interestRate = 5; 
            $interestAmount = $validated['loan_amount'] * ($interestRate / 100);

            $startDate = now();
            $dueDate = now()->addDays($validated['duration_days']);

            $transaction = Transaction::create([
                'transaction_number' => 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'customer_id' => $validated['customer_id'],
                'user_id' => $request->user()->id ?? 1, // Fallback to 1 if not auth for dev
                'status' => 'active',
                'loan_amount' => $validated['loan_amount'],
                'interest_rate' => $interestRate,
                'interest_amount' => $interestAmount,
                'start_date' => $startDate,
                'due_date' => $dueDate,
            ]);

            foreach ($validated['items'] as $item) {
                $transaction->items()->create([
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'brand' => $item['brand'] ?? '-',
                    'serial_number' => $item['serial_number'] ?? null,
                    'description' => $item['description'] ?? '',
                    'estimated_value' => $item['estimated_value'],
                ]);
            }

            return response()->json($transaction->load('items'), 201);
        });
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load(['customer', 'items', 'payments']));
    }

    public function repay(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:interest_only,full_redemption'
        ]);

        return DB::transaction(function () use ($validated, $transaction, $request) {
            $payment = $transaction->payments()->create([
                'payment_number' => 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'amount' => $validated['amount'],
                'payment_type' => $validated['type'],
                'payment_date' => now(),
                'user_id' => $request->user()->id ?? 1,
            ]);

            if ($validated['type'] === 'full_redemption') {
                $transaction->update(['status' => 'completed', 'completed_at' => now()]);
            } elseif ($validated['type'] === 'interest_only') {
                // Extend due date logic here if needed
                $transaction->update(['due_date' => $transaction->due_date->addDays(15)]); 
            }

            return response()->json($payment, 201);
        });
    }
}
