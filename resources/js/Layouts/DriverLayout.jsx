import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function DriverLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isPro = !!usePage().props.billing?.is_pro;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const items = useMemo(
        () => [
            {
                label: 'Inicio',
                href: route('dashboard'),
                active: route().current('dashboard'),
            },
            {
                label: 'Histórico',
                href: route('costs.index'),
                active: route().current('costs.*'),
            },
            {
                label: 'Ajustes',
                href: route('settings'),
                active: route().current('settings'),
            },
            {
                label: 'Indicar',
                href: route('refer'),
                active: route().current('refer'),
            },
            {
                label: 'Conta',
                href: route('account'),
                active: route().current('account'),
            },
        ],
        [],
    );

    const legalItems = useMemo(
        () => [
            {
                label: 'Política de privacidade',
                href: route('privacy.policy'),
                active: route().current('privacy.policy'),
            },
            {
                label: 'Termos de Uso',
                href: route('terms.use'),
                active: route().current('terms.use'),
            },
        ],
        [],
    );

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        function onKeyDown(event) {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isMenuOpen]);

    return (
        <div className="min-h-screen bg-[#070B12] text-slate-100">
            <div className="sticky top-0 z-30 border-b border-white/10 bg-[#070B12]/95 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10"
                        aria-label="Abrir menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </button>

                    <div className="flex-1 text-center text-sm font-semibold tracking-tight text-white">
                        <span className="text-emerald-400">Driver</span>{' '}
                        <span className="text-white">Pay</span>
                    </div>

                    <Link
                        href={route('pro')}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-5 text-xs font-bold tracking-wider text-emerald-950 hover:bg-emerald-400"
                    >
                        {isPro ? 'PRO' : 'UPGRADE'}
                    </Link>
                </div>
            </div>

            {header ? (
                <header className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {header}
                </header>
            ) : null}

            <main>{children}</main>

            <div
                className={
                    (isMenuOpen
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0') +
                    ' fixed inset-0 z-40 transition-opacity duration-200'
                }
                aria-hidden={!isMenuOpen}
            >
                <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setIsMenuOpen(false)}
                />

                <aside
                    className={
                        (isMenuOpen ? 'translate-x-0' : '-translate-x-full') +
                        ' absolute inset-y-0 left-0 w-[280px] max-w-[85vw] transform border-r border-white/10 bg-gradient-to-b from-[#0b0f17] to-[#070a12] shadow-2xl transition-transform duration-200'
                    }
                    role="dialog"
                    aria-label="Menu"
                    aria-modal="true"
                >
                    <div className="flex h-full flex-col px-5 py-6">
                        <div>
                            <div className="text-lg font-semibold text-white">
                                Driver Pay
                            </div>
                        </div>

                        <Link
                            href={route('pro')}
                            onClick={() => setIsMenuOpen(false)}
                            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-sm font-semibold text-emerald-950"
                        >
                            {isPro ? 'Pro' : 'Upgrade'}
                        </Link>

                        <nav className="mt-6 flex-1">
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={
                                            (item.active
                                                ? 'text-emerald-300'
                                                : 'text-white/85 hover:text-white') +
                                            ' block text-sm font-semibold'
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="my-6 h-px bg-white/10" />

                            <div className="space-y-3">
                                {legalItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={
                                            (item.active
                                                ? 'text-emerald-300'
                                                : 'text-white/80 hover:text-white') +
                                            ' block text-sm font-semibold'
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        <div className="my-6 h-px bg-white/10" />

                        {user ? (
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                type="button"
                                className="text-left text-sm font-semibold text-red-400 hover:text-red-300"
                            >
                                Sair
                            </Link>
                        ) : null}
                    </div>
                </aside>
            </div>
        </div>
    );
}
