<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Customer;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function stats()
    {
        $activeTransactions = Transaction::where('status', 'active')->count();
        $totalLoanAmount = Transaction::where('status', 'active')->sum('loan_amount');
        $overdueTransactions = Transaction::where('status', 'overdue')->count();
        $totalCustomers = Customer::count();

        return response()->json([
            'active_loans_count' => $activeTransactions,
            'active_loans_total' => $totalLoanAmount,
            'overdue_count' => $overdueTransactions,
            'total_customers' => $totalCustomers,
        ]);
    }
}
