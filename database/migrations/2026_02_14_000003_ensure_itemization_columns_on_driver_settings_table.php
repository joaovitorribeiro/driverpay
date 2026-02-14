<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $columnsToAdd = [
            'maintenance_items' => fn (Blueprint $table) => $table->json('maintenance_items')->nullable(),
            'rent_items' => fn (Blueprint $table) => $table->json('rent_items')->nullable(),
            'extra_monthly_items' => fn (Blueprint $table) => $table->json('extra_monthly_items')->nullable(),
        ];

        $missing = array_filter(
            array_keys($columnsToAdd),
            fn (string $column) => ! Schema::hasColumn('driver_settings', $column)
        );

        if ($missing === []) {
            return;
        }

        Schema::table('driver_settings', function (Blueprint $table) use ($columnsToAdd, $missing) {
            foreach ($missing as $column) {
                $columnsToAdd[$column]($table);
            }
        });
    }

    public function down(): void
    {
        $columns = array_values(array_filter([
            Schema::hasColumn('driver_settings', 'maintenance_items') ? 'maintenance_items' : null,
            Schema::hasColumn('driver_settings', 'rent_items') ? 'rent_items' : null,
            Schema::hasColumn('driver_settings', 'extra_monthly_items') ? 'extra_monthly_items' : null,
        ]));

        if ($columns === []) {
            return;
        }

        Schema::table('driver_settings', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }
};
