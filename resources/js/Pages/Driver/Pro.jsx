import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useEffect, useState } from 'react';

function onlyDigits(value) {
    return String(value ?? '').replace(/\D+/g, '');
}

function formatCpf(value) {
    const digits = onlyDigits(value).slice(0, 11);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);

    if (digits.length <= 3) return p1;
    if (digits.length <= 6) return `${p1}.${p2}`;
    if (digits.length <= 9) return `${p1}.${p2}.${p3}`;
    return `${p1}.${p2}.${p3}-${p4}`;
}

function isValidCpf(value) {
    const cpf = onlyDigits(value);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calc = (base, factor) => {
        let sum = 0;
        for (let i = 0; i < base.length; i++) {
            sum += Number(base[i]) * (factor - i);
        }
        const mod = (sum * 10) % 11;
        return mod === 10 ? 0 : mod;
    };

    const d1 = calc(cpf.slice(0, 9), 10);
    const d2 = calc(cpf.slice(0, 10), 11);

    return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

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

function PaymentMethodModal({ isOpen, onClose, plan, onSelectMethod }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [cpf, setCpf] = useState('');
    const [saveCpf, setSaveCpf] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedMethod(null);
        setCpf('');
        setSaveCpf(false);
    }, [isOpen, plan]);

    const cpfDigits = onlyDigits(cpf);
    const cpfReady = cpfDigits.length === 11 && isValidCpf(cpfDigits);
    const isPixSelected = selectedMethod === 'pix';
    const isCardSelected = selectedMethod === 'card' || selectedMethod === null;

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="bg-[#0b1424] p-6 text-white">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold tracking-tight">
                        Escolha como pagar
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
                <div className="mt-2 text-sm text-white/65">
                    Você escolheu o plano <span className="font-bold text-white">{plan === 'annual' ? 'Anual' : 'Mensal'}</span>.
                </div>

                <div className="mt-6 grid gap-3">
                    <button
                        onClick={() => {
                            setSelectedMethod('card');
                            onSelectMethod('card');
                        }}
                        className={
                            (isCardSelected
                                ? 'border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border-white/10 bg-white/5 hover:border-emerald-400/20 hover:bg-white/5') +
                            ' group relative flex items-center justify-between overflow-hidden rounded-2xl border p-4 transition-all'
                        }
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={
                                    (isCardSelected
                                        ? 'bg-emerald-500 text-emerald-950'
                                        : 'bg-white/10 text-white') +
                                    ' flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors'
                                }
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zM1.5 9h21V6.75a1.5 1.5 0 00-1.5-1.5h-15a1.5 1.5 0 00-1.5 1.5V9zm0 3v5.25a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5V12h-21z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-extrabold text-white group-hover:text-emerald-300">
                                    Cartão de Crédito
                                </div>
                                <div className="text-xs text-white/50">
                                    Assinatura com renovação automática
                                </div>
                            </div>
                        </div>
                        <div
                            className={
                                (isCardSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100') +
                                ' mr-2 text-emerald-400 transition-opacity'
                            }
                        >
                            ➝
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedMethod('pix')}
                        className={
                            (isPixSelected
                                ? 'border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-emerald-500/10') +
                            ' group relative flex items-center justify-between overflow-hidden rounded-2xl border p-4 transition-all'
                        }
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={
                                    (isPixSelected
                                        ? 'bg-emerald-500 text-emerald-950'
                                        : 'bg-white/10 text-white') +
                                    ' flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors'
                                }
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.199-2.64-.563-3.821a.75.75 0 00-.722-.515 11.208 11.208 0 01-7.877-3.08zM12 5.75a.75.75 0 01.75.75v4.99l3.712-1.485a.75.75 0 11.556 1.392l-4.136 1.653a.75.75 0 01-1.056-.69V6.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-extrabold text-white group-hover:text-emerald-300">
                                    PIX (Avulso)
                                </div>
                                <div className="text-xs text-white/50">
                                    Pague agora e use por 30 dias (sem renovação)
                                </div>
                            </div>
                        </div>
                        <div
                            className={
                                (isPixSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100') +
                                ' mr-2 text-emerald-400 transition-opacity'
                            }
                        >
                            ➝
                        </div>
                    </button>

                    {selectedMethod === 'pix' ? (
                        <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-sm font-extrabold text-white">
                                CPF de quem vai pagar (pode ser de outra pessoa)
                            </div>
                            <div className="mt-1 text-xs leading-relaxed text-white/55">
                                Use o CPF de quem vai pagar o PIX. Esse dado é usado apenas para processar o pagamento no Mercado Pago.
                            </div>

                            <div className="mt-4">
                                <input
                                    value={cpf}
                                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                                    inputMode="numeric"
                                    placeholder="000.000.000-00"
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-semibold tracking-wide text-white/85 placeholder:text-white/25 focus:border-emerald-500/50 focus:ring-0"
                                />
                                {cpfDigits.length > 0 && !cpfReady ? (
                                    <div className="mt-2 text-xs font-semibold text-rose-300/85">
                                        CPF inválido.
                                    </div>
                                ) : null}
                            </div>

                            <label className="mt-4 flex items-center gap-3 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={saveCpf}
                                    onChange={(e) => setSaveCpf(e.target.checked)}
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/40"
                                />
                                Guardar CPF criptografado para este pagamento
                            </label>

                            <button
                                type="button"
                                disabled={!cpfReady}
                                onClick={() =>
                                    onSelectMethod('pix', {
                                        cpf: cpfDigits,
                                        save_cpf: saveCpf,
                                    })
                                }
                                className={
                                    (cpfReady
                                        ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                                        : 'bg-white/10 text-white/35') +
                                    ' mt-5 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-extrabold tracking-wide'
                                }
                            >
                                Gerar QR Code PIX
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}

export default function Pro({ pricing, google_billing, mercadopago_billing, entitlements, purchase_widget }) {
    const isPro = !!entitlements?.is_pro;
    const mpEnabled = !!mercadopago_billing?.enabled;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleProceedPayment = (method, extra = {}) => {
        setIsModalOpen(false);
        router.post(route('billing.mercadopago.start'), {
            plan: selectedPlan,
            method: method,
            ...extra,
        });
    };

    return (
        <DriverLayout>
            <Head title="Pro" />

            <PaymentMethodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
                onSelectMethod={handleProceedPayment}
            />

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
                                        onSelect={() => handleSelectPlan('monthly')}
                                    />
                                    <PriceCard
                                        title="Anual"
                                        price={pricing?.annual_brl ?? '79,90'}
                                        cadence="ano"
                                        badge="Economize"
                                        onSelect={() => handleSelectPlan('annual')}
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

                    <div className="mt-10 rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-6 text-white/80 shadow-2xl shadow-black/35">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-extrabold text-white">
                                Histórico de compras
                            </div>
                            <div className="rounded-full border border-amber-400/25 bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-200">
                                {purchase_widget?.pending_pix_count ?? 0} pendente{(purchase_widget?.pending_pix_count ?? 0) === 1 ? '' : 's'}
                            </div>
                        </div>
                        <div className="mt-2 text-sm leading-relaxed text-white/65">
                            Acompanhe pagamentos pendentes, em andamento e concluídos.
                        </div>

                        <div className="mt-5 grid gap-3">
                            {purchase_widget?.last_pending_pix?.resume_url ? (
                                <Link
                                    href={purchase_widget.last_pending_pix.resume_url}
                                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold tracking-wide text-emerald-950 hover:bg-emerald-400"
                                >
                                    Continuar último PIX
                                </Link>
                            ) : null}

                            <Link
                                href={purchase_widget?.history_url ?? route('billing.history')}
                                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                            >
                                Ver histórico de compras
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
