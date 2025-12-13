<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'transaction_id', 'payment_number', 'amount',
        'payment_type', 'payment_date', 'user_id'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
