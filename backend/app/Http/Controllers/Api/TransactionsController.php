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
            'items.*.image' => 'nullable|image|max:10240', // Max 10MB
            'items.*.grade' => 'nullable|string|in:A,B,C,D,E',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Calculate Interest
            $interestRate = 5; 
            $interestAmount = $validated['loan_amount'] * ($interestRate / 100);

            $startDate = now();
            $dueDate = now()->addDays($validated['duration_days']);

            $transaction = Transaction::create([
                'transaction_number' => 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'customer_id' => $validated['customer_id'],
                'user_id' => $request->user()->id ?? 1,
                'status' => 'active',
                'loan_amount' => $validated['loan_amount'],
                'interest_rate' => $interestRate,
                'interest_amount' => $interestAmount,
                'start_date' => $startDate,
                'due_date' => $dueDate,
            ]);

            foreach ($validated['items'] as $index => $itemData) {
                $photoPath = null;
                
                // Handle Image Upload
                if ($request->hasFile("items.{$index}.image")) {
                    $file = $request->file("items.{$index}.image");
                    $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('transaction_items', $filename, 'public');
                    $photoPath = '/storage/' . $path;
                }

                $transaction->items()->create([
                    'name' => $itemData['name'],
                    'category' => $itemData['category'],
                    'brand' => $itemData['brand'] ?? '-',
                    'serial_number' => $itemData['serial_number'] ?? null,
                    'description' => $itemData['description'] ?? '',
                    'estimated_value' => $itemData['estimated_value'],
                    'photo_path' => $photoPath,
                    'grade' => $itemData['grade'] ?? null,
                ]);
            }

            return response()->json($transaction->load('items'), 201);
        });
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load(['customer', 'items', 'payments']));
    }

    public function extend(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0', // Should match interest amount
            'days' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $transaction, $request) {
            // 1. Record Payment for Interest
            $payment = $transaction->payments()->create([
                'payment_number' => 'PAY-EXT-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'amount' => $validated['amount'],
                'payment_type' => 'extension',
                'payment_date' => now(),
                'user_id' => $request->user()->id ?? 1,
            ]);

            // 2. Calculate New Interest for next period (if applicable, or keep same)
            // For now, assuming fixed interest for extension period
            
            // 3. Extend Due Date
            $newDueDate = \Carbon\Carbon::parse($transaction->due_date)->addDays($validated['days']);
            $transaction->update([
                'due_date' => $newDueDate,
                // 'interest_amount' => ... // Recalculate if needed
            ]);

            return response()->json([
                'message' => 'Transaction extended successfully',
                'new_due_date' => $newDueDate,
                'payment' => $payment
            ]);
        });
    }

    public function repay(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0', // Should be loan + remaining interest
        ]);

        return DB::transaction(function () use ($validated, $transaction, $request) {
            $payment = $transaction->payments()->create([
                'payment_number' => 'PAY-PYM-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'amount' => $validated['amount'],
                'payment_type' => 'full_redemption',
                'payment_date' => now(),
                'user_id' => $request->user()->id ?? 1,
            ]);

            $transaction->update([
                'status' => 'completed', 
                'completed_at' => now()
            ]);

            return response()->json([
                'message' => 'Transaction repaied successfully',
                'payment' => $payment
            ]);
        });
    }

    public function print(Transaction $transaction)
    {
        $transaction->load(['customer', 'items']);
        return view('documents.pawn_ticket', compact('transaction'));
    }
}
