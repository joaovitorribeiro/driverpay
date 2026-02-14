import { Link } from '@inertiajs/react';

function stripHtml(value) {
    return String(value ?? '').replace(/<[^>]+>/g, '');
}

function decodeEntities(value) {
    return String(value ?? '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&');
}

function normalizeLabel(label) {
    const clean = decodeEntities(stripHtml(label)).trim();
    if (!clean) return '';
    if (clean.toLowerCase().includes('previous')) return '«';
    if (clean.toLowerCase().includes('next')) return '»';
    return clean;
}

export default function Pagination({ paginator, variant = 'dark', maxPages = null }) {
    const links = paginator?.links ?? [];
    const hasMultiplePages =
        typeof paginator?.last_page === 'number' ? paginator.last_page > 1 : links.length > 3;

    if (!hasMultiplePages) return null;

    const effectiveLastPage =
        typeof maxPages === 'number' && typeof paginator?.last_page === 'number'
            ? Math.min(paginator.last_page, maxPages)
            : paginator?.last_page ?? null;

    const pageFromUrl = (url) => {
        if (!url) return null;
        try {
            const base =
                typeof window !== 'undefined' && window.location?.origin
                    ? window.location.origin
                    : 'http://localhost';
            const u = new URL(url, base);
            const p = u.searchParams.get('page');
            const n = p ? Number(p) : null;
            return Number.isFinite(n) ? n : null;
        } catch {
            return null;
        }
    };

    const makePageUrl = (page) => {
        try {
            if (typeof window === 'undefined') return null;
            const u = new URL(window.location.href);
            u.searchParams.set('page', String(page));
            return u.pathname + u.search + u.hash;
        } catch {
            return null;
        }
    };

    const baseItemClass =
        variant === 'light'
            ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            : 'border border-white/10 bg-white/5 text-white/90 hover:bg-white/10';

    const activeItemClass =
        variant === 'light'
            ? 'border border-gray-900 bg-gray-900 text-white'
            : 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-100';

    const disabledItemClass =
        variant === 'light'
            ? 'border border-gray-200 bg-white text-gray-400 opacity-70 cursor-not-allowed'
            : 'border border-white/10 bg-white/5 text-white/35 opacity-70 cursor-not-allowed';

    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {links.map((link, idx) => {
                const label = normalizeLabel(link?.label);
                if (!label) return null;

                const isActive = !!link?.active;
                const urlPage = pageFromUrl(link?.url);
                const beyondMax =
                    typeof effectiveLastPage === 'number' &&
                    typeof urlPage === 'number' &&
                    urlPage > effectiveLastPage;
                const isDisabled = !link?.url || beyondMax;

                if (
                    typeof effectiveLastPage === 'number' &&
                    /^\d+$/.test(label) &&
                    Number(label) > effectiveLastPage
                ) {
                    return null;
                }

                const className =
                    (isDisabled ? disabledItemClass : isActive ? activeItemClass : baseItemClass) +
                    ' inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-extrabold';

                if (isDisabled) {
                    return (
                        <span key={`${label}-${idx}`} className={className}>
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={`${label}-${idx}`}
                        href={link.url}
                        preserveScroll
                        preserveState
                        replace
                        className={className}
                    >
                        {label}
                    </Link>
                );
            })}

            {typeof effectiveLastPage === 'number' &&
            typeof paginator?.last_page === 'number' &&
            paginator.last_page > effectiveLastPage ? (
                <>
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-extrabold text-white/45">
                        …
                    </span>
                    {makePageUrl(effectiveLastPage) ? (
                        <Link
                            href={makePageUrl(effectiveLastPage)}
                            preserveScroll
                            preserveState
                            replace
                            className={
                                baseItemClass +
                                ' inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-extrabold'
                            }
                        >
                            {effectiveLastPage}
                        </Link>
                    ) : null}
                </>
            ) : null}
        </nav>
    );
}
