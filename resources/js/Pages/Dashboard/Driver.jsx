import DriverLayout from '@/Layouts/DriverLayout';
import Modal from '@/Components/Modal';
import { formatMoneyFromCents } from '@/Pages/Costs/Partials/formatMoney';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function parseBrlToCents(value) {
    if (!value) return 0;
    const normalized = String(value).replace(/[^\d,.-]/g, '');
    if (!normalized) return 0;
    const withoutThousands = normalized.replace(/\./g, '');
    const dotDecimal = withoutThousands.replace(',', '.');
    const num = Number(dotDecimal);
    if (!Number.isFinite(num)) return 0;
    return Math.round(num * 100);
}

function formatBrlFromCents(cents) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format((Number(cents ?? 0) || 0) / 100);
}

function formatDateLongPt(date) {
    const weekday = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
    }).format(date);
    const rest = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
    }).format(date);
    return `${weekday}, ${rest}`;
}

function formatIsoDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function round1(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 10) / 10;
}

export default function DriverDashboard({ driver_settings }) {
    const today = useMemo(() => new Date(), []);
    const dateKey = useMemo(() => formatIsoDate(today), [today]);
    const todayLabel = useMemo(() => {
        return formatDateLongPt(today);
    }, [today]);

    const [gainsBrl, setGainsBrl] = useState('');
    const [km, setKm] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [isExpensesOpen, setIsExpensesOpen] = useState(false);
    const [savedAt, setSavedAt] = useState(null);

    useEffect(() => {
        const raw = window.localStorage.getItem(`driverpay:day:${dateKey}`);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed?.gains_brl === 'string') setGainsBrl(parsed.gains_brl);
            if (typeof parsed?.km === 'string') setKm(parsed.km);
            if (Array.isArray(parsed?.expenses)) setExpenses(parsed.expenses);
            if (typeof parsed?.saved_at === 'string') setSavedAt(parsed.saved_at);
        } catch {
            return;
        }
    }, [dateKey]);

    const totals = useMemo(() => {
        const gainsCents = parseBrlToCents(gainsBrl);
        const kmNumber = Number(String(km).replace(',', '.'));
        const kmValue = Number.isFinite(kmNumber) ? kmNumber : 0;

        const variableCents = (expenses ?? []).reduce((sum, item) => {
            return sum + parseBrlToCents(item?.amount_brl ?? '');
        }, 0);

        const fuelPriceBrl = Number(String(driver_settings?.fuel_price_brl ?? '0').replace(',', '.'));
        const consumption = Number(String(driver_settings?.consumption_km_per_l ?? '0').replace(',', '.'));
        const maintenanceMonthlyBrl = Number(String(driver_settings?.maintenance_monthly_brl ?? '0').replace(',', '.'));
        const rentMonthlyBrl = Number(String(driver_settings?.rent_monthly_brl ?? '0').replace(',', '.'));

        const fuelCents =
            consumption > 0 && kmValue > 0 && fuelPriceBrl > 0
                ? Math.round(((kmValue / consumption) * fuelPriceBrl) * 100)
                : 0;

        const fixedDailyBrl = (Number.isFinite(maintenanceMonthlyBrl) ? maintenanceMonthlyBrl : 0) / 30
            + (Number.isFinite(rentMonthlyBrl) ? rentMonthlyBrl : 0) / 30;
        const fixedCents = Math.round(fixedDailyBrl * 100);

        const totalCostsCents = variableCents + fuelCents + fixedCents;
        const netCents = gainsCents - totalCostsCents;

        const costPerKmCents = kmValue > 0 ? Math.round(totalCostsCents / kmValue) : 0;
        const profitPerKmCents = kmValue > 0 ? Math.round(netCents / kmValue) : 0;

        return {
            gainsCents,
            kmValue,
            variableCents,
            fuelCents,
            fixedCents,
            totalCostsCents,
            netCents,
            costPerKmCents,
            profitPerKmCents,
        };
    }, [driver_settings, expenses, gainsBrl, km]);

    const save = () => {
        const payload = {
            gains_brl: gainsBrl,
            km: km,
            expenses,
            saved_at: new Date().toISOString(),
        };
        window.localStorage.setItem(`driverpay:day:${dateKey}`, JSON.stringify(payload));
        setSavedAt(payload.saved_at);
    };

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

                    <div className="mt-10 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Registro do dia
                        </div>

                        <div className="mt-6 space-y-6">
                            <div>
                                <div className="text-xs font-semibold tracking-widest text-slate-400">
                                    GANHOS
                                </div>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                                    <input
                                        value={gainsBrl}
                                        onChange={(e) => setGainsBrl(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="0,00"
                                        className="w-full border-0 bg-transparent p-0 text-xl font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                    />
                                    <div className="text-sm font-semibold text-white/60">
                                        R$
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold tracking-widest text-slate-400">
                                    KM RODADOS
                                </div>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                                    <input
                                        value={km}
                                        onChange={(e) => setKm(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="0"
                                        className="w-full border-0 bg-transparent p-0 text-xl font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                    />
                                    <div className="text-sm font-semibold text-white/60">
                                        km
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold tracking-widest text-slate-400">
                                    DESPESAS VARIÁVEIS (OPCIONAL)
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0a1020]/55 px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsExpensesOpen(true)}
                                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                                    >
                                        + Detalhar
                                    </button>
                                    <div className="text-base font-bold text-white">
                                        {formatMoneyFromCents(totals.variableCents)}
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-slate-500">
                                    Pedágio, estacionamento, lavagem, etc.
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={save}
                                className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-[22px] bg-emerald-500 text-lg font-extrabold text-emerald-950 hover:bg-emerald-400"
                            >
                                Salvar Registro
                            </button>

                            {savedAt ? (
                                <div className="text-center text-xs font-semibold text-white/55">
                                    Salvo
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Resumo
                        </div>

                        {!totals.gainsCents && !totals.kmValue ? (
                            <div className="mt-4 text-base text-slate-400">
                                Preencha ganhos e/ou km para ver o resultado.
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400">
                                        Gastos variáveis
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatMoneyFromCents(totals.variableCents)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400">
                                        Combustível (estim.)
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatMoneyFromCents(totals.fuelCents)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400">
                                        Fixos (estim.)
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatMoneyFromCents(totals.fixedCents)}
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-slate-300">
                                            Lucro líquido (estim.)
                                        </div>
                                        <div
                                            className={
                                                (totals.netCents >= 0
                                                    ? 'text-emerald-300'
                                                    : 'text-red-300') +
                                                ' text-base font-extrabold'
                                            }
                                        >
                                            {formatMoneyFromCents(totals.netCents)}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                                        <div>Custo/km</div>
                                        <div className="font-semibold text-white/80">
                                            R$ {formatBrlFromCents(totals.costPerKmCents)}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                                        <div>Lucro/km</div>
                                        <div className="font-semibold text-white/80">
                                            R$ {formatBrlFromCents(totals.profitPerKmCents)}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                                        <div>Km</div>
                                        <div className="font-semibold text-white/80">
                                            {round1(totals.kmValue)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link
                                        href={route('settings')}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
                                    >
                                        Ajustar combustível/consumo/fixos
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                show={isExpensesOpen}
                onClose={() => setIsExpensesOpen(false)}
                maxWidth="md"
            >
                <div className="bg-[#070B12] text-white">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                        <div className="text-base font-extrabold tracking-tight">
                            Despesas variáveis
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsExpensesOpen(false)}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                        >
                            Fechar
                        </button>
                    </div>

                    <div className="space-y-4 px-6 py-6">
                        {(expenses ?? []).length ? (
                            expenses.map((item, idx) => (
                                <div
                                    key={item?.id ?? idx}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                >
                                    <div className="grid gap-3">
                                        <input
                                            value={item?.label ?? ''}
                                            onChange={(e) => {
                                                const next = [...expenses];
                                                next[idx] = {
                                                    ...next[idx],
                                                    label: e.target.value,
                                                };
                                                setExpenses(next);
                                            }}
                                            placeholder="Ex.: Pedágio"
                                            className="w-full rounded-xl border border-white/10 bg-[#0a1020]/60 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                        />
                                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a1020]/60 px-4 py-3">
                                            <div className="text-sm font-semibold text-white/60">
                                                R$
                                            </div>
                                            <input
                                                value={item?.amount_brl ?? ''}
                                                onChange={(e) => {
                                                    const next = [...expenses];
                                                    next[idx] = {
                                                        ...next[idx],
                                                        amount_brl: e.target.value,
                                                    };
                                                    setExpenses(next);
                                                }}
                                                inputMode="decimal"
                                                placeholder="0,00"
                                                className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpenses(
                                                        expenses.filter((_, i) => i !== idx),
                                                    )
                                                }
                                                className="rounded-lg px-3 py-2 text-xs font-bold text-red-300 hover:bg-white/5"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-white/60">
                                Sem itens ainda. Adicione abaixo.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                setExpenses([
                                    ...expenses,
                                    {
                                        id: `${Date.now()}`,
                                        label: '',
                                        amount_brl: '',
                                    },
                                ])
                            }
                            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-extrabold text-white hover:bg-white/10"
                        >
                            + Adicionar item
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsExpensesOpen(false)}
                            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400"
                        >
                            Concluir
                        </button>
                    </div>
                </div>
            </Modal>
        </DriverLayout>
    );
}
