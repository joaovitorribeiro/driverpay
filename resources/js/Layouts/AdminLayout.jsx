import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const role = user?.role;
    const can = usePage().props.can ?? {};

    const navigationLinks = [
        {
            label: 'Dashboard',
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
                    <path d="M3 13h8V3H3v10z" />
                    <path d="M13 21h8V11h-8v10z" />
                    <path d="M13 3h8v6h-8V3z" />
                    <path d="M3 21h8v-6H3v6z" />
                </svg>
            ),
        },
        {
            label: 'Usuários',
            href: route('users.index'),
            active: route().current('users.*'),
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        ...(can.viewLogs
            ? [
                  {
                      label: 'Logs',
                      href: route('logs.index'),
                      active: route().current('logs.*'),
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
                              <path d="M4 4h16v16H4z" />
                              <path d="M8 8h8" />
                              <path d="M8 12h8" />
                              <path d="M8 16h5" />
                          </svg>
                      ),
                  },
              ]
            : []),
        ...(role === 'master'
            ? [
                  {
                      label: 'Termos de Uso',
                      href: route('master.legal.edit', 'terms_of_use'),
                      active: route().current('master.legal.edit', 'terms_of_use'),
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
                  {
                      label: 'Privacidade',
                      href: route('master.legal.edit', 'privacy_policy'),
                      active: route().current('master.legal.edit', 'privacy_policy'),
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
              ]
            : []),
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col border-r border-slate-200 bg-white">
                    <div className="flex h-16 items-center gap-3 px-6">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <ApplicationLogo className="h-9 w-9 fill-current text-slate-900" />
                            <div className="leading-tight">
                                <div className="text-sm font-extrabold tracking-tight">
                                    Driver Pay
                                </div>
                                <div className="text-xs font-semibold text-slate-500">
                                    {role === 'master'
                                        ? 'Master'
                                        : role === 'admin'
                                          ? 'Admin'
                                          : 'Painel'}
                                </div>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 pb-6">
                        <div className="mt-4 space-y-1">
                            {navigationLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={
                                        (item.active
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900') +
                                        ' flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition'
                                    }
                                >
                                    <span
                                        className={
                                            (item.active
                                                ? 'text-white'
                                                : 'text-slate-500') + ' shrink-0'
                                        }
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </nav>

                    <div className="border-t border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-900">
                                    {user?.name}
                                </div>
                                <div className="truncate text-xs text-slate-500">
                                    {user?.email}
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                            >
                                                {role ? (
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
                                                        {role}
                                                    </span>
                                                ) : null}
                                                <svg
                                                    className="h-4 w-4 text-slate-500"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            type="button"
                                        >
                                            Sair
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={
                    (isMobileMenuOpen
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0') +
                    ' fixed inset-0 z-40 transition-opacity duration-200 lg:hidden'
                }
                aria-hidden={!isMobileMenuOpen}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                <aside
                    className={
                        (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') +
                        ' absolute inset-y-0 left-0 w-[300px] max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-200'
                    }
                    role="dialog"
                    aria-label="Menu"
                    aria-modal="true"
                >
                    <div className="flex h-full flex-col">
                        <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 px-5">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <ApplicationLogo className="h-9 w-9 fill-current text-slate-900" />
                                <div className="text-sm font-extrabold tracking-tight text-slate-900">
                                    Driver Pay
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
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

                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="space-y-1">
                                {navigationLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={
                                            (item.active
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900') +
                                            ' flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold'
                                        }
                                    >
                                        <span
                                            className={
                                                (item.active
                                                    ? 'text-white'
                                                    : 'text-slate-500') +
                                                ' shrink-0'
                                            }
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        <div className="border-t border-slate-200 p-5">
                            <div className="text-sm font-semibold text-slate-900">
                                {user?.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                                {user?.email}
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Perfil
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    type="button"
                                    className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-black"
                                >
                                    Sair
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="lg:pl-72">
                <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
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
                            <div className="min-w-0">
                                <div className="text-sm font-extrabold tracking-tight text-slate-900">
                                    Driver Pay
                                </div>
                                <div className="text-xs font-semibold text-slate-500">
                                    {role === 'master'
                                        ? 'Painel Master'
                                        : role === 'admin'
                                          ? 'Painel Admin'
                                          : 'Painel'}
                                </div>
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 lg:flex">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-slate-900">
                                    {user?.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {user?.email}
                                </div>
                            </div>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                        >
                                            {role ? (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
                                                    {role}
                                                </span>
                                            ) : null}
                                            <svg
                                                className="h-4 w-4 text-slate-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Perfil
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        type="button"
                                    >
                                        Sair
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {header ? (
                    <div className="border-b border-slate-200 bg-white">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </div>
                ) : null}

                <main>{children}</main>
            </div>
        </div>
    );
}
