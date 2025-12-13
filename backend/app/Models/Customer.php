<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'nik', 'name', 'phone', 'address', 'photo_ktp_path', 'trust_score'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
