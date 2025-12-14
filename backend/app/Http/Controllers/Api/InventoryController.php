<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransactionItem;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        // Fetch items from transactions where status is 'active'
        $items = TransactionItem::whereHas('transaction', function ($query) {
            $query->where('status', 'active');
        })->with('transaction:id,transaction_number,due_date')->latest()->paginate(20);

        return response()->json($items);
    }
}
