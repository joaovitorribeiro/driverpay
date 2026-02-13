import DriverLayout from '@/Layouts/DriverLayout';
import { formatMoneyFromCents } from '@/Pages/Costs/Partials/formatMoney';
import { Head, Link, router } from '@inertiajs/react';

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
    if (period === '30d') {
        return 'Últimos 30 dias (Pro)';
    }
    if (period === 'all') {
        return 'Histórico completo (Pro)';
    }
    return 'Últimos 7 dias (Free)';
}

export default function Index({ costs, filters, entitlements, summary }) {
    const period = filters?.period ?? '7d';
    const isPro = !!entitlements?.is_pro;
    const items = costs?.data ?? [];

    return (
        <DriverLayout>
            <Head title="Histórico" />

            <div className="px-4 pb-12 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-[44px] font-bold leading-[1.05] tracking-tight text-white">
                                Histórico
                            </h1>
                            <div className="mt-3 text-base font-medium text-slate-400">
                                {isPro ? periodSubtitle(period) : 'Últimos 7 dias (Free)'}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-7 text-sm font-semibold text-slate-200">
                            {isPro ? (
                                <>
                                    <button
                                        type="button"
                                        className="hover:text-white"
                                    >
                                        Mensal
                                    </button>
                                    <button
                                        type="button"
                                        className="hover:text-white"
                                    >
                                        Anual
                                    </button>
                                    <button
                                        type="button"
                                        className="hover:text-white"
                                    >
                                        Exportar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('pro')}
                                        className="hover:text-white"
                                    >
                                        Mensal
                                    </Link>
                                    <Link
                                        href={route('pro')}
                                        className="hover:text-white"
                                    >
                                        Anual
                                    </Link>
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
                            7 dias
                        </Chip>
                        <Chip
                            active={isPro && period === '30d'}
                            onClick={() => {
                                if (!isPro) {
                                    router.get(route('pro'));
                                    return;
                                }

                                router.get(
                                    route('costs.index'),
                                    { period: '30d' },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                        >
                            30 dias
                        </Chip>
                        <Chip
                            active={isPro && period === 'all'}
                            onClick={() => {
                                if (!isPro) {
                                    router.get(route('pro'));
                                    return;
                                }

                                router.get(
                                    route('costs.index'),
                                    { period: 'all' },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                        >
                            Tudo
                        </Chip>
                    </div>

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
                                <div className="text-slate-400">Melhor dia</div>
                                <div className="font-semibold text-emerald-300">
                                    {summary?.best_day
                                        ? formatMoneyFromCents(
                                              summary.best_day.total_cents,
                                          )
                                        : formatMoneyFromCents(0)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-slate-400">Pior dia</div>
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
                                {costs ? 'Nenhum registro no período.' : 'Carregando...'}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-between">
                        {costs?.prev_page_url ? (
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(costs.prev_page_url, {}, { preserveScroll: true })
                                }
                                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
                            >
                                Voltar
                            </button>
                        ) : (
                            <div />
                        )}

                        {costs?.next_page_url ? (
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(costs.next_page_url, {}, { preserveScroll: true })
                                }
                                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
                            >
                                Próximo
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
