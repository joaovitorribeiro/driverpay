import DriverLayout from '@/Layouts/DriverLayout';
import Pagination from '@/Components/Pagination';
import { formatMoneyFromCents } from '@/Pages/Costs/Partials/formatMoney';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function formatDateTimePt(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const d = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
    const t = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
    return `${d}, ${t}`;
}

function formatMonthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function addMonths(monthKey, delta) {
    const base = new Date(`${monthKey}-01T00:00:00`);
    const d = new Date(base.getTime());
    d.setMonth(d.getMonth() + delta);
    return formatMonthKey(d);
}

function Chip({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                (active
                    ? 'border-white/25 bg-white/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white') +
                ' inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-semibold'
            }
        >
            {children}
        </button>
    );
}

function periodSubtitle(period) {
    if (period === 'month') {
        return 'Mensal (Pro)';
    }
    if (period === 'year') {
        return 'Anual (Pro)';
    }
    if (period === 'range') {
        return 'Período (Pro)';
    }
    if (period === 'all') {
        return 'Histórico (Pro) • até 1000 registros';
    }
    return 'Últimos 7 dias (Free)';
}

function StatCard({ title, subtitle, value }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-[#0b1424]/55 p-6 shadow-lg shadow-black/25 backdrop-blur">
            <div className="text-sm font-semibold text-white/70">{title}</div>
            {subtitle ? (
                <div className="mt-1 text-xs font-semibold text-white/45">
                    {subtitle}
                </div>
            ) : null}
            <div className="mt-3 text-2xl font-extrabold tracking-tight text-white">
                {value}
            </div>
        </div>
    );
}

function ArrowButton({ disabled, onClick, children }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={
                (disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-white/10') +
                ' inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white'
            }
        >
            {children}
        </button>
    );
}

