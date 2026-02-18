import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link, router } from '@inertiajs/react';

function PriceCard({ title, price, cadence, highlight, onSelect, badge }) {
    return (
        <div
            className={
                (highlight
                    ? 'border-emerald-400/40 bg-[#0b1424]/75'
                    : 'border-white/10 bg-[#0b1424]/55') +
                ' relative overflow-hidden rounded-[26px] border p-6 shadow-2xl shadow-black/35 backdrop-blur'
            }
        >
            {badge ? (
                <div className="absolute right-5 top-5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-extrabold tracking-wide text-emerald-950">
                    {badge}
                </div>
            ) : null}

            <div className="text-sm font-semibold tracking-wide text-white/75">
                {title}
            </div>
            <div className="mt-4 flex items-end gap-2">
                <div className="text-4xl font-extrabold tracking-tight text-white">
                    R$ {price}
                </div>
                <div className="pb-1 text-sm font-semibold text-white/60">
                    / {cadence}
                </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-white/75">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    <span>Histórico completo</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    <span>Relatórios Mensal e Anual</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    <span>Exportar para Contador</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onSelect}
                className={
                    (highlight
                        ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                        : 'bg-white/10 text-white hover:bg-white/15') +
                    ' mt-6 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-extrabold tracking-wide'
                }
            >
                Assinar {title.toLowerCase()}
            </button>
        </div>
    );
}

export default function Pro({ pricing, google_billing, mercadopago_billing, entitlements }) {
    const isPro = !!entitlements?.is_pro;
    const mpEnabled = !!mercadopago_billing?.enabled;

    return (
        <DriverLayout>
            <Head title="Pro" />

            <div className="px-4 pb-14 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="text-center">
                        <div className="text-sm font-semibold tracking-wider text-emerald-300/90">
                            {isPro ? (
                                <>
                                    <span className="text-emerald-400">
                                        Driver
                                    </span>{' '}
                                    <span className="text-emerald-200">
                                        Pay
                                    </span>{' '}
                                    Pro
                                </>
                            ) : (
                                'Conta Gratuita'
                            )}
                        </div>
                        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-white">
                            Relatórios completos para você ganhar mais.
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-white/65">
                            No Free você vê apenas os últimos 7 dias. No Pro
                            você desbloqueia relatórios Mensal/Anual e exportação.
                        </p>
                    </div>

                    {isPro ? (
                        <div className="mt-8 rounded-[26px] border border-emerald-400/30 bg-emerald-500/10 p-6 text-white shadow-2xl shadow-black/35">
                            <div className="text-lg font-extrabold tracking-tight">
                                Pro ativo
                            </div>
                            <div className="mt-2 text-sm leading-relaxed text-white/70">
                                Sua assinatura está ativa. Use “Gerenciar assinatura” para ver status e cancelar.
                            </div>
                            <div className="mt-5 grid gap-3">
                                {mpEnabled ? (
                                    <Link
                                        href={route('billing.mercadopago.portal')}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold tracking-wide text-emerald-950 hover:bg-emerald-400"
                                    >
                                        Gerenciar no Mercado Pago
                                    </Link>
                                ) : (
                                    <div className="rounded-[18px] border border-white/10 bg-[#0b1424]/35 p-4 text-sm text-white/65">
                                        Configure MP_ACCESS_TOKEN para habilitar o Mercado Pago.
                                    </div>
                                )}
                                {/*
                                <Link
                                    href={route('billing.google.manage')}
                                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Gerenciar no Google
                                </Link>
                                */}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mt-10 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white/80 shadow-2xl shadow-black/35">
                                <div className="text-base font-extrabold text-white">
                                    Pagamento via Mercado Pago
                                </div>
                                <div className="mt-2 text-sm leading-relaxed text-white/65">
                                    Assine com cartão/Pix pelo Mercado Pago. O acesso Pro é liberado automaticamente quando o pagamento é autorizado.
                                </div>
                                <Link
                                    href={route('billing.mercadopago.portal')}
                                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Ver detalhes da assinatura
                                </Link>
                            </div>

                            {mpEnabled ? (
                                <div className="mt-4 grid gap-4">
                                    <PriceCard
                                        title="Mensal"
                                        price={pricing?.monthly_brl ?? '9,90'}
                                        cadence="mês"
                                        highlight
                                        badge="Mais popular"
                                        onSelect={() =>
                                            router.post(route('billing.mercadopago.start'), {
                                                plan: 'monthly',
                                            })
                                        }
                                    />
                                    <PriceCard
                                        title="Anual"
                                        price={pricing?.annual_brl ?? '79,90'}
                                        cadence="ano"
                                        badge="Economize"
                                        onSelect={() =>
                                            router.post(route('billing.mercadopago.start'), {
                                                plan: 'annual',
                                            })
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="mt-4 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white/80 shadow-2xl shadow-black/35">
                                    <div className="text-base font-extrabold text-white">
                                        Mercado Pago não configurado
                                    </div>
                                    <div className="mt-2 text-sm leading-relaxed text-white/65">
                                        Configure MP_ACCESS_TOKEN no .env para habilitar assinaturas.
                                    </div>
                                </div>
                            )}

                            {/*
                            <div className="mt-8 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white/80 shadow-2xl shadow-black/35">
                                <div className="text-base font-extrabold text-white">
                                    Pagamento via Google Billing
                                </div>
                                <div className="mt-2 text-sm leading-relaxed text-white/65">
                                    A assinatura é gerenciada pela sua conta do
                                    Google. Você pode ver e gerenciar suas
                                    assinaturas a qualquer momento.
                                </div>
                                <Link
                                    href={route('billing.google.manage')}
                                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Gerenciar assinaturas
                                </Link>
                                {!google_billing?.package_name ? (
                                    <div className="mt-3 text-xs text-white/45">
                                        Configure GOOGLE_PLAY_PACKAGE_NAME e SKUs
                                        no .env para linkar direto no plano.
                                    </div>
                                ) : null}
                            </div>
                            */}
                        </>
                    )}
                </div>
            </div>
        </DriverLayout>
    );
}
