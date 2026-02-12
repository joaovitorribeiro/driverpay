<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('drop trigger if exists trg_handle_new_user_referrals on auth.users');
    }

    public function down(): void
    {
    }
};