export default function Index({ day_records, costs, filters, entitlements, summary, report }) {
    const period = filters?.period ?? '7d';
    const isPro = !!entitlements?.is_pro;
    const items = costs?.data ?? [];
    const dayRecords = Array.isArray(day_records) ? day_records : [];
    const month = filters?.month ?? formatMonthKey(new Date());
    const year = filters?.year ?? String(new Date().getFullYear());
    const isReport =
        isPro && (period === '7d' || period === 'month' || period === 'year' || period === 'range');
    const nowMonth = formatMonthKey(new Date());
    const nowYear = String(new Date().getFullYear());
    const [exportOpen, setExportOpen] = useState(false);
    const [rangeOpen, setRangeOpen] = useState(false);
    const [rangeFrom, setRangeFrom] = useState(filters?.from ?? '');
    const [rangeTo, setRangeTo] = useState(filters?.to ?? '');

    const setPeriod = (nextPeriod, extra = {}) => {
        if (!isPro && nextPeriod !== '7d') {
            router.get(route('pro'));
            return;
        }

        setRangeOpen(false);
        setExportOpen(false);
        router.get(
            route('costs.index'),
            { period: nextPeriod, ...extra },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const exportReport = (format) => {
        if (!isPro) {
            router.get(route('pro'));
            return;
        }

        const params =
            period === 'month'
                ? { period: 'month', month }
                : period === 'year'
                  ? { period: 'year', year }
                  : period === 'range'
                    ? { period: 'range', from: rangeFrom, to: rangeTo }
                    : { period: '7d' };

        const url = route('costs.export', {
            ...params,
            format,
        });

        setExportOpen(false);
        setRangeOpen(false);

        if (format === 'pdf') {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        window.location.href = url;
    };

    const fixedSubtitle =
        period === 'year'
            ? 'Soma de 12 meses'
            : period === 'month'
              ? 'Total do mês'
              : period === '7d'
                ? 'Pró-rata (7 dias)'
                : 'Pró-rata (período)';

    const applyRange = () => {
        if (!isPro) {
            router.get(route('pro'));
            return;
        }

        if (!rangeFrom || !rangeTo) return;

        setPeriod('range', { from: rangeFrom, to: rangeTo, page: 1 });
    };

    return (
        <DriverLayout>
            <Head title="Histórico" />

            <div className="px-4 pb-12 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-[44px] font-bold leading-[1.05] tracking-tight text-white">
                                {isReport ? (
                                    <>
                                        <span className="text-emerald-400">
                                            Driver
                                        </span>{' '}
                                        <span className="text-white">Pay</span>
                                    </>
                                ) : (
                                    'Histórico'
                                )}
                            </h1>
                            <div className="mt-3 text-base font-medium text-slate-400">
                                {isReport && report?.generated_at ? (
                                    <>
                                        {report?.period_label ?? ''} • gerado em{' '}
                                        {formatDateTimePt(report.generated_at)}
                                    </>
                                ) : isPro ? (
                                    periodSubtitle(period)
                                ) : (
                                    'Últimos 7 dias (Free)'
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-7 text-sm font-semibold text-slate-200">
                            {isPro ? (
                                <>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            className="hover:text-white"
                                            onClick={() =>
                                                setExportOpen((v) => !v)
                                            }
                                        >
                                            Exportar
                                        </button>
                                        {exportOpen ? (
                                            <div className="absolute right-0 top-7 z-20 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1424] shadow-2xl shadow-black/45">
                                                <button
                                                    type="button"
                                                    onClick={() => exportReport('csv')}
                                                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white/90 hover:bg-white/5"
                                                >
                                                    CSV
                                                    <span className="text-xs font-bold text-white/50">
                                                        .csv
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exportReport('pdf')}
                                                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white/90 hover:bg-white/5"
                                                >
                                                    PDF
                                                    <span className="text-xs font-bold text-white/50">
                                                        .pdf
                                                    </span>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('pro')}
                                        className="hover:text-white"
                                    >
                                        Exportar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Chip
                            active={period === '7d'}
                            onClick={() =>
                                router.get(
                                    route('costs.index'),
                                    { period: '7d' },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                        replace: true,
                                    },
                                )
                            }
                        >
                            Últimos 7 dias
                        </Chip>
                        <Chip
                            active={isPro && period === 'month'}
                            onClick={() => setPeriod('month', { month })}
                        >
                            Mensal
                        </Chip>
                        <Chip
                            active={isPro && period === 'year'}
                            onClick={() => setPeriod('year', { year })}
                        >
                            Anual
                        </Chip>
                        <Chip
                            active={isPro && period === 'range'}
                            onClick={() => {
                                if (!isPro) {
                                    router.get(route('pro'));
                                    return;
                                }
                                setExportOpen(false);
                                setRangeOpen((v) => !v);
                                if (!rangeFrom || !rangeTo) {
                                    const today = new Date();
                                    const to = today.toISOString().slice(0, 10);
                                    const fromDate = new Date(today.getTime());
                                    fromDate.setDate(fromDate.getDate() - 29);
                                    const from = fromDate.toISOString().slice(0, 10);
                                    setRangeFrom(from);
                                    setRangeTo(to);
                                }
                            }}
                        >
                            Tudo
                        </Chip>
                    </div>

                    {isPro && rangeOpen ? (
                        <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0b1424]/55 p-5 shadow-lg shadow-black/25 backdrop-blur">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <div className="text-xs font-semibold tracking-widest text-white/55">
                                        DATA INICIAL
                                    </div>
                                    <input
                                        type="date"
                                        value={rangeFrom}
                                        onChange={(e) =>
                                            setRangeFrom(e.target.value)
                                        }
                                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#0a1020]/60 px-4 text-sm font-semibold text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold tracking-widest text-white/55">
                                        DATA FINAL
                                    </div>
                                    <input
                                        type="date"
                                        value={rangeTo}
                                        onChange={(e) =>
                                            setRangeTo(e.target.value)
                                        }
                                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#0a1020]/60 px-4 text-sm font-semibold text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRangeOpen(false)}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-extrabold text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={applyRange}
                                    disabled={!rangeFrom || !rangeTo}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Buscar
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {!isPro ? (
                        <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/70 p-6 shadow-xl shadow-black/35 backdrop-blur">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <div className="text-lg font-bold tracking-tight text-white">
                                        Desbloqueie relatórios Pro
                                    </div>
                                    <div className="mt-2 text-sm leading-relaxed text-slate-400">
                                        No Free você vê apenas os últimos 7
                                        dias. No Pro você vê histórico completo,
                                        mensal e exportação para Contadores.
                                    </div>
                                </div>
                                <Link
                                    href={route('pro')}
                                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
                                >
                                    Ver Pro
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    {isReport ? (
                        <>
                            <div className="mt-8 flex items-center justify-between gap-4">
                                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90">
                                    Relatório Pro
                                </div>

                                <div className="flex items-center gap-2">
                                    {period === 'month' ? (
                                        <>
                                            <ArrowButton
                                                onClick={() =>
                                                    setPeriod('month', {
                                                        month: addMonths(month, -1),
                                                    })
                                                }
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="M15 18l-6-6 6-6" />
                                                </svg>
                                            </ArrowButton>
                                            <div className="text-sm font-semibold text-white/80">
                                                {report?.period_label ?? ''}
                                            </div>
                                            <ArrowButton
                                                disabled={addMonths(month, 1) > nowMonth}
                                                onClick={() =>
                                                    setPeriod('month', {
                                                        month: addMonths(month, 1),
                                                    })
                                                }
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </ArrowButton>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowButton
                                                onClick={() =>
                                                    setPeriod('year', {
                                                        year: String(Number(year) - 1),
                                                    })
                                                }
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="M15 18l-6-6 6-6" />
                                                </svg>
                                            </ArrowButton>
                                            <div className="text-sm font-semibold text-white/80">
                                                {report?.period_label ?? year}
                                            </div>
                                            <ArrowButton
                                                disabled={String(Number(year) + 1) > nowYear}
                                                onClick={() =>
                                                    setPeriod('year', {
                                                        year: String(Number(year) + 1),
                                                    })
                                                }
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </ArrowButton>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <StatCard
                                    title="Lucro líquido"
                                    value={formatMoneyFromCents(
                                        report?.totals?.net_cents ?? 0,
                                    )}
                                />
                                <StatCard
                                    title="Ganhos"
                                    value={formatMoneyFromCents(
                                        report?.totals?.gains_cents ?? 0,
                                    )}
                                />
                                <StatCard
                                    title="Combustível"
                                    value={formatMoneyFromCents(
                                        report?.totals?.fuel_cents ?? 0,
                                    )}
                                />
                                <StatCard
                                    title="Despesas variáveis"
                                    value={formatMoneyFromCents(
                                        report?.totals?.expenses_cents ?? 0,
                                    )}
                                />
                                <StatCard
                                    title="Fixos (estim.)"
                                    subtitle={fixedSubtitle}
                                    value={formatMoneyFromCents(
                                        report?.totals?.fixed_cents ?? 0,
                                    )}
                                />
                                <StatCard
                                    title="Km"
                                    subtitle="Vem do registro do dia"
                                    value={
                                        (report?.totals?.km ?? 0) > 0
                                            ? report?.totals?.km
                                            : '—'
                                    }
                                />
                                <StatCard
                                    title="Registros"
                                    value={report?.totals?.records ?? 0}
                                />
                            </div>

                            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] text-left text-sm">
                                        <thead className="text-xs font-extrabold tracking-widest text-white/55">
                                            <tr>
                                                <th className="py-3 pr-4">
                                                    {report?.type === 'year'
                                                        ? 'Mês'
                                                        : 'Dia'}
                                                </th>
                                                <th className="py-3 pr-4">
                                                    Registros
                                                </th>
                                                <th className="py-3 pr-4">
                                                    Ganhos
                                                </th>
                                                <th className="py-3 pr-4">Km</th>
                                                <th className="py-3 pr-4">
                                                    Combustível
                                                </th>
                                                <th className="py-3">
                                                    Despesas
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {(report?.rows ?? []).length ? (
                                                report.rows.map((row) => (
                                                    <tr
                                                        key={row.key}
                                                        className="text-white/85"
                                                    >
                                                        <td className="py-4 pr-4 font-semibold text-white">
                                                            {row.label}
                                                        </td>
                                                        <td className="py-4 pr-4">
                                                            {row.records}
                                                        </td>
                                                        <td className="py-4 pr-4">
                                                            {formatMoneyFromCents(
                                                                row.gains_cents ?? 0,
                                                            )}
                                                        </td>
                                                        <td className="py-4 pr-4">
                                                            {row.km ?? 0}
                                                        </td>
                                                        <td className="py-4 pr-4">
                                                            {formatMoneyFromCents(
                                                                row.fuel_cents ?? 0,
                                                            )}
                                                        </td>
                                                        <td className="py-4 font-semibold text-white">
                                                            {formatMoneyFromCents(
                                                                row.expenses_cents ?? 0,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="py-8 text-base text-white/55"
                                                    >
                                                        Sem dados no período.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t border-white/10">
                                                <td className="py-4 pr-4 font-extrabold text-white">
                                                    Total
                                                </td>
                                                <td className="py-4 pr-4 font-bold text-white">
                                                    {report?.totals?.records ?? 0}
                                                </td>
                                                <td className="py-4 pr-4 font-bold text-white">
                                                    {formatMoneyFromCents(
                                                        report?.totals?.gains_cents ?? 0,
                                                    )}
                                                </td>
                                                <td className="py-4 pr-4 font-bold text-white">
                                                    {report?.totals?.km ?? 0}
                                                </td>
                                                <td className="py-4 pr-4 font-bold text-white">
                                                    {formatMoneyFromCents(
                                                        report?.totals?.fuel_cents ?? 0,
                                                    )}
                                                </td>
                                                <td className="py-4 font-extrabold text-white">
                                                    {formatMoneyFromCents(
                                                        report?.totals?.expenses_cents ?? 0,
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0b1424]/55 p-6 shadow-xl shadow-black/35 backdrop-blur">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-2xl font-bold tracking-tight text-white">
                                        Registros do dia
                                    </div>
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/90 hover:bg-white/10"
                                    >
                                        Abrir hoje
                                    </Link>
                                </div>

                                {dayRecords.length ? (
                                    <div className="mt-5 space-y-3">
                                        {dayRecords.map((r) => (
                                            <div
                                                key={r.id}
                                                className="rounded-[22px] border border-white/10 bg-[#0b1424]/40 p-5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-xs font-semibold tracking-widest text-slate-500">
                                                            {r.date}
                                                        </div>
                                                        <div className="mt-2 grid gap-1 text-sm text-white/85">
                                                            <div>
                                                                Ganhos:{' '}
                                                                <span className="font-semibold text-white">
                                                                    {formatMoneyFromCents(
                                                                        r.gains_cents ?? 0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                Km:{' '}
                                                                <span className="font-semibold text-white">
                                                                    {r.km ?? 0}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                Despesas:{' '}
                                                                <span className="font-semibold text-white">
                                                                    {formatMoneyFromCents(
                                                                        r.expenses_cents ?? 0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-semibold tracking-widest text-slate-500">
                                                            Itens
                                                        </div>
                                                        <div className="mt-2 text-base font-bold text-white">
                                                            {(r.expenses ?? []).length}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-5 text-base text-slate-400">
                                        Nenhum registro salvo no período.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-2xl font-bold tracking-tight text-white">
                                        Resumo
                                    </div>
                                    <div className="text-base font-bold text-white">
                                        {formatMoneyFromCents(
                                            summary?.total_cents ?? 0,
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="text-slate-400">
                                            Melhor dia
                                        </div>
                                        <div className="font-semibold text-emerald-300">
                                            {summary?.best_day
                                                ? formatMoneyFromCents(
                                                      summary.best_day.total_cents,
                                                  )
                                                : formatMoneyFromCents(0)}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-slate-400">
                                            Pior dia
                                        </div>
                                        <div className="font-semibold text-slate-200">
                                            {summary?.worst_day &&
                                            summary.worst_day.total_cents > 0
                                                ? formatMoneyFromCents(
                                                      summary.worst_day.total_cents,
                                                  )
                                                : 'Sem prejuízo'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                {items.length ? (
                                    <div className="space-y-3">
                                        {items.map((cost) => (
                                            <div
                                                key={cost.id}
                                                className="rounded-[22px] border border-white/10 bg-[#0b1424]/50 p-5 shadow-lg shadow-black/25"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="text-xs font-semibold tracking-widest text-slate-500">
                                                            {cost.date}
                                                        </div>
                                                        <div className="mt-2 text-base font-semibold text-white">
                                                            {cost.description}
                                                        </div>
                                                        {cost.notes ? (
                                                            <div className="mt-2 text-sm text-slate-400">
                                                                {cost.notes}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-sm font-bold text-white">
                                                        {formatMoneyFromCents(
                                                            cost.amount_cents,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-base text-slate-500">
                                        {costs
                                            ? 'Nenhum registro no período.'
                                            : 'Carregando...'}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-between">
                                <div className="w-full">
                                    <Pagination paginator={costs} variant="dark" maxPages={50} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DriverLayout>
    );
}
