<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_settings', function (Blueprint $table) {
            $table->json('extra_monthly_items')->nullable()->after('rent_items');
        });
    }

    public function down(): void
    {
        Schema::table('driver_settings', function (Blueprint $table) {
            $table->dropColumn(['extra_monthly_items']);
        });
    }
};

