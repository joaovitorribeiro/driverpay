import DriverLayout from '@/Layouts/DriverLayout';
import { formatMoneyFromCents } from '@/Pages/Costs/Partials/formatMoney';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

function formatCurrency(value) {
    const number = Number(value ?? 0);
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(number) ? number : 0);
}

function formatNumber(value) {
    const number = Number(value ?? 0);
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(Number.isFinite(number) ? number : 0);
}

function StatCard({ title, value, subtitle }) {
    return (
        <div className="rounded-[26px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
            <div className="text-xs font-semibold tracking-widest text-slate-400">
                {title}
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-white">
                {value}
            </div>
            {subtitle ? (
                <div className="mt-3 text-sm text-slate-500">{subtitle}</div>
            ) : null}
        </div>
    );
}

export default function DriverDashboard({ metrics, latest, driver_settings }) {
    const todayLabel = useMemo(() => {
        const date = new Date();
        const weekday = new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
        }).format(date);
        const rest = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
        }).format(date);
        return `${weekday}, ${rest}`;
    }, []);
    const billing = usePage().props.billing;

    return (
        <DriverLayout>
            <Head title="Hoje" />

            <div className="px-4 pb-12 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-[44px] font-bold leading-[1.05] tracking-tight text-white">
                                Hoje
                            </h1>
                            <div className="mt-3 text-base font-medium text-slate-400">
                                {todayLabel}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-8 text-sm font-semibold text-slate-200">
                            <Link
                                href={route('costs.index')}
                                className="hover:text-white"
                            >
                                Histórico
                            </Link>
                            <Link
                                href={route('settings')}
                                className="hover:text-white"
                            >
                                Ajustes
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-4">
                        <StatCard
                            title="Gastos hoje"
                            value={formatMoneyFromCents(
                                metrics?.today_total_cents ?? 0,
                            )}
                            subtitle="Somatório das despesas lançadas hoje"
                        />
                        <StatCard
                            title="Gastos do mês"
                            value={formatMoneyFromCents(
                                metrics?.month_total_cents ?? 0,
                            )}
                            subtitle="Somatório desde o início do mês"
                        />
                        <StatCard
                            title="Lançamentos no mês"
                            value={metrics?.month_count ?? 0}
                            subtitle="Quantidade de despesas no mês"
                        />
                        <StatCard
                            title="Plano"
                            value={billing?.is_pro ? 'PRO' : 'GRÁTIS'}
                            subtitle={
                                billing?.is_pro &&
                                typeof billing?.days_remaining === 'number'
                                    ? `Dias restantes: ${billing.days_remaining}`
                                    : 'Acesso conforme seu plano'
                            }
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                        <Link
                            href={route('costs.create')}
                            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-bold text-emerald-950 hover:bg-emerald-400"
                        >
                            + Adicionar despesa
                        </Link>
                        <Link
                            href={route('costs.index')}
                            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
                        >
                            Ver histórico
                        </Link>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Últimos lançamentos
                        </div>
                        <div className="mt-5 space-y-3">
                            {(latest ?? []).length ? (
                                latest.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-[22px] border border-white/10 bg-[#0a1020]/50 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold tracking-widest text-slate-500">
                                                    {item.date}
                                                </div>
                                                <div className="mt-2 text-base font-semibold text-white">
                                                    {item.description}
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-white">
                                                {formatMoneyFromCents(
                                                    item.amount_cents,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-base text-slate-500">
                                    Nenhum lançamento ainda.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Suas configurações
                        </div>

                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-slate-400">
                                    Combustível
                                </div>
                                <div className="font-semibold text-white">
                                    {formatCurrency(
                                        driver_settings?.fuel_price_brl,
                                    )}{' '}
                                    R$/L
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-slate-400">Consumo</div>
                                <div className="font-semibold text-white">
                                    {formatNumber(
                                        driver_settings?.consumption_km_per_l,
                                    )}{' '}
                                    km/L
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-slate-400">
                                    Manutenção
                                </div>
                                <div className="font-semibold text-white">
                                    {formatCurrency(
                                        driver_settings?.maintenance_monthly_brl,
                                    )}{' '}
                                    / mês
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-slate-400">Aluguel</div>
                                <div className="font-semibold text-white">
                                    {formatCurrency(
                                        driver_settings?.rent_monthly_brl,
                                    )}{' '}
                                    / mês
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <Link
                                href={route('settings')}
                                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
                            >
                                Ajustar configurações
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
