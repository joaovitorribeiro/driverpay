<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->decimal('fuel_price_brl', 10, 2)->default(0);
            $table->decimal('consumption_km_per_l', 10, 2)->default(0);
            $table->decimal('maintenance_monthly_brl', 10, 2)->nullable();
            $table->decimal('rent_monthly_brl', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_settings');
    }
};

