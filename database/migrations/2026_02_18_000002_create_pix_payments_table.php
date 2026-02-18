<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pix_payments', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('payment_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('amount_brl', 10, 2)->default(0);
            $table->text('cpf')->nullable();
            $table->json('raw')->nullable();
            $table->timestampTz('expires_at')->nullable();
            $table->timestampTz('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'payment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pix_payments');
    }
};
