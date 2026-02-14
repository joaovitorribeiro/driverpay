<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_settings', function (Blueprint $table) {
            $table->json('maintenance_items')->nullable()->after('maintenance_monthly_brl');
            $table->json('rent_items')->nullable()->after('rent_monthly_brl');
        });
    }

    public function down(): void
    {
        Schema::table('driver_settings', function (Blueprint $table) {
            $table->dropColumn(['maintenance_items', 'rent_items']);
        });
    }
};

