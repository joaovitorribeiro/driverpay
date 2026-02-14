import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Modal from '@/Components/Modal';

export default function DriverLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isPro = !!usePage().props.billing?.is_pro;
    const daysRemaining = usePage().props.billing?.days_remaining;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    const [legalLoading, setLegalLoading] = useState(false);
    const [legalError, setLegalError] = useState('');
    const [legalDoc, setLegalDoc] = useState(null);

    const items = useMemo(
        () => [
            {
                label: 'Inicio',
                href: route('dashboard'),
                active: route().current('dashboard'),
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1V10.5z" />
                    </svg>
                ),
            },
            {
                label: 'Histórico',
                href: route('costs.index'),
                active: route().current('costs.*'),
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                        <path d="M3 3v6h6" />
                        <path d="M12 7v6l4 2" />
                    </svg>
                ),
            },
            {
                label: 'Ajustes',
                href: route('settings'),
                active: route().current('settings'),
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M4 21v-7" />
                        <path d="M4 10V3" />
                        <path d="M12 21v-9" />
                        <path d="M12 8V3" />
                        <path d="M20 21v-5" />
                        <path d="M20 12V3" />
                        <path d="M2 14h4" />
                        <path d="M10 8h4" />
                        <path d="M18 16h4" />
                    </svg>
                ),
            },
            {
                label: 'Indicar',
                href: route('refer'),
                active: route().current('refer'),
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <path d="M20 8v6" />
                        <path d="M23 11h-6" />
                    </svg>
                ),
            },
            {
                label: 'Conta',
                href: route('account'),
                active: route().current('account'),
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                ),
            },
        ],
        [],
    );

    const legalItems = useMemo(
        () => [
            {
                label: 'Política de privacidade',
                type: 'privacy_policy',
                icon: (
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
                ),
            },
            {
                label: 'Termos de Uso',
                type: 'terms_of_use',
                icon: (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                    </svg>
                ),
            },
        ],
        [],
    );

    async function openLegal(type) {
        setIsMenuOpen(false);
        setIsLegalOpen(true);
        setLegalLoading(true);
        setLegalError('');
        setLegalDoc(null);

        try {
            const response = await fetch(route('legal.content', type), {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setLegalDoc(data);
        } catch (e) {
            setLegalError('Não foi possível carregar o documento.');
        } finally {
            setLegalLoading(false);
        }
    }

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
                        {isPro
                            ? `PRO${
                                  typeof daysRemaining === 'number'
                                      ? ` (${daysRemaining} dias)`
                                      : ''
                              }`
                            : 'UPGRADE'}
                    </Link>
                </div>
            </div>

            {header ? (
                <header className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {header}
                </header>
            ) : null}

            <main>{children}</main>

            <Modal show={isLegalOpen} onClose={() => setIsLegalOpen(false)} maxWidth="2xl">
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="font-serif text-base font-semibold text-gray-900">
                            {legalDoc?.title ?? 'Documento'}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLegalOpen(false)}
                            className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
                <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
                    {legalLoading ? (
                        <div className="text-sm text-gray-600">Carregando…</div>
                    ) : legalError ? (
                        <div className="text-sm font-semibold text-red-600">
                            {legalError}
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-gray-900 [text-align:justify]">
                            {legalDoc?.content ?? ''}
                        </div>
                    )}
                </div>
            </Modal>

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
                        ' absolute inset-y-0 left-0 w-[300px] max-w-[85vw] transform border-r border-white/10 bg-gradient-to-b from-[#0b0f17] to-[#070a12] shadow-2xl transition-transform duration-200'
                    }
                    role="dialog"
                    aria-label="Menu"
                    aria-modal="true"
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
                            <div className="text-lg font-semibold text-white">
                                <span className="text-emerald-400">Driver</span>{' '}
                                <span className="text-white">Pay</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10"
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

                        {user ? (
                            <div className="px-5">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-emerald-400/5 text-sm font-extrabold text-emerald-200 ring-1 ring-emerald-400/20">
                                            {(user?.name ?? 'U').slice(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-semibold text-white">
                                                {user?.name}
                                            </div>
                                            <div className="truncate text-xs text-white/60">
                                                {user?.email}
                                            </div>
                                        </div>
                                        {isPro ? (
                                            <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-400/25">
                                                Pro
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="px-5">
                            <Link
                                href={route('pro')}
                                onClick={() => setIsMenuOpen(false)}
                                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-sm font-extrabold tracking-wide text-emerald-950 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.8)] hover:from-emerald-300 hover:to-emerald-500"
                            >
                                {isPro
                                    ? `PRO${
                                          typeof daysRemaining === 'number'
                                              ? ` (${daysRemaining} dias)`
                                              : ''
                                      }`
                                    : 'UPGRADE'}
                            </Link>
                        </div>

                        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-5">
                            <div className="px-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">
                                Menu
                            </div>
                            <div className="mt-3 space-y-1">
                                {items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={
                                            (item.active
                                                ? 'bg-white/8 text-white ring-1 ring-white/10'
                                                : 'text-white/75 hover:bg-white/5 hover:text-white') +
                                            ' group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition'
                                        }
                                    >
                                        <span
                                            className={
                                                (item.active
                                                    ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20'
                                                    : 'bg-white/5 text-white/70 ring-1 ring-white/10 group-hover:text-white') +
                                                ' grid h-9 w-9 place-items-center rounded-2xl transition'
                                            }
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {item.label}
                                        </span>
                                        <span
                                            className={
                                                (item.active
                                                    ? 'bg-emerald-400'
                                                    : 'bg-white/0') +
                                                ' h-2 w-2 rounded-full transition'
                                            }
                                        />
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-8 px-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">
                                Legal
                            </div>
                            <div className="mt-3 space-y-1">
                                {legalItems.map((item) => (
                                    <button
                                        key={item.type}
                                        type="button"
                                        onClick={() => openLegal(item.type)}
                                        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:bg-white/5 hover:text-white"
                                    >
                                        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/5 text-white/70 ring-1 ring-white/10 transition group-hover:text-white">
                                            {item.icon}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </nav>

                        <div className="border-t border-white/10 px-5 py-4">
                            {user ? (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    type="button"
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 ring-1 ring-red-400/20 hover:bg-red-500/15"
                                >
                                    Sair
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
