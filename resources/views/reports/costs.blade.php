<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{{ $report['title'] ?? 'Relatório' }}</title>
        <style>
            :root {
                --ink: #0f172a;
                --muted: #64748b;
                --card: #ffffff;
                --line: #e2e8f0;
                --bg: #f8fafc;
                --brand: #10b981;
            }
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji",
                    "Segoe UI Emoji";
                color: var(--ink);
                background: var(--bg);
            }
            .wrap {
                max-width: 940px;
                margin: 0 auto;
                padding: 28px 18px 48px;
            }
            .top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 18px;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .logo {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                border: 1px solid var(--line);
                background: #fff;
                padding: 6px;
            }
            h1 {
                margin: 0;
                font-size: 28px;
                letter-spacing: -0.02em;
            }
            .subtitle {
                margin-top: 6px;
                color: var(--muted);
                font-weight: 600;
                font-size: 13px;
            }
            .badge {
                border: 1px solid rgba(16, 185, 129, 0.35);
                background: rgba(16, 185, 129, 0.08);
                color: #065f46;
                padding: 10px 14px;
                border-radius: 999px;
                font-size: 13px;
                font-weight: 800;
                white-space: nowrap;
            }
            .cards {
                margin-top: 18px;
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
            .card {
                background: var(--card);
                border: 1px solid var(--line);
                border-radius: 18px;
                padding: 16px 16px 14px;
            }
            .k {
                font-size: 13px;
                color: var(--muted);
                font-weight: 700;
            }
            .v {
                margin-top: 10px;
                font-size: 22px;
                font-weight: 900;
                letter-spacing: -0.01em;
            }
            .tableCard {
                margin-top: 18px;
                background: var(--card);
                border: 1px solid var(--line);
                border-radius: 18px;
                overflow: hidden;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            thead th {
                text-align: left;
                padding: 14px 16px;
                font-size: 12px;
                color: var(--muted);
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                border-bottom: 1px solid var(--line);
                background: #fbfdff;
            }
            tbody td {
                padding: 13px 16px;
                border-bottom: 1px solid var(--line);
                font-size: 14px;
                color: #0b1220;
            }
            tbody tr:last-child td {
                border-bottom: 0;
            }
            tfoot td {
                padding: 14px 16px;
                font-weight: 900;
                border-top: 1px solid var(--line);
                background: #fbfdff;
            }
            .right {
                text-align: right;
                white-space: nowrap;
            }
            .muted {
                color: var(--muted);
                font-weight: 700;
            }
            @media print {
                body {
                    background: #fff;
                }
                .wrap {
                    padding: 0;
                }
                .badge {
                    color: #065f46;
                }
            }
        </style>
    </head>
    <body>
        @php
            $generatedAt = $report['generated_at'] ?? null;
            $generatedText = '';
            if ($generatedAt) {
                try {
                    $dt = \Carbon\CarbonImmutable::parse($generatedAt)->locale('pt_BR');
                    $generatedText = $dt->translatedFormat('d/m/Y, H:i');
                } catch (\Throwable $e) {
                    $generatedText = '';
                }
            }
            $money = function ($cents) {
                $value = ((int) ($cents ?? 0)) / 100;
                return 'R$ ' . number_format($value, 2, ',', '.');
            };
        @endphp

        <div class="wrap">
            <div class="top">
                <div>
                    <div class="brand">
                        <img class="logo" src="{{ asset('assets/icon.png') }}" alt="Driver Pay" />
                        <div>
                            <h1>
                                <span style="color: var(--brand)">Lucro</span> Motorista App
                            </h1>
                            <div class="subtitle">
                                {{ $period === 'year' ? 'Ano ' : '' }}{{ $report['period_label'] ?? '' }}
                                @if($generatedText)
                                    • gerado em {{ $generatedText }}
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
                <div class="badge">Relatório Pro</div>
            </div>

            <div class="cards">
                <div class="card">
                    <div class="k">Lucro líquido</div>
                    <div class="v">{{ $money($report['totals']['net_cents'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Ganhos</div>
                    <div class="v">{{ $money($report['totals']['gains_cents'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Combustível</div>
                    <div class="v">{{ $money($report['totals']['fuel_cents'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Despesas variáveis</div>
                    <div class="v">{{ $money($report['totals']['expenses_cents'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Fixos (estim.)</div>
                    <div class="v">{{ $money($report['totals']['fixed_cents'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Km</div>
                    <div class="v">{{ (int) ($report['totals']['km'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Registros</div>
                    <div class="v">{{ (int) ($report['totals']['records'] ?? 0) }}</div>
                </div>
                <div class="card">
                    <div class="k">Total despesas</div>
                    <div class="v">{{ $money($report['totals']['expenses_cents'] ?? 0) }}</div>
                </div>
            </div>

            <div class="tableCard">
                <table>
                    <thead>
                        <tr>
                            <th>{{ ($report['type'] ?? '') === 'year' ? 'Mês' : 'Dia' }}</th>
                            <th class="right">Registros</th>
                            <th class="right">Ganhos</th>
                            <th class="right">Km</th>
                            <th class="right">Combustível</th>
                            <th class="right">Despesas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse(($report['rows'] ?? []) as $row)
                            <tr>
                                <td><strong>{{ $row['label'] ?? '' }}</strong></td>
                                <td class="right">{{ (int) ($row['records'] ?? 0) }}</td>
                                <td class="right">{{ $money($row['gains_cents'] ?? 0) }}</td>
                                <td class="right">{{ (int) ($row['km'] ?? 0) }}</td>
                                <td class="right">{{ $money($row['fuel_cents'] ?? 0) }}</td>
                                <td class="right"><strong>{{ $money($row['expenses_cents'] ?? 0) }}</strong></td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="muted">Sem dados no período.</td>
                            </tr>
                        @endforelse
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total</td>
                            <td class="right">{{ (int) ($report['totals']['records'] ?? 0) }}</td>
                            <td class="right">{{ $money($report['totals']['gains_cents'] ?? 0) }}</td>
                            <td class="right">{{ (int) ($report['totals']['km'] ?? 0) }}</td>
                            <td class="right">{{ $money($report['totals']['fuel_cents'] ?? 0) }}</td>
                            <td class="right">{{ $money($report['totals']['expenses_cents'] ?? 0) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <script>
            window.addEventListener('load', () => {
                window.print();
            });
        </script>
    </body>
</html>
