import DriverLayout from '@/Layouts/DriverLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link } from '@inertiajs/react';

function statusLabel(item) {
    const status = String(item?.status ?? '').toLowerCase();
    const kind = item?.kind;

    if (kind === 'subscription') {
        if (status === 'active') return 'Ativa';
        if (status === 'pending') return 'Pendente';
        if (status === 'paused') return 'Pausada';
        if (status === 'canceled' || status === 'cancelled') return 'Cancelada';
        return 'Em andamento';
    }

    if (status === 'approved') return 'Pago';
    if (status === 'pending') return 'Pendente';
    if (status === 'in_process' || status === 'in_mediation' || status === 'authorized') {
        return 'Em andamento';
    }
    if (status === 'cancelled' || status === 'canceled') return 'Cancelada';
    if (status === 'rejected') return 'Recusada';
    return 'Em andamento';
}

function statusTone(item) {
    const status = String(item?.status ?? '').toLowerCase();
    if (status === 'approved' || status === 'active')
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/25';
    if (
        status === 'pending' ||
        status === 'in_process' ||
        status === 'in_mediation' ||
        status === 'authorized'
    )
        return 'bg-amber-500/15 text-amber-200 border-amber-400/25';
    if (status === 'cancelled' || status === 'canceled' || status === 'rejected')
        return 'bg-rose-500/15 text-rose-200 border-rose-400/25';
    return 'bg-white/10 text-white/65 border-white/10';
}

function Chip({ active, href, children }) {
    const base =
        'inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-extrabold tracking-wide';
    const cls = active
        ? 'bg-emerald-500 text-emerald-950'
        : 'bg-white/10 text-white hover:bg-white/15';

    return (
        <Link href={href} preserveScroll preserveState replace className={`${base} ${cls}`}>
            {children}
        </Link>
    );
}

function ItemCard({ item }) {
    const createdAt = item?.created_at ? new Date(item.created_at) : null;
    const createdText = createdAt
        ? createdAt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        : '-';

    const planText =
        item?.plan === 'annual'
            ? 'Anual'
            : item?.plan === 'monthly'
              ? 'Mensal'
              : item?.plan
                ? String(item.plan)
                : '-';

    return (
        <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-extrabold text-white">
                        {item.kind === 'pix' ? 'PIX Avulso' : 'Assinatura'}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                        {createdText} • Plano {planText}
                    </div>
                </div>
                <div
                    className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusTone(
                        item,
                    )}`}
                >
                    {statusLabel(item)}
                </div>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-white/60">
                <div className="flex items-center justify-between">
                    <span>ID</span>
                    <span className="max-w-[65%] truncate text-white/75">
                        {item.provider_id}
                    </span>
                </div>
                {item.amount_brl ? (
                    <div className="flex items-center justify-between">
                        <span>Valor</span>
                        <span className="text-white/75">
                            R$ {String(item.amount_brl).replace('.', ',')}
                        </span>
                    </div>
                ) : null}
                {item.expires_at ? (
                    <div className="flex items-center justify-between">
                        <span>Expira</span>
                        <span className="text-white/75">
                            {new Date(item.expires_at).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                            })}
                        </span>
                    </div>
                ) : null}
            </div>

            {item.resume_url ? (
                <Link
                    href={item.resume_url}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                >
                    {item.kind === 'pix' ? 'Continuar pagamento' : 'Ver detalhes'}
                </Link>
            ) : null}
        </div>
    );
}

export default function BillingHistory({ tab, status, pix, subscriptions, summary }) {
    const pendingCount = summary?.pending_pix_count ?? 0;
    const tabValue = tab === 'subscription' ? 'subscription' : 'pix';

    const paginator = tabValue === 'subscription' ? subscriptions : pix;
    const items = paginator?.data ?? [];

    const baseParams = (next) => ({
        tab: tabValue,
        status: status ?? 'all',
        ...next,
    });

    const makeHref = (next) => route('billing.history', baseParams(next));

    const statusOptions =
        tabValue === 'subscription'
            ? [
                  ['all', 'Todos'],
                  ['active', 'Ativa'],
                  ['pending', 'Pendente'],
                  ['paused', 'Pausada'],
                  ['canceled', 'Cancelada'],
              ]
            : [
                  ['all', 'Todos'],
                  ['pending_valid', 'Somente pendentes (ainda válidos)'],
                  ['pending', 'Pendente'],
                  ['in_progress', 'Em andamento'],
                  ['approved', 'Pago'],
                  ['cancelled', 'Cancelada'],
                  ['rejected', 'Recusada'],
              ];

    return (
        <DriverLayout>
            <Head title="Histórico de compras" />

            <div className="px-4 pb-14 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xs font-extrabold tracking-widest text-emerald-300/90">
                                Driver Pay
                            </div>
                            <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight text-white">
                                Histórico de compras
                            </h1>
                            <div className="mt-3 text-base font-medium text-slate-400">
                                Acompanhe pagamentos pendentes, em andamento e concluídos.
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white/80 shadow-2xl shadow-black/35">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-extrabold text-white">
                                Ações rápidas
                            </div>
                            <div className="rounded-full border border-amber-400/25 bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-200">
                                {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                            <Link
                                href={route('pro')}
                                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                            >
                                Voltar para planos
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <Chip active={tabValue === 'pix'} href={route('billing.history', { tab: 'pix', status: 'all' })}>
                            PIX
                        </Chip>
                        <Chip
                            active={tabValue === 'subscription'}
                            href={route('billing.history', { tab: 'subscription', status: 'all' })}
                        >
                            Assinaturas
                        </Chip>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {statusOptions.map(([key, label]) => (
                            <Chip key={key} active={(status ?? 'all') === key} href={makeHref({ status: key })}>
                                {label}
                            </Chip>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-3">
                        {items?.length ? (
                            items.map((item) => (
                                <ItemCard
                                    key={`${item.kind}:${item.provider}:${item.provider_id}:${item.created_at}`}
                                    item={item}
                                />
                            ))
                        ) : (
                            <div className="rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                                Nenhuma compra encontrada para este filtro.
                            </div>
                        )}
                    </div>

                    <Pagination paginator={paginator} variant="dark" maxPages={200} />
                </div>
            </div>
        </DriverLayout>
    );
}
