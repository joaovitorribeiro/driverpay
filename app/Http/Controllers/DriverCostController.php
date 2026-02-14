<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDriverCostRequest;
use App\Http\Requests\UpdateDriverCostRequest;
use App\Models\DriverCost;
use App\Models\DriverDayRecord;
use App\Support\Roles;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class DriverCostController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DriverCost::class);

        $user = $request->user();
        $isPro = $user ? $user->isProAccess() : false;
        $settings = $user?->driverSetting;

        $query = DriverCost::query()
            ->with('user:id,name,email')
            ->orderByDesc('date')
            ->orderByDesc('id');

        $period = $request->query('period');
        $resolvedPeriod = in_array($period, ['7d', 'all', 'month', 'year', 'range'], true) ? $period : null;
        $monthParam = is_string($request->query('month')) ? $request->query('month') : null;
        $yearParam = is_string($request->query('year')) ? $request->query('year') : null;
        $fromParam = is_string($request->query('from')) ? $request->query('from') : null;
        $toParam = is_string($request->query('to')) ? $request->query('to') : null;
        $report = null;

        if (! $isPro && $resolvedPeriod && $resolvedPeriod !== '7d') {
            $resolvedPeriod = '7d';
        }

        if ($user && $user->hasRole(Roles::DRIVER)) {
            $query->where('user_id', $user->id);

            if (! $resolvedPeriod) {
                $resolvedPeriod = '7d';
            }
        }

        $month = $this->resolveMonth($monthParam);
        $year = $this->resolveYear($yearParam);
        [$fromDate, $toDate] = $this->resolveRange($fromParam, $toParam);
        $dayFrom = null;
        $dayTo = null;

        if ($resolvedPeriod === '7d') {
            $from = CarbonImmutable::now()->subDays(6)->startOfDay()->toDateString();
            $query->whereDate('date', '>=', $from);
            $dayFrom = $from;
        } elseif ($resolvedPeriod === 'month') {
            $from = $month->startOfMonth()->toDateString();
            $to = $month->endOfMonth()->toDateString();
            $query->whereDate('date', '>=', $from)->whereDate('date', '<=', $to);
            $dayFrom = $from;
            $dayTo = $to;
        } elseif ($resolvedPeriod === 'year') {
            $from = $year->startOfYear()->toDateString();
            $to = $year->endOfYear()->toDateString();
            $query->whereDate('date', '>=', $from)->whereDate('date', '<=', $to);
            $dayFrom = $from;
            $dayTo = $to;
        } elseif ($resolvedPeriod === 'all') {
            if ($user && $user->hasRole(Roles::DRIVER)) {
                $query->limit(1000);
            }
        } elseif ($resolvedPeriod === 'range') {
            $from = $fromDate->toDateString();
            $to = $toDate->toDateString();
            $query->whereDate('date', '>=', $from)->whereDate('date', '<=', $to);
            $dayFrom = $from;
            $dayTo = $to;
        }

        $summaryQuery = (clone $query)->reorder();
        $totalCents = (int) (clone $summaryQuery)->sum('amount_cents');

        $daily = (clone $summaryQuery)
            ->selectRaw('date, sum(amount_cents) as total_cents')
            ->groupBy('date');

        $bestDay = (clone $daily)->orderBy('total_cents')->first();
        $worstDay = (clone $daily)->orderByDesc('total_cents')->first();

        $bestDate = $bestDay?->date;
        $worstDate = $worstDay?->date;

        if ($isPro && in_array($resolvedPeriod, ['7d', 'month', 'year', 'range'], true)) {
            if ($resolvedPeriod === 'month' || $resolvedPeriod === 'year') {
                $report = $this->buildReport(
                    query: $summaryQuery,
                    period: $resolvedPeriod,
                    month: $month,
                    year: $year,
                    settings: $settings,
                );
            } elseif ($resolvedPeriod === '7d') {
                $to = CarbonImmutable::now()->startOfDay();
                $from = $to->subDays(6)->startOfDay();
                $report = $this->buildRangeReport(
                    query: $summaryQuery,
                    from: $from,
                    to: $to,
                    settings: $settings,
                    periodLabel: 'Últimos 7 dias',
                );
            } else {
                $label = $fromDate->format('d/m/Y') . ' a ' . $toDate->format('d/m/Y');
                $report = $this->buildRangeReport(
                    query: $summaryQuery,
                    from: $fromDate,
                    to: $toDate,
                    settings: $settings,
                    periodLabel: $label,
                );
            }
        }

        $costs = $query
            ->paginate(20)
            ->appends($request->query())
            ->through(fn (DriverCost $cost) => [
                'id' => $cost->id,
                'date' => $cost->date?->format('Y-m-d'),
                'description' => $cost->description,
                'amount_cents' => $cost->amount_cents,
                'notes' => $cost->notes,
                'user' => $cost->relationLoaded('user') && $cost->user ? [
                    'id' => $cost->user->id,
                    'name' => $cost->user->name,
                    'email' => $cost->user->email,
                ] : null,
                'can' => [
                    'update' => $request->user()?->can('update', $cost) ?? false,
                    'delete' => $request->user()?->can('delete', $cost) ?? false,
                ],
            ]);

        $dayRecords = [];
        if ($user && $user->hasRole(Roles::DRIVER)) {
            $dayQuery = DriverDayRecord::query()
                ->where('user_id', $user->id)
                ->orderByDesc('date')
                ->orderByDesc('id');

            if (is_string($dayFrom)) {
                $dayQuery->whereDate('date', '>=', $dayFrom);
            }
            if (is_string($dayTo)) {
                $dayQuery->whereDate('date', '<=', $dayTo);
            }

            $limit = $resolvedPeriod === 'all' ? 1000 : 90;
            $dayRecords = $dayQuery
                ->limit($limit)
                ->get()
                ->map(function (DriverDayRecord $record) {
                    $expensesCents = 0;
                    foreach ($record->expenses ?? [] as $item) {
                        $expensesCents += (int) ($item['amount_cents'] ?? 0);
                    }

                    return [
                        'id' => $record->id,
                        'date' => $record->date?->format('Y-m-d'),
                        'gains_cents' => (int) $record->gains_cents,
                        'km' => (float) ($record->km ?? 0),
                        'expenses_cents' => $expensesCents,
                        'expenses' => $record->expenses ?? [],
                    ];
                })
                ->all();
        }

        return Inertia::render($this->page('Index', $request), [
            'day_records' => $dayRecords,
            'costs' => $costs,
            'filters' => [
                'period' => $resolvedPeriod,
                'month' => $month->format('Y-m'),
                'year' => $year->format('Y'),
                'from' => $fromDate->toDateString(),
                'to' => $toDate->toDateString(),
            ],
            'entitlements' => [
                'is_pro' => $isPro,
            ],
            'summary' => [
                'total_cents' => $totalCents,
                'best_day' => $bestDate ? [
                    'date' => is_string($bestDate) ? $bestDate : $bestDate->format('Y-m-d'),
                    'total_cents' => (int) $bestDay->total_cents,
                ] : null,
                'worst_day' => $worstDate ? [
                    'date' => is_string($worstDate) ? $worstDate : $worstDate->format('Y-m-d'),
                    'total_cents' => (int) $worstDay->total_cents,
                ] : null,
            ],
            'report' => $report,
        ]);
    }

    public function export(Request $request): StreamedResponse|SymfonyResponse
    {
        $this->authorize('viewAny', DriverCost::class);

        $user = $request->user();
        if (! $user || ! $user->isProAccess()) {
            abort(403);
        }

        $format = $request->query('format', 'csv');
        $resolvedFormat = in_array($format, ['csv', 'pdf'], true) ? $format : 'csv';

        $period = $request->query('period');
        $resolvedPeriod = in_array($period, ['7d', 'month', 'year', 'range'], true) ? $period : null;
        if (! $resolvedPeriod) {
            abort(422);
        }

        $settings = $user->driverSetting;
        $month = $this->resolveMonth(is_string($request->query('month')) ? $request->query('month') : null);
        $year = $this->resolveYear(is_string($request->query('year')) ? $request->query('year') : null);
        [$fromDate, $toDate] = $this->resolveRange(
            is_string($request->query('from')) ? $request->query('from') : null,
            is_string($request->query('to')) ? $request->query('to') : null,
        );

        $query = DriverCost::query()
            ->when($user->hasRole(Roles::DRIVER), fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('date');

        if ($resolvedPeriod === 'month') {
            $from = $month->startOfMonth()->toDateString();
            $to = $month->endOfMonth()->toDateString();
            $query->whereDate('date', '>=', $from)->whereDate('date', '<=', $to);

            $report = $this->buildReport(
                query: $query->reorder(),
                period: 'month',
                month: $month,
                year: $year,
                settings: $settings,
            );
        } elseif ($resolvedPeriod === 'year') {
            $from = $year->startOfYear()->toDateString();
            $to = $year->endOfYear()->toDateString();
            $query->whereDate('date', '>=', $from)->whereDate('date', '<=', $to);

            $report = $this->buildReport(
                query: $query->reorder(),
                period: 'year',
                month: $month,
                year: $year,
                settings: $settings,
            );
        } elseif ($resolvedPeriod === '7d') {
            $toDate = CarbonImmutable::now()->startOfDay();
            $fromDate = $toDate->subDays(6)->startOfDay();
            $query->whereDate('date', '>=', $fromDate->toDateString())->whereDate('date', '<=', $toDate->toDateString());

            $report = $this->buildRangeReport(
                query: $query->reorder(),
                from: $fromDate,
                to: $toDate,
                settings: $settings,
                periodLabel: 'Últimos 7 dias',
            );
        } else {
            $query->whereDate('date', '>=', $fromDate->toDateString())->whereDate('date', '<=', $toDate->toDateString());

            $label = $fromDate->format('d/m/Y') . ' a ' . $toDate->format('d/m/Y');
            $report = $this->buildRangeReport(
                query: $query->reorder(),
                from: $fromDate,
                to: $toDate,
                settings: $settings,
                periodLabel: $label,
            );
        }

        if ($resolvedFormat === 'pdf') {
            $filename = $resolvedPeriod === 'month'
                ? 'driverpay-mensal-' . $month->format('Y-m') . '.pdf'
                : ($resolvedPeriod === 'year'
                    ? 'driverpay-anual-' . $year->format('Y') . '.pdf'
                    : ($resolvedPeriod === '7d'
                        ? 'driverpay-ultimos-7-dias.pdf'
                        : 'driverpay-periodo-' . $fromDate->format('Y-m-d') . '-' . $toDate->format('Y-m-d') . '.pdf'));

            return response()
                ->view('reports.costs', [
                    'report' => $report,
                    'filename' => $filename,
                    'period' => $resolvedPeriod,
                ], 200)
                ->header('Content-Type', 'text/html; charset=UTF-8');
        }

        $filename = $resolvedPeriod === 'month'
            ? 'driverpay-mensal-' . $month->format('Y-m') . '.csv'
            : ($resolvedPeriod === 'year'
                ? 'driverpay-anual-' . $year->format('Y') . '.csv'
                : ($resolvedPeriod === '7d'
                    ? 'driverpay-ultimos-7-dias.csv'
                    : 'driverpay-periodo-' . $fromDate->format('Y-m-d') . '-' . $toDate->format('Y-m-d') . '.csv'));

        return response()->streamDownload(function () use ($report) {
            $out = fopen('php://output', 'w');

            if (! $out) {
                return;
            }

            $type = $report['type'] ?? null;
            $rows = $report['rows'] ?? [];
            $totals = $report['totals'] ?? [];
            $recordsTotal = (int) ($totals['records'] ?? 0);
            $gainsTotalCents = (int) ($totals['gains_cents'] ?? 0);
            $fuelTotalCents = (int) ($totals['fuel_cents'] ?? 0);
            $expensesTotalCents = (int) ($totals['expenses_cents'] ?? 0);
            $fixedTotalCents = (int) ($totals['fixed_cents'] ?? 0);
            $totalCostsCents = $fuelTotalCents + $expensesTotalCents + $fixedTotalCents;

            if ($type === 'year') {
                fputcsv($out, ['Mês', 'Registros', 'Ganhos', 'Km', 'Combustível', 'Despesas']);
            } else {
                fputcsv($out, ['Dia', 'Registros', 'Ganhos', 'Km', 'Combustível', 'Despesas']);
            }

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row['label'] ?? '',
                    $row['records'] ?? 0,
                    $this->formatBrlFromCents((int) ($row['gains_cents'] ?? 0)),
                    $row['km'] ?? 0,
                    $this->formatBrlFromCents((int) ($row['fuel_cents'] ?? 0)),
                    $this->formatBrlFromCents((int) ($row['expenses_cents'] ?? 0)),
                ]);
            }

            fputcsv($out, []);
            fputcsv($out, ['Total registros', $recordsTotal, $this->formatBrlFromCents($gainsTotalCents), '', '', '']);
            fputcsv($out, ['Total combustível', '', '', '', '', $this->formatBrlFromCents($fuelTotalCents)]);
            fputcsv($out, ['Total despesas', '', '', '', '', $this->formatBrlFromCents($expensesTotalCents)]);
            fputcsv($out, ['Fixos (estim.)', '', '', '', '', $this->formatBrlFromCents($fixedTotalCents)]);
            fputcsv($out, ['Total custos (estim.)', '', '', '', '', $this->formatBrlFromCents($totalCostsCents)]);

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', DriverCost::class);

        return Inertia::render($this->page('Create', $request), []);
    }

    public function store(StoreDriverCostRequest $request): RedirectResponse
    {
        $user = $request->user();

        DriverCost::create([
            'user_id' => $user->id,
            'date' => $request->validated('date'),
            'description' => $request->validated('description'),
            'amount_cents' => $request->validated('amount_cents'),
            'notes' => $request->validated('notes'),
        ]);

        return redirect()->route('costs.index');
    }

    public function edit(Request $request, DriverCost $cost): Response
    {
        $this->authorize('update', $cost);

        return Inertia::render($this->page('Edit', $request), [
            'cost' => [
                'id' => $cost->id,
                'date' => $cost->date?->format('Y-m-d'),
                'description' => $cost->description,
                'amount_cents' => $cost->amount_cents,
                'notes' => $cost->notes,
            ],
        ]);
    }

    public function update(UpdateDriverCostRequest $request, DriverCost $cost): RedirectResponse
    {
        $cost->update($request->validated());

        return redirect()->route('costs.index');
    }

    public function destroy(Request $request, DriverCost $cost): RedirectResponse
    {
        $this->authorize('delete', $cost);

        $cost->delete();

        return redirect()->route('costs.index');
    }

    private function page(string $suffix, Request $request): string
    {
        $user = $request->user();

        if ($user && $user->hasRole(Roles::MASTER)) {
            return "Costs/Master/{$suffix}";
        }

        if ($user && $user->hasRole(Roles::ADMIN)) {
            return "Costs/Admin/{$suffix}";
        }

        return "Costs/Driver/{$suffix}";
    }

    private function resolveMonth(?string $month): CarbonImmutable
    {
        $candidate = is_string($month) && preg_match('/^\d{4}-\d{2}$/', $month) ? $month : null;
        if (! $candidate) {
            return CarbonImmutable::now()->startOfMonth();
        }

        try {
            return CarbonImmutable::createFromFormat('Y-m', $candidate)->startOfMonth();
        } catch (\Throwable) {
            return CarbonImmutable::now()->startOfMonth();
        }
    }

    private function resolveYear(?string $year): CarbonImmutable
    {
        $candidate = is_string($year) && preg_match('/^\d{4}$/', $year) ? (int) $year : null;
        $current = (int) CarbonImmutable::now()->format('Y');

        if (! $candidate || $candidate < 2000 || $candidate > $current + 1) {
            $candidate = $current;
        }

        return CarbonImmutable::create($candidate, 1, 1)->startOfYear();
    }

    private function resolveRange(?string $from, ?string $to): array
    {
        $defaultTo = CarbonImmutable::now()->startOfDay();
        $defaultFrom = $defaultTo->subDays(29)->startOfDay();

        $fromDate = $this->resolveDate($from) ?? $defaultFrom;
        $toDate = $this->resolveDate($to) ?? $defaultTo;

        if ($fromDate->greaterThan($toDate)) {
            [$fromDate, $toDate] = [$toDate, $fromDate];
        }

        return [$fromDate->startOfDay(), $toDate->startOfDay()];
    }

    private function resolveDate(?string $date): ?CarbonImmutable
    {
        $candidate = is_string($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : null;
        if (! $candidate) {
            return null;
        }

        try {
            return CarbonImmutable::createFromFormat('Y-m-d', $candidate)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    private function buildRangeReport($query, CarbonImmutable $from, CarbonImmutable $to, $settings, string $periodLabel): array
    {
        $days = $from->diffInDays($to, false);
        if ($days < 0) {
            [$from, $to] = [$to, $from];
            $days = $from->diffInDays($to, false);
        }

        if ($days > 370) {
            abort(422);
        }

        $generatedAt = CarbonImmutable::now();

        $maintenanceCents = $this->brlToCents($settings?->maintenance_monthly_brl !== null ? (string) $settings->maintenance_monthly_brl : null);
        $rentCents = $this->brlToCents($settings?->rent_monthly_brl !== null ? (string) $settings->rent_monthly_brl : null);
        $extraMonthlyCents = $this->sumMonthlyItemsCents($settings?->extra_monthly_items);
        $fixedMonthlyCents = $maintenanceCents + $rentCents + $extraMonthlyCents;
        $fixedDailyCents = (int) round($fixedMonthlyCents / 30);
        $fixedCents = $fixedDailyCents * ((int) $days + 1);

        $daily = (clone $query)
            ->selectRaw('date, sum(amount_cents) as total_cents, count(*) as total_count')
            ->groupBy('date')
            ->get();

        $map = [];
        foreach ($daily as $row) {
            $dateStr = is_string($row->date) ? $row->date : ($row->date?->format('Y-m-d'));
            if (! $dateStr) {
                continue;
            }
            $map[$dateStr] = [
                'cents' => (int) ($row->total_cents ?? 0),
                'count' => (int) ($row->total_count ?? 0),
            ];
        }

        $rows = [];
        $recordsTotal = 0;
        $expensesTotal = 0;

        for ($i = 0; $i <= $days; $i++) {
            $date = $from->addDays($i);
            $dateKey = $date->format('Y-m-d');
            $agg = $map[$dateKey] ?? ['cents' => 0, 'count' => 0];

            $recordsTotal += $agg['count'];
            $expensesTotal += $agg['cents'];

            $rows[] = [
                'key' => $dateKey,
                'label' => $date->format('d/m'),
                'records' => $agg['count'],
                'gains_cents' => 0,
                'km' => 0,
                'fuel_cents' => 0,
                'expenses_cents' => $agg['cents'],
            ];
        }

        return [
            'type' => 'range',
            'title' => 'Relatório Pro',
            'period_label' => $periodLabel,
            'generated_at' => $generatedAt->toISOString(),
            'rows' => $rows,
            'totals' => [
                'records' => $recordsTotal,
                'gains_cents' => 0,
                'km' => 0,
                'fuel_cents' => 0,
                'expenses_cents' => $expensesTotal,
                'fixed_cents' => $fixedCents,
                'net_cents' => 0,
            ],
        ];
    }

    private function brlToCents(?string $value): int
    {
        if ($value === null) {
            return 0;
        }

        $raw = preg_replace('/[^\d,.\-]/', '', $value);
        if (! is_string($raw) || $raw === '') {
            return 0;
        }

        $negative = str_starts_with($raw, '-');
        $raw = str_replace('-', '', $raw);

        $hasComma = str_contains($raw, ',');
        $hasDot = str_contains($raw, '.');

        if ($hasComma) {
            $raw = str_replace('.', '', $raw);
            $raw = str_replace(',', '.', $raw);
        } elseif ($hasDot) {
            $parts = explode('.', $raw);
            if (count($parts) > 2) {
                $last = array_pop($parts);
                $int = implode('', $parts);
                if (is_string($last) && strlen($last) <= 2) {
                    $raw = $int . '.' . $last;
                } else {
                    $raw = $int . $last;
                }
            }
        }

        $num = (float) $raw;
        if (! is_finite($num)) {
            return 0;
        }

        $cents = (int) round($num * 100);
        $cents = $negative ? -$cents : $cents;
        return $cents;
    }

    private function sumMonthlyItemsCents($items): int
    {
        if (! is_iterable($items)) {
            return 0;
        }

        $total = 0;
        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $amount = $item['amount_brl'] ?? null;
            $total += $this->brlToCents(is_string($amount) ? $amount : null);
        }

        return $total;
    }

    private function formatBrlFromCents(int $cents): string
    {
        $value = $cents / 100;
        return number_format($value, 2, ',', '.');
    }

    private function buildReport($query, string $period, CarbonImmutable $month, CarbonImmutable $year, $settings): array
    {
        $generatedAt = CarbonImmutable::now();

        $maintenanceCents = $this->brlToCents($settings?->maintenance_monthly_brl !== null ? (string) $settings->maintenance_monthly_brl : null);
        $rentCents = $this->brlToCents($settings?->rent_monthly_brl !== null ? (string) $settings->rent_monthly_brl : null);
        $extraMonthlyCents = $this->sumMonthlyItemsCents($settings?->extra_monthly_items);
        $fixedMonthlyCents = $maintenanceCents + $rentCents + $extraMonthlyCents;
        $fixedCents = $period === 'year' ? $fixedMonthlyCents * 12 : $fixedMonthlyCents;

        $daily = (clone $query)
            ->selectRaw('date, sum(amount_cents) as total_cents, count(*) as total_count')
            ->groupBy('date')
            ->get();

        $map = [];
        foreach ($daily as $row) {
            $dateStr = is_string($row->date) ? $row->date : ($row->date?->format('Y-m-d'));
            if (! $dateStr) {
                continue;
            }
            $map[$dateStr] = [
                'cents' => (int) ($row->total_cents ?? 0),
                'count' => (int) ($row->total_count ?? 0),
            ];
        }

        if ($period === 'month') {
            $daysInMonth = (int) $month->daysInMonth;
            $rows = [];
            $recordsTotal = 0;
            $expensesTotal = 0;

            for ($i = 0; $i < $daysInMonth; $i++) {
                $date = $month->addDays($i);
                $dateKey = $date->format('Y-m-d');
                $agg = $map[$dateKey] ?? ['cents' => 0, 'count' => 0];

                $recordsTotal += $agg['count'];
                $expensesTotal += $agg['cents'];

                $rows[] = [
                    'key' => $dateKey,
                    'label' => $date->format('d'),
                    'records' => $agg['count'],
                    'gains_cents' => 0,
                    'km' => 0,
                    'fuel_cents' => 0,
                    'expenses_cents' => $agg['cents'],
                ];
            }

            $monthLabel = $month->locale('pt_BR')->translatedFormat('F Y');

            return [
                'type' => 'month',
                'title' => 'Relatório Pro',
                'period_label' => $monthLabel,
                'generated_at' => $generatedAt->toISOString(),
                'rows' => $rows,
                'totals' => [
                    'records' => $recordsTotal,
                    'gains_cents' => 0,
                    'km' => 0,
                    'fuel_cents' => 0,
                    'expenses_cents' => $expensesTotal,
                    'fixed_cents' => $fixedCents,
                    'net_cents' => 0,
                ],
            ];
        }

        $rows = [];
        $recordsTotal = 0;
        $expensesTotal = 0;

        for ($m = 1; $m <= 12; $m++) {
            $monthKey = sprintf('%04d-%02d', (int) $year->format('Y'), $m);
            $bucketCount = 0;
            $bucketCents = 0;

            foreach ($map as $dateKey => $agg) {
                if (str_starts_with($dateKey, $monthKey)) {
                    $bucketCount += (int) $agg['count'];
                    $bucketCents += (int) $agg['cents'];
                }
            }

            $recordsTotal += $bucketCount;
            $expensesTotal += $bucketCents;

            $label = CarbonImmutable::create((int) $year->format('Y'), $m, 1)
                ->locale('pt_BR')
                ->translatedFormat('M');

            $rows[] = [
                'key' => $monthKey,
                'label' => strtoupper($label),
                'records' => $bucketCount,
                'gains_cents' => 0,
                'km' => 0,
                'fuel_cents' => 0,
                'expenses_cents' => $bucketCents,
            ];
        }

        return [
            'type' => 'year',
            'title' => 'Relatório Pro',
            'period_label' => $year->format('Y'),
            'generated_at' => $generatedAt->toISOString(),
            'rows' => $rows,
            'totals' => [
                'records' => $recordsTotal,
                'gains_cents' => 0,
                'km' => 0,
                'fuel_cents' => 0,
                'expenses_cents' => $expensesTotal,
                'fixed_cents' => $fixedCents,
                'net_cents' => 0,
            ],
        ];
    }
}
