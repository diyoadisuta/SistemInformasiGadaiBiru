<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'name', 'category', 'brand',
        'serial_number', 'description', 'estimated_value', 'photo_path', 'grade'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
    //
}
