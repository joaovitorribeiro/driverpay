import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function parseDecimal(value) {
    if (!value) {
        return 0;
    }

    const normalized = String(value).replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
}

function formatBRL(value) {
    const number = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(number);
}

function InputRow({ label, value, onChange, unit, placeholder }) {
    return (
        <div className="mt-5">
            <div className="text-xs font-semibold tracking-widest text-slate-400">
                {label}
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    inputMode="decimal"
                    className="w-full border-0 bg-transparent p-0 text-base text-slate-100 placeholder-slate-500 outline-none"
                    placeholder={placeholder}
                />
                <div className="text-sm font-semibold text-slate-400">
                    {unit}
                </div>
            </div>
        </div>
    );
}

export default function DriverDashboard() {
    const [gains, setGains] = useState('');
    const [kms, setKms] = useState('');
    const [showExpenses, setShowExpenses] = useState(false);

    const [pedagio, setPedagio] = useState('');
    const [estacionamento, setEstacionamento] = useState('');
    const [lavagem, setLavagem] = useState('');

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

    const gainsValue = parseDecimal(gains);
    const kmsValue = parseDecimal(kms);
    const expensesTotal =
        parseDecimal(pedagio) + parseDecimal(estacionamento) + parseDecimal(lavagem);
    const profit = gainsValue - expensesTotal;

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

                    <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0b1424]/70 p-6 shadow-2xl shadow-black/45 backdrop-blur">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Registro do dia
                        </div>

                        <InputRow
                            label="GANHOS"
                            value={gains}
                            onChange={setGains}
                            unit="R$"
                            placeholder="220,00"
                        />

                        <InputRow
                            label="KM RODADOS"
                            value={kms}
                            onChange={setKms}
                            unit="km"
                            placeholder="150"
                        />

                        <div className="mt-6">
                            <div className="text-xs font-semibold tracking-widest text-slate-400">
                                DESPESAS VARIÁVEIS (OPCIONAL)
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowExpenses((v) => !v)
                                    }
                                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                                >
                                    + Detalhar
                                </button>
                                <div className="text-sm font-bold text-slate-200">
                                    {formatBRL(expensesTotal)}
                                </div>
                            </div>

                            <div className="mt-3 text-sm text-slate-500">
                                Pedágio, estacionamento, lavagem, etc.
                            </div>

                            {showExpenses ? (
                                <div className="mt-5 space-y-4">
                                    <InputRow
                                        label="PEDÁGIO"
                                        value={pedagio}
                                        onChange={setPedagio}
                                        unit="R$"
                                        placeholder="0,00"
                                    />
                                    <InputRow
                                        label="ESTACIONAMENTO"
                                        value={estacionamento}
                                        onChange={setEstacionamento}
                                        unit="R$"
                                        placeholder="0,00"
                                    />
                                    <InputRow
                                        label="LAVAGEM"
                                        value={lavagem}
                                        onChange={setLavagem}
                                        unit="R$"
                                        placeholder="0,00"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            className={
                                (gainsValue > 0 || kmsValue > 0
                                    ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                                    : 'bg-white/10 text-white/60') +
                                ' mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl text-base font-bold'
                            }
                        >
                            Salvar Registro
                        </button>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-xl shadow-black/35 backdrop-blur">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            Resumo
                        </div>
                        {gainsValue > 0 || kmsValue > 0 ? (
                            <div className="mt-4 space-y-2 text-sm text-slate-300">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400">
                                        Ganhos
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatBRL(gainsValue)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400">
                                        Despesas
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatBRL(expensesTotal)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400">
                                        Lucro
                                    </div>
                                    <div className="font-bold text-emerald-300">
                                        {formatBRL(profit)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-base text-slate-500">
                                Preencha ganhos e/ou km para ver o resultado.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
