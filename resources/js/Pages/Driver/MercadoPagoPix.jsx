import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

function formatRemaining(seconds) {
    if (seconds === null || seconds === undefined) return null;
    const s = Math.max(0, Number(seconds) || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function MercadoPagoPix({ id, qr_code, qr_code_base64, status, amount, expires_at, expires_in_seconds }) {
    const [copied, setCopied] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);
    const [remaining, setRemaining] = useState(expires_in_seconds ?? null);

    const handleCopy = () => {
        navigator.clipboard.writeText(qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (currentStatus === 'approved') return;

        const interval = setInterval(() => {
            router.reload({
                only: ['status'],
                onSuccess: (page) => {
                    setCurrentStatus(page.props.status);
                },
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [currentStatus]);

    const isApproved = currentStatus === 'approved';
    const isExpired = remaining !== null && Number(remaining) <= 0 && !isApproved;

    useEffect(() => {
        if (isApproved) return;
        if (remaining === null) return;
        if (Number(remaining) <= 0) return;

        const t = setInterval(() => {
            setRemaining((prev) => {
                if (prev === null || prev === undefined) return prev;
                const next = Number(prev) - 1;
                return next < 0 ? 0 : next;
            });
        }, 1000);

        return () => clearInterval(t);
    }, [remaining, isApproved]);

    return (
        <DriverLayout>
            <Head title="Pagamento PIX" />

            <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-[26px] border border-white/10 bg-[#0b1424]/55 p-8 text-center shadow-2xl shadow-black/35 backdrop-blur">
                    
                    {isApproved ? (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-2xl font-extrabold text-white">Pagamento Confirmado!</h2>
                            <p className="mt-2 text-white/65">Seu acesso Pro foi liberado por 30 dias.</p>
                            
                            <Link 
                                href={route('dashboard')} 
                                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-500 text-base font-extrabold tracking-wide text-emerald-950 hover:bg-emerald-400"
                            >
                                Ir para o Dashboard
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-center gap-3 text-white/50">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold tracking-wide">Aguardando pagamento...</span>
                            </div>

                            {expires_at ? (
                                <div className="mb-6 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/65">
                                    Expira em <span className="font-extrabold text-white">{formatRemaining(remaining)}</span>
                                </div>
                            ) : null}

                            <div className="text-sm font-bold tracking-wide text-white/40">TOTAL A PAGAR</div>
                            <div className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                                R$ {Number(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>

                            <div className="mt-8 rounded-xl bg-white p-4">
                                {qr_code_base64 ? (
                                    <img 
                                        src={`data:image/jpeg;base64,${qr_code_base64}`} 
                                        alt="QR Code PIX" 
                                        className="mx-auto h-48 w-48 object-contain"
                                    />
                                ) : (
                                    <div className="flex h-48 w-48 items-center justify-center text-xs text-black/50">
                                        Carregando QR Code...
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">
                                    Copia e Cola
                                </label>
                                <div className="relative">
                                    <input 
                                        readOnly 
                                        value={qr_code} 
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-xs text-white/70 focus:border-emerald-500/50 focus:ring-0"
                                    />
                                    <button 
                                        onClick={handleCopy}
                                        className="absolute right-2 top-2 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
                                        title="Copiar código"
                                    >
                                        {copied ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {copied && (
                                    <div className="mt-2 text-xs font-bold text-emerald-400 animate-pulse">
                                        Código copiado!
                                    </div>
                                )}
                            </div>

                            <Link
                                href={route('pro')}
                                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-extrabold tracking-wide text-white hover:bg-white/15"
                            >
                                Voltar para tela inicial
                            </Link>

                            <div className="mt-8 text-xs leading-relaxed text-white/40">
                                Após o pagamento, aguarde alguns segundos nesta tela.<br/>
                                A confirmação é automática.
                            </div>

                            {isExpired ? (
                                <div className="mt-4 rounded-[18px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                                    QR Code expirado. Volte e gere um novo.
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </DriverLayout>
    );
}
