<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertDriverDayRecordRequest;
use App\Models\DriverDayRecord;
use Illuminate\Http\JsonResponse;

class DriverDayRecordController extends Controller
{
    public function upsert(UpsertDriverDayRecordRequest $request): JsonResponse
    {
        $user = $request->user();

        $gainsCents = $this->moneyToCents($request->validated('gains_brl'));
        $km = $request->validated('km') ?? 0;

        $expenses = [];
        foreach ($request->validated('expenses', []) as $item) {
            $amountCents = $this->moneyToCents($item['amount_brl'] ?? null);
            if ($amountCents <= 0 && ! trim((string) ($item['label'] ?? ''))) {
                continue;
            }

            $expenses[] = [
                'id' => $item['id'] ?? null,
                'label' => (string) ($item['label'] ?? ''),
                'amount_cents' => $amountCents,
            ];
        }

        DriverDayRecord::updateOrCreate(
            [
                'user_id' => $user->id,
                'date' => $request->validated('date'),
            ],
            [
                'gains_cents' => $gainsCents,
                'km' => $km,
                'expenses' => $expenses,
            ],
        );

        return response()->json(['ok' => true]);
    }

    private function moneyToCents(mixed $value): int
    {
        if ($value === null || $value === '') {
            return 0;
        }

        if (is_int($value)) {
            return max(0, $value);
        }

        if (is_float($value)) {
            return max(0, (int) round($value * 100));
        }

        $num = (float) $value;
        if (! is_finite($num)) {
            return 0;
        }

        return max(0, (int) round($num * 100));
    }
}

