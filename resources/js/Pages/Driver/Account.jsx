import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

function formatCurrency(value) {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(num) ? num : 0);
}

function formatNumber(value) {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(Number.isFinite(num) ? num : 0);
}

function Row({ label, value, strong }) {
    return (
        <div className="flex items-start justify-between gap-6">
            <div className="text-xs font-extrabold tracking-widest text-white/45">
                {label}
            </div>
            <div
                className={
                    (strong
                        ? 'text-white'
                        : 'text-white/70') + ' text-sm font-semibold text-right'
                }
            >
                {value}
            </div>
        </div>
    );
}

export default function Account({ account, driver_settings, status }) {
    const user = usePage().props.auth.user;
    const billingLabel = usePage().props.billing?.label ?? 'Conta Gratuita';
    const isPro = !!usePage().props.billing?.is_pro;
    const daysRemaining = usePage().props.billing?.days_remaining;

    const resetForm = useForm({});

    return (
        <DriverLayout>
            <Head title="Conta" />

            <div className="px-4 pb-14 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-[44px] font-extrabold leading-[1.05] tracking-tight text-white">
                                Conta
                            </h1>
                            <div className="mt-2 text-sm font-semibold text-white/55">
                                {user?.email}
                            </div>
                        </div>

                        <div className="mt-3 inline-flex items-center rounded-full bg-white/8 px-3 py-1 text-xs font-extrabold tracking-wider text-white/70 ring-1 ring-white/10">
                            {isPro
                                ? `Pro${
                                      typeof daysRemaining === 'number'
                                          ? ` (${daysRemaining} dias)`
                                          : ''
                                  }`
                                : 'Free'}
                        </div>
                    </div>

                    {status ? (
                        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                            {status}
                        </div>
                    ) : null}

                    <div className="mt-8 space-y-6">
                        <div className="rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-2xl shadow-black/35 backdrop-blur">
                            <div className="text-lg font-extrabold tracking-tight text-white">
                                Usuário
                            </div>

                            <div className="mt-5 space-y-4">
                                <Row
                                    label="PLANO"
                                    value={billingLabel}
                                    strong
                                />
                                <Row
                                    label="E-MAIL"
                                    value={account?.email ?? user?.email}
                                    strong
                                />
                                <Row
                                    label="ID"
                                    value={account?.public_id ?? String(user?.id ?? '')}
                                />
                            </div>

                            <div className="mt-6 grid gap-3">
                                <Link
                                    href={route('settings')}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Configurações
                                </Link>
                                {isPro ? (
                                    <Link
                                        href={route('billing.google.manage')}
                                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                    >
                                        Gerenciar assinaturas
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('pro')}
                                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                    >
                                        Fazer upgrade
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-[#0b1424]/55 p-6 shadow-2xl shadow-black/35 backdrop-blur">
                            <div className="text-lg font-extrabold tracking-tight text-white">
                                Segurança
                            </div>
                            <div className="mt-2 text-sm font-medium leading-relaxed text-white/55">
                                Você receberá um link por e-mail para redefinir sua senha.
                            </div>

                            <div className="mt-6 grid gap-3">
                                <Link
                                    href={route('profile.edit')}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Trocar senha
                                </Link>
                                <button
                                    type="button"
                                    disabled={resetForm.processing}
                                    onClick={() =>
                                        resetForm.post(
                                            route('account.password_reset'),
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Enviar link agora
                                </button>
                                <Transition
                                    show={resetForm.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <div className="text-center text-sm font-semibold text-emerald-300">
                                        Enviado.
                                    </div>
                                </Transition>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-[#0b1424]/55 p-6 shadow-2xl shadow-black/35 backdrop-blur">
                            <div className="text-lg font-extrabold tracking-tight text-white">
                                Configuração usada no cálculo
                            </div>

                            <div className="mt-5 space-y-4">
                                <Row
                                    label="COMBUSTÍVEL"
                                    value={`${formatCurrency(
                                        driver_settings?.fuel_price_brl,
                                    )} R$/L`}
                                    strong
                                />
                                <Row
                                    label="CONSUMO"
                                    value={`${formatNumber(
                                        driver_settings?.consumption_km_per_l,
                                    )} km/l`}
                                    strong
                                />
                                <Row
                                    label="MANUTENÇÃO"
                                    value={`${formatCurrency(
                                        driver_settings?.maintenance_monthly_brl,
                                    )} / mês`}
                                />
                                <Row
                                    label="ALUGUEL"
                                    value={`${formatCurrency(
                                        driver_settings?.rent_monthly_brl,
                                    )} / mês`}
                                />
                            </div>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.reload({
                                            preserveScroll: true,
                                        })
                                    }
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                                >
                                    Atualizar sincronização
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
