import { Head, Link } from '@inertiajs/react';

export default function Landing({ auth, canLogin, canRegister }) {
    return (
        <>
            <Head title="DriverPay" />
            <div className="min-h-screen bg-gray-950 text-white">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                    <div className="text-lg font-semibold tracking-tight">
                        DriverPay
                    </div>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-white/90"
                            >
                                Abrir app
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="rounded-md px-4 py-2 text-sm font-medium text-white/80 hover:text-white"
                                    >
                                        Entrar
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-white/90"
                                    >
                                        Criar conta
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl px-6 py-16">
                    <div className="grid items-start gap-12 lg:grid-cols-2">
                        <div>
                            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                Pagamentos e controle para motoristas, simples.
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-white/70">
                                Uma base pronta com Laravel, Inertia, React e
                                Tailwind para você evoluir o produto: landing,
                                app, autenticação e banco PostgreSQL com pool.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md bg-white px-5 py-3 text-sm font-medium text-gray-950 hover:bg-white/90"
                                    >
                                        Ir para o Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="rounded-md bg-white px-5 py-3 text-sm font-medium text-gray-950 hover:bg-white/90"
                                            >
                                                Começar agora
                                            </Link>
                                        )}
                                        <a
                                            href="#recursos"
                                            className="rounded-md border border-white/15 px-5 py-3 text-sm font-medium text-white/90 hover:border-white/30 hover:text-white"
                                        >
                                            Ver recursos
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/10 bg-gray-950/30 p-4">
                                    <div className="text-sm text-white/60">
                                        Stack
                                    </div>
                                    <div className="mt-2 font-medium">
                                        Laravel + Inertia + React
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-gray-950/30 p-4">
                                    <div className="text-sm text-white/60">
                                        Estilos
                                    </div>
                                    <div className="mt-2 font-medium">
                                        Tailwind + Vite
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-gray-950/30 p-4">
                                    <div className="text-sm text-white/60">
                                        Banco
                                    </div>
                                    <div className="mt-2 font-medium">
                                        PostgreSQL
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-gray-950/30 p-4">
                                    <div className="text-sm text-white/60">
                                        Pool
                                    </div>
                                    <div className="mt-2 font-medium">
                                        PgBouncer
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section id="recursos" className="mt-20">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Recursos
                        </h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="text-base font-medium">
                                    Landing + App
                                </div>
                                <div className="mt-2 text-sm leading-relaxed text-white/70">
                                    Página pública com CTA e área autenticada com
                                    dashboard.
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="text-base font-medium">
                                    Docker pronto
                                </div>
                                <div className="mt-2 text-sm leading-relaxed text-white/70">
                                    Containers para PHP, Vite, PostgreSQL e
                                    PgBouncer.
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="text-base font-medium">
                                    Vite dev server
                                </div>
                                <div className="mt-2 text-sm leading-relaxed text-white/70">
                                    HMR funcionando em Docker com URL de hot
                                    reload no localhost.
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
                    DriverPay
                </footer>
            </div>
        </>
    );
}
