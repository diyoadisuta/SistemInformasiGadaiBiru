<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique(); // TRX-YYYYMMDD-XXXX
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users'); // Created by
            $table->enum('status', ['active', 'completed', 'overdue', 'auctioned'])->default('active');
            $table->decimal('loan_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2); // %
            $table->decimal('interest_amount', 15, 2);
            $table->date('start_date');
            $table->date('due_date');
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
