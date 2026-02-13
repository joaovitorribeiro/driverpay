<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_bonuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->integer('bonus_days');
            $table->timestamp('granted_at');
            $table->timestamps();

            $table->index(['referrer_user_id', 'granted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_bonuses');
    }
};

