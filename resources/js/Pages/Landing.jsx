import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function Pill({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            {children}
        </span>
    );
}

function Feature({ title, description, icon }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/25 backdrop-blur">
            <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                    {icon}
                </div>
                <div>
                    <div className="text-base font-semibold text-white">
                        {title}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-white/70">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Step({ number, title, description, href, cta }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold text-white">
                        {number}
                    </div>
                    <div className="mt-4 text-base font-semibold text-white">
                        {title}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-white/70">
                        {description}
                    </div>
                </div>
                {href ? (
                    <Link
                        href={href}
                        className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                    >
                        {cta}
                    </Link>
                ) : null}
            </div>
        </div>
    );
}

function FAQItem({ q, a }) {
    return (
        <details className="group rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
            <summary className="cursor-pointer list-none select-none">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-white">{q}</div>
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 group-open:rotate-180 transition-transform">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>
            </summary>
            <div className="mt-4 text-sm leading-relaxed text-white/70">
                {a}
            </div>
        </details>
    );
}

export default function Landing({ canLogin, canRegister }) {
    const user = usePage().props.auth?.user;
    const role = user?.role;
    const [mobileOpen, setMobileOpen] = useState(false);

    const primaryCta = useMemo(() => {
        if (user) {
            return {
                label: role === 'master' || role === 'admin' ? 'Abrir painel' : 'Abrir app',
                href: route('dashboard'),
            };
        }

        if (canRegister) {
            return { label: 'Começar grátis', href: route('register') };
        }

        if (canLogin) {
            return { label: 'Entrar', href: route('login') };
        }

        return { label: 'Abrir app', href: route('dashboard') };
    }, [user, role, canRegister, canLogin]);

    return (
        <>
            <Head title="Driver Pay" />
            <div className="min-h-screen bg-[#070B12] text-white">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
                        <div className="absolute -top-24 right-[-180px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />
                        <div className="absolute bottom-[-240px] left-[-180px] h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-3xl" />
                    </div>

                    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070B12]/85 backdrop-blur">
                        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <ApplicationLogo className="h-9 w-9 fill-current text-white" />
                                <div className="leading-tight">
                                    <div className="text-sm font-extrabold tracking-tight">
                                        Driver Pay
                                    </div>
                                    <div className="text-xs font-semibold text-white/55">
                                        Controle real do seu custo por corrida
                                    </div>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-6 lg:flex">
                                <a
                                    href="#como-funciona"
                                    className="text-sm font-semibold text-white/70 hover:text-white"
                                >
                                    Como funciona
                                </a>
                                <a
                                    href="#o-que-entra-no-custo"
                                    className="text-sm font-semibold text-white/70 hover:text-white"
                                >
                                    Custo real
                                </a>
                                <a
                                    href="#recursos"
                                    className="text-sm font-semibold text-white/70 hover:text-white"
                                >
                                    Recursos
                                </a>
                                <a
                                    href="#faq"
                                    className="text-sm font-semibold text-white/70 hover:text-white"
                                >
                                    FAQ
                                </a>
                            </nav>

                            <div className="flex items-center gap-2">
                                {!user && canLogin ? (
                                    <Link
                                        href={route('login')}
                                        className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-white/75 hover:text-white sm:inline-flex"
                                    >
                                        Entrar
                                    </Link>
                                ) : null}

                                <Link
                                    href={primaryCta.href}
                                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold tracking-wide text-emerald-950 hover:bg-emerald-400"
                                >
                                    {primaryCta.label}
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(true)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 lg:hidden"
                                    aria-label="Abrir menu"
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
                                        <line x1="4" x2="20" y1="6" y2="6" />
                                        <line x1="4" x2="20" y1="12" y2="12" />
                                        <line x1="4" x2="20" y1="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </header>

                    <div
                        className={
                            (mobileOpen
                                ? 'pointer-events-auto opacity-100'
                                : 'pointer-events-none opacity-0') +
                            ' fixed inset-0 z-40 transition-opacity duration-200 lg:hidden'
                        }
                        aria-hidden={!mobileOpen}
                    >
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setMobileOpen(false)}
                        />
                        <aside
                            className={
                                (mobileOpen ? 'translate-x-0' : '-translate-x-full') +
                                ' absolute inset-y-0 left-0 w-[320px] max-w-[85vw] transform border-r border-white/10 bg-[#0b0f17] shadow-2xl transition-transform duration-200'
                            }
                            role="dialog"
                            aria-label="Menu"
                            aria-modal="true"
                        >
                            <div className="flex h-full flex-col px-5 py-6">
                                <div className="flex items-center justify-between gap-3">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-3"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <ApplicationLogo className="h-9 w-9 fill-current text-white" />
                                        <div className="text-sm font-extrabold tracking-tight">
                                            Driver Pay
                                        </div>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                        aria-label="Fechar menu"
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
                                            <path d="M18 6 6 18" />
                                            <path d="M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-8 space-y-2">
                                    {[
                                        { label: 'Como funciona', href: '#como-funciona' },
                                        { label: 'Custo real', href: '#o-que-entra-no-custo' },
                                        { label: 'Recursos', href: '#recursos' },
                                        { label: 'FAQ', href: '#faq' },
                                    ].map((item) => (
                                        <a
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </div>

                                <div className="mt-auto space-y-3">
                                    {!user && canLogin ? (
                                        <Link
                                            href={route('login')}
                                            onClick={() => setMobileOpen(false)}
                                            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10"
                                        >
                                            Entrar
                                        </Link>
                                    ) : null}
                                    <Link
                                        href={primaryCta.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-emerald-500 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400"
                                    >
                                        {primaryCta.label}
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <main>
                        <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
                            <div className="grid items-start gap-14 lg:grid-cols-2">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Pill>Motorista de app</Pill>
                                        <Pill>Frete</Pill>
                                        <Pill>Moto táxi</Pill>
                                        <Pill>Entregas</Pill>
                                    </div>

                                    <h1 className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                                        Saiba o seu{' '}
                                        <span className="text-emerald-300">
                                            custo real
                                        </span>{' '}
                                        por corrida.
                                    </h1>

                                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                                        Ganhar bem não é só faturar alto. É
                                        entender o que você gasta de verdade no
                                        dia a dia: combustível, manutenção,
                                        pedágios, taxas e até o tempo parado.
                                    </p>

                                    <div className="mt-10 flex flex-wrap items-center gap-3">
                                        <Link
                                            href={primaryCta.href}
                                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 text-sm font-extrabold tracking-wide text-emerald-950 hover:bg-emerald-400"
                                        >
                                            {primaryCta.label}
                                        </Link>
                                        <a
                                            href="#como-funciona"
                                            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/90 hover:bg-white/10"
                                        >
                                            Ver como funciona
                                        </a>
                                        <a
                                            href="#o-que-entra-no-custo"
                                            className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white/70 hover:text-white"
                                        >
                                            Entender custo real →
                                        </a>
                                    </div>

                                    <div className="mt-10 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                                            <div className="text-xs font-semibold tracking-widest text-white/55">
                                                SIMPLES
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-white">
                                                Sem planilha
                                            </div>
                                        </div>
                                        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                                            <div className="text-xs font-semibold tracking-widest text-white/55">
                                                PRÁTICO
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-white">
                                                Lançamentos rápidos
                                            </div>
                                        </div>
                                        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                                            <div className="text-xs font-semibold tracking-widest text-white/55">
                                                CLARO
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-white">
                                                Visão por período
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="rounded-[36px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold tracking-widest text-white/55">
                                                    O QUE VOCÊ VÊ
                                                </div>
                                                <div className="mt-2 text-lg font-bold text-white">
                                                    Noção real do seu custo
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
                                                Driver Pay
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-3">
                                            {[
                                                {
                                                    label: 'Combustível',
                                                    value: 'Custo por km (R$/km)',
                                                },
                                                {
                                                    label: 'Manutenção',
                                                    value: 'Mensal e por km',
                                                },
                                                {
                                                    label: 'Despesas variáveis',
                                                    value: 'Pedágio, estacionamento, lavagem',
                                                },
                                                {
                                                    label: 'Taxas',
                                                    value: 'Apps e intermediários',
                                                },
                                            ].map((row) => (
                                                <div
                                                    key={row.label}
                                                    className="rounded-3xl border border-white/10 bg-[#070B12]/30 px-5 py-4"
                                                >
                                                    <div className="text-xs font-semibold tracking-widest text-white/55">
                                                        {row.label}
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-white">
                                                        {row.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 rounded-3xl border border-white/10 bg-[#070B12]/35 px-5 py-5">
                                            <div className="text-xs font-semibold tracking-widest text-white/55">
                                                DICA RÁPIDA
                                            </div>
                                            <div className="mt-2 text-sm leading-relaxed text-white/75">
                                                Seu custo real não é só
                                                combustível. Some manutenção,
                                                aluguel, taxas e pedágios para
                                                descobrir o mínimo por km que
                                                faz sentido para você.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            id="o-que-entra-no-custo"
                            className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                        >
                            <div className="max-w-2xl">
                                <div className="text-xs font-semibold tracking-widest text-emerald-300/90">
                                    CUSTO REAL
                                </div>
                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                    O que entra no custo do motorista
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-white/70">
                                    Seja Uber, 99, frete, moto táxi ou entregas:
                                    o custo real é a soma do que você gasta para
                                    rodar e manter o veículo operando.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Feature
                                    title="Combustível por km"
                                    description="Com o preço do litro e seu consumo (km/l), você sabe o custo do combustível por km e evita corridas ruins."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3 21V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
                                            <path d="M3 11h10" />
                                            <path d="M14 9h2a2 2 0 0 1 2 2v10" />
                                            <path d="M18 21a2 2 0 0 0 2-2" />
                                            <path d="M18 7V4" />
                                            <path d="M15 4h6" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Manutenção e desgaste"
                                    description="Óleo, pneus, freios e revisões não são surpresa: com controle mensal, você reserva antes e roda com previsibilidade."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M14.7 6.3a1 1 0 0 0-1.4 0l-7 7a1 1 0 0 0 0 1.4l2 2a1 1 0 0 0 1.4 0l7-7a1 1 0 0 0 0-1.4l-2-2z" />
                                            <path d="m8 8 8 8" />
                                            <path d="M12 21a2 2 0 0 0 2-2" />
                                            <path d="M21 12a2 2 0 0 0-2-2" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Despesas variáveis"
                                    description="Pedágio, estacionamento, lavagem e outros gastos pequenos somam mais do que você imagina no fim do mês."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 2v20" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Aluguel e fixos"
                                    description="Se você paga aluguel do carro/moto ou tem custos fixos, eles precisam entrar na conta para não enganar seu lucro."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3 21V10l9-7 9 7v11" />
                                            <path d="M9 21V12h6v9" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Taxas de aplicativos"
                                    description="Intermediários e taxas mudam o jogo. Se você não contabiliza, pode trabalhar muito e sobrar pouco."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <path d="M7 8h10" />
                                            <path d="M7 12h10" />
                                            <path d="M7 16h6" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Controle por período"
                                    description="Sem achismo: você enxerga os gastos por dia, semana e mês e ajusta estratégia, metas e horários."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3 3v18h18" />
                                            <path d="M7 14l3-3 4 4 6-6" />
                                        </svg>
                                    }
                                />
                            </div>
                        </section>

                        <section
                            id="como-funciona"
                            className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                        >
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl">
                                    <div className="text-xs font-semibold tracking-widest text-emerald-300/90">
                                        COMO FUNCIONA
                                    </div>
                                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                        Três passos para clareza total
                                    </h2>
                                    <p className="mt-4 text-base leading-relaxed text-white/70">
                                        Em poucos minutos você já sabe o que está
                                        custando rodar e onde ajustar para ter
                                        mais lucro por hora.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400"
                                        >
                                            Ir para o app
                                        </Link>
                                    ) : canRegister ? (
                                        <Link
                                            href={route('register')}
                                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400"
                                        >
                                            Criar conta
                                        </Link>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-10 grid gap-4 lg:grid-cols-3">
                                <Step
                                    number="1"
                                    title="Configure seu veículo"
                                    description="Defina preço do combustível, consumo (km/l) e seus custos fixos. Isso vira base para decisões melhores."
                                    href={user ? route('settings') : null}
                                    cta="Abrir ajustes"
                                />
                                <Step
                                    number="2"
                                    title="Lance suas despesas"
                                    description="Registre gastos reais do dia: combustível, pedágios, manutenção, taxas e qualquer custo que impacta seu lucro."
                                    href={user ? route('costs.create') : null}
                                    cta="Adicionar despesa"
                                />
                                <Step
                                    number="3"
                                    title="Acompanhe o resumo"
                                    description="Veja os últimos lançamentos, total por período e tenha clareza do que está consumindo sua operação."
                                    href={user ? route('dashboard') : null}
                                    cta="Ver dashboard"
                                />
                            </div>
                        </section>

                        <section
                            id="recursos"
                            className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                        >
                            <div className="max-w-2xl">
                                <div className="text-xs font-semibold tracking-widest text-emerald-300/90">
                                    RECURSOS
                                </div>
                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                    Feito para o dia a dia de quem roda
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-white/70">
                                    Um app leve, direto ao ponto, com a estética
                                    escura do Driver Pay e foco em operação.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Feature
                                    title="Dashboard por perfil"
                                    description="Motorista, Admin e Master com visões diferentes, cada um com o que precisa para operar."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3 13h8V3H3v10z" />
                                            <path d="M13 21h8V11h-8v10z" />
                                            <path d="M13 3h8v6h-8V3z" />
                                            <path d="M3 21h8v-6H3v6z" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Histórico com resumo"
                                    description="Total por período + melhor/pior dia e uma lista clara dos lançamentos."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3 3v18h18" />
                                            <path d="M7 14l3-3 4 4 6-6" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Configurações do motorista"
                                    description="Centraliza dados do seu veículo para organizar decisões e padronizar sua operação."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
                                            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="Privacidade e termos"
                                    description="Documentos legais publicados pelo Master e visíveis para motoristas dentro do app."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <path d="M9 12l2 2 4-4" />
                                        </svg>
                                    }
                                />
                                <Feature
                                    title="PRO quando precisar"
                                    description="Recursos extras e relatórios conforme sua evolução, sem complicar a jornada."
                                    icon={
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 17.5l-6.2 3.3 1.2-7L1 8.9l7.2-1L12 1.5l3.8 6.4 7.2 1-6 4.9 1.2 7z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </section>

                        <section
                            id="faq"
                            className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                        >
                            <div className="max-w-2xl">
                                <div className="text-xs font-semibold tracking-widest text-emerald-300/90">
                                    FAQ
                                </div>
                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                    Dúvidas comuns
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-white/70">
                                    Respostas rápidas para quem quer começar com
                                    clareza.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-4 lg:grid-cols-2">
                                <FAQItem
                                    q="Por que meu faturamento não significa lucro?"
                                    a="Porque o faturamento ignora combustível, manutenção, taxas e custos fixos. Quando você contabiliza tudo, descobre o mínimo por km/corrida que vale a pena."
                                />
                                <FAQItem
                                    q="O que eu devo lançar primeiro?"
                                    a="Comece pelo que dói no bolso: combustível, pedágio/estacionamento e manutenção. Depois inclua taxas e custos fixos para fechar a conta do mês."
                                />
                                <FAQItem
                                    q="Serve para carro e moto?"
                                    a="Sim. O objetivo é o mesmo: entender o custo real de operar e tomar decisões melhores, independente do veículo."
                                />
                                <FAQItem
                                    q="Consigo ver Termos e Privacidade dentro do app?"
                                    a="Sim. O Master publica os documentos e o motorista acessa pelo menu, sem precisar sair do layout do app."
                                />
                            </div>
                        </section>

                        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                            <div className="rounded-[42px] border border-white/10 bg-gradient-to-r from-emerald-500/15 via-white/5 to-sky-500/10 p-10 shadow-2xl shadow-black/40">
                                <div className="grid items-center gap-10 lg:grid-cols-2">
                                    <div>
                                        <div className="text-xs font-semibold tracking-widest text-white/60">
                                            PRONTO PARA COMEÇAR?
                                        </div>
                                        <div className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                            Pare de trabalhar no escuro.
                                        </div>
                                        <div className="mt-4 text-base leading-relaxed text-white/70">
                                            Transforme “acho que estou ganhando”
                                            em uma operação com números claros.
                                            Você decide com calma e roda melhor.
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <Link
                                            href={primaryCta.href}
                                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-500 px-7 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400"
                                        >
                                            {primaryCta.label}
                                        </Link>
                                        <Link
                                            href={route('legal.show', 'terms_of_use')}
                                            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white/90 hover:bg-white/10"
                                        >
                                            Termos
                                        </Link>
                                        <Link
                                            href={route('legal.show', 'privacy_policy')}
                                            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white/90 hover:bg-white/10"
                                        >
                                            Privacidade
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer className="border-t border-white/10">
                        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="inline-flex items-center gap-3">
                                    <ApplicationLogo className="h-8 w-8 fill-current text-white" />
                                    <div className="text-sm font-extrabold tracking-tight text-white">
                                        Driver Pay
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white/60">
                                    <Link
                                        href={route('legal.show', 'terms_of_use')}
                                        className="hover:text-white"
                                    >
                                        Termos de Uso
                                    </Link>
                                    <Link
                                        href={route('legal.show', 'privacy_policy')}
                                        className="hover:text-white"
                                    >
                                        Política de Privacidade
                                    </Link>
                                    <span className="text-white/35">•</span>
                                    <span className="text-white/45">
                                        {new Date().getFullYear()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
