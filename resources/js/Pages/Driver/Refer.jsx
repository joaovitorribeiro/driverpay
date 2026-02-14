import DriverLayout from '@/Layouts/DriverLayout';
import Pagination from '@/Components/Pagination';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function Field({ label, value }) {
    return (
        <div>
            <div className="text-xs font-extrabold tracking-widest text-white/45">
                {label}
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base font-semibold text-white">
                {value}
            </div>
        </div>
    );
}

export default function Refer({ referral, referrals }) {
    const billingLabel = usePage().props.billing?.label ?? 'Conta Gratuita';
    const [copied, setCopied] = useState(null);

    const code = referral?.code ?? null;
    const link = referral?.link ?? null;
    const count = referrals?.total ?? 0;
    const items = referrals?.data ?? [];

    const canShare = useMemo(() => {
        return typeof navigator !== 'undefined' && !!navigator?.share;
    }, []);

    const copy = async (text, key) => {
        if (!text) return;

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setCopied(key);
            window.setTimeout(() => setCopied(null), 1400);
        } catch {
            setCopied(null);
        }
    };

    const share = async () => {
        if (!link || !navigator?.share) return;
        try {
            await navigator.share({
                title: 'Driver Pay',
                text: 'Crie sua conta com meu link e comece a controlar seus custos.',
                url: link,
            });
        } catch {
        }
    };

    return (
        <DriverLayout>
            <Head title="Indicar" />

            <div className="px-4 pb-14 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div>
                        <div className="text-xs font-extrabold tracking-widest text-emerald-300/90">
                            {billingLabel}
                        </div>
                        <h1 className="mt-3 text-[44px] font-extrabold leading-[1.05] tracking-tight text-white">
                            Indicar
                        </h1>
                        <div className="mt-3 text-base font-medium text-slate-400">
                            Compartilhe seu link. Quem abrir será levado ao
                            cadastro com a indicação já aplicada.
                        </div>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-2xl shadow-black/35 backdrop-blur">
                        <div className="space-y-6">
                            <Field
                                label="SEU CÓDIGO"
                                value={code ?? 'Carregando...'}
                            />
                            <Field
                                label="SEU LINK"
                                value={link ?? 'Carregando...'}
                            />
                        </div>

                        <div className="mt-6 grid gap-3">
                            <button
                                type="button"
                                disabled={!link}
                                onClick={() => copy(link, 'link')}
                                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 text-base font-extrabold tracking-wide text-emerald-950 shadow-lg shadow-emerald-500/15 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {copied === 'link'
                                    ? 'Copiado!'
                                    : 'Copiar link'}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    disabled={!code}
                                    onClick={() => copy(code, 'code')}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {copied === 'code'
                                        ? 'Copiado!'
                                        : 'Copiar código'}
                                </button>

                                <button
                                    type="button"
                                    disabled={!canShare || !link}
                                    onClick={share}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Compartilhar
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-xs font-medium text-white/40">
                            Dica: você pode enviar o link no WhatsApp e Instagram.
                        </div>

                        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <div className="text-sm font-extrabold tracking-wide text-emerald-200">
                                Como funciona
                            </div>
                            <div className="mt-2 space-y-2 text-sm font-medium leading-relaxed text-emerald-100/90">
                                <div>
                                    1) Envie seu link para a pessoa se cadastrar.
                                </div>
                                <div>
                                    2) O cadastro já vai com sua indicação aplicada.
                                </div>
                                <div>
                                    3) Quando a pessoa ativar o plano Pro, você ganha
                                    +7 dias no seu Pro.
                                </div>
                                <div>
                                    Cada indicado libera o bônus apenas uma vez.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0b1424]/55 p-6 shadow-2xl shadow-black/35 backdrop-blur">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xl font-extrabold tracking-tight text-white">
                                Indicados
                            </div>
                            <div className="text-sm font-extrabold text-white/60">
                                {count}
                            </div>
                        </div>

                        <div className="mt-5">
                            {items.length ? (
                                <div className="space-y-3">
                                    {items.map((u) => (
                                        <div
                                            key={u.id}
                                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="text-sm font-bold text-white">
                                                    {u.name}
                                                </div>
                                                <div
                                                    className={
                                                        (u.plan === 'pro'
                                                            ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/20'
                                                            : 'bg-white/10 text-white/70 ring-white/10') +
                                                        ' inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider ring-1'
                                                    }
                                                >
                                                    {u.plan === 'pro'
                                                        ? 'Pro'
                                                        : 'Gratuito'}
                                                </div>
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-white/45">
                                                {u.email}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm font-medium text-white/45">
                                    Nenhuma indicação ainda.
                                </div>
                            )}
                        </div>

                        <Pagination paginator={referrals} variant="dark" />
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
