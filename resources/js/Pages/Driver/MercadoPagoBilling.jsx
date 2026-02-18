import DriverLayout from '@/Layouts/DriverLayout';
import { Head, router, usePage } from '@inertiajs/react';

function StatusPill({ status }) {
    const normalized = (status || '').toLowerCase();
    const style =
        normalized === 'active'
            ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25'
            : normalized === 'pending'
              ? 'bg-amber-500/15 text-amber-200 border-amber-500/25'
              : normalized === 'paused'
                ? 'bg-slate-500/15 text-slate-200 border-slate-500/25'
                : 'bg-rose-500/15 text-rose-200 border-rose-500/25';

    return (
        <span
            className={
                style +
                ' inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold tracking-wide'
            }
        >
            {status || 'unknown'}
        </span>
    );
}

export default function MercadoPagoBilling({ subscription }) {
    const errors = usePage().props.errors ?? {};
    const errorMessage = errors?.mercadopago ?? null;
    const status = subscription?.status || null;
    const canCancel = status && !['canceled', 'cancelled'].includes(status);

    return (
        <DriverLayout>
            <Head title="Assinatura (Mercado Pago)" />

            <div className="px-4 pb-14 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="text-center">
                        <div className="text-sm font-semibold tracking-wider text-emerald-300/90">
                            Mercado Pago
                        </div>
                        <h1 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight text-white">
                            Gerencie sua assinatura Pro
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-white/65">
                            O acesso Pro é liberado automaticamente quando o pagamento é autorizado.
                        </p>
                    </div>

                    {subscription ? (
                        <div className="mt-8 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white shadow-2xl shadow-black/35">
                            {errorMessage ? (
                                <div className="mb-5 rounded-[18px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
                                    {errorMessage}
                                </div>
                            ) : null}
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-base font-extrabold text-white">
                                    Assinatura atual
                                </div>
                                <StatusPill status={subscription.status} />
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-white/70">
                                <div>
                                    <span className="text-white/50">Plano:</span>{' '}
                                    <span className="font-semibold text-white/85">
                                        {subscription.plan || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-white/50">Renova até:</span>{' '}
                                    <span className="font-semibold text-white/85">
                                        {subscription.current_period_end_at
                                            ? new Date(subscription.current_period_end_at).toLocaleString()
                                            : '—'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3">
                                {canCancel ? (
                                    <button
                                        type="button"
                                        onClick={() => router.post(route('billing.mercadopago.cancel'))}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-rose-500/15 text-sm font-extrabold tracking-wide text-rose-200 hover:bg-rose-500/20"
                                    >
                                        Cancelar assinatura
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => router.get(route('pro'))}
                                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white shadow-2xl shadow-black/35">
                            <div className="text-base font-extrabold text-white">
                                Você ainda não tem assinatura
                            </div>
                            <div className="mt-2 text-sm leading-relaxed text-white/65">
                                Escolha um plano e conclua o pagamento no Mercado Pago.
                            </div>

                            <div className="mt-6 grid gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(route('billing.mercadopago.start'), {
                                            plan: 'monthly',
                                        })
                                    }
                                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold tracking-wide text-emerald-950 hover:bg-emerald-400"
                                >
                                    Assinar mensal
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(route('billing.mercadopago.start'), {
                                            plan: 'annual',
                                        })
                                    }
                                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Assinar anual
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get(route('pro'))}
                                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DriverLayout>
    );
}
