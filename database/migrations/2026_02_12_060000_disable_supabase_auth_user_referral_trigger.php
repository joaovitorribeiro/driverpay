<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        $table = DB::scalar("select to_regclass('auth.users')");

        if ($table === null) {
            return;
        }

        DB::statement('drop trigger if exists trg_handle_new_user_referrals on auth.users');
    }

    public function down(): void
    {
    }
};
