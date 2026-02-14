import DriverLayout from '@/Layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import Modal from '@/Components/Modal';
import { useMemo, useState } from 'react';

function Field({ label, hint, value, error, onChange, inputMode = 'decimal' }) {
    return (
        <div>
            <div className="text-xs font-extrabold tracking-widest text-white/45">
                {label}
            </div>
            {hint ? (
                <div className="mt-1 text-xs font-medium text-white/35">
                    {hint}
                </div>
            ) : null}
            <input
                value={value}
                onChange={onChange}
                inputMode={inputMode}
                className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-5 text-base font-semibold text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/10"
            />
            {error ? (
                <div className="mt-2 text-sm font-medium text-red-300">
                    {error}
                </div>
            ) : null}
        </div>
    );
}

function parseBrlToCents(value) {
    if (!value) return 0;
    const normalized = String(value).replace(/[^\d,.-]/g, '');
    if (!normalized) return 0;
    const withoutThousands = normalized.replace(/\./g, '');
    const dotDecimal = withoutThousands.replace(',', '.');
    const num = Number(dotDecimal);
    if (!Number.isFinite(num)) return 0;
    return Math.round(num * 100);
}

function formatDecimalFromCents(cents) {
    const value = (Number(cents ?? 0) || 0) / 100;
    return value.toFixed(2);
}

function sumItemsCents(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + parseBrlToCents(item?.amount_brl ?? ''), 0);
}

function ItemizeButton({ onClick, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-extrabold tracking-wide text-white/90 hover:bg-white/10"
        >
            Detalhar{typeof count === 'number' && count > 0 ? ` (${count})` : ''}
        </button>
    );
}

export default function Settings({ settings }) {
    const billingLabel = usePage().props.billing?.label ?? 'Conta Gratuita';

    const form = useForm({
        fuel_price_brl: settings?.fuel_price_brl ?? '0',
        consumption_km_per_l: settings?.consumption_km_per_l ?? '0',
        maintenance_monthly_brl: settings?.maintenance_monthly_brl ?? '',
        maintenance_items: settings?.maintenance_items ?? [],
        rent_monthly_brl: settings?.rent_monthly_brl ?? '',
        rent_items: settings?.rent_items ?? [],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('maintenance');
    const [draftLabel, setDraftLabel] = useState('');
    const [draftAmount, setDraftAmount] = useState('');

    const maintenanceTotalCents = useMemo(
        () => sumItemsCents(form.data.maintenance_items),
        [form.data.maintenance_items],
    );
    const rentTotalCents = useMemo(
        () => sumItemsCents(form.data.rent_items),
        [form.data.rent_items],
    );

    const openModal = (type) => {
        setModalType(type);
        setDraftLabel('');
        setDraftAmount('');
        setIsModalOpen(true);
    };

    const currentItems =
        modalType === 'rent'
            ? form.data.rent_items ?? []
            : form.data.maintenance_items ?? [];

    const setCurrentItems = (items) => {
        if (modalType === 'rent') {
            form.setData('rent_items', items);
            form.setData('rent_monthly_brl', formatDecimalFromCents(sumItemsCents(items)));
            return;
        }

        form.setData('maintenance_items', items);
        form.setData('maintenance_monthly_brl', formatDecimalFromCents(sumItemsCents(items)));
    };

    const addItem = () => {
        if (!draftLabel.trim()) return;
        if (!draftAmount.trim()) return;

        const next = [
            ...(currentItems ?? []),
            {
                id: `${Date.now()}`,
                label: draftLabel.trim(),
                amount_brl: draftAmount.trim(),
            },
        ];

        setCurrentItems(next);
        setDraftLabel('');
        setDraftAmount('');
    };

    return (
        <DriverLayout>
            <Head title="Configurações" />

            <div className="px-4 pb-14 pt-10">
                <div className="mx-auto w-full max-w-md">
                    <div>
                        <div className="text-xs font-extrabold tracking-widest text-emerald-300/90">
                            {billingLabel}
                        </div>
                        <h1 className="mt-3 text-[44px] font-extrabold leading-[1.05] tracking-tight text-white">
                            Configurações
                        </h1>
                        <div className="mt-3 text-base font-medium text-slate-400">
                            Ajuste os valores para melhorar seus cálculos.
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.patch(route('settings.update'), {
                                preserveScroll: true,
                            });
                        }}
                        className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1424]/60 p-6 shadow-2xl shadow-black/35 backdrop-blur"
                    >
                        <button
                            type="button"
                            onClick={() => openModal('maintenance')}
                            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-extrabold tracking-wide text-white/90 hover:bg-white/10"
                        >
                            + Adicionar custo
                        </button>

                        <div className="space-y-6">
                            <Field
                                label="COMBUSTÍVEL (R$/L)"
                                value={form.data.fuel_price_brl}
                                error={form.errors.fuel_price_brl}
                                onChange={(e) =>
                                    form.setData('fuel_price_brl', e.target.value)
                                }
                            />
                            <Field
                                label="CONSUMO (KM/L)"
                                value={form.data.consumption_km_per_l}
                                error={form.errors.consumption_km_per_l}
                                onChange={(e) =>
                                    form.setData('consumption_km_per_l', e.target.value)
                                }
                            />
                            <Field
                                label="MANUTENÇÃO MENSAL (OPCIONAL)"
                                value={form.data.maintenance_monthly_brl}
                                error={form.errors.maintenance_monthly_brl}
                                onChange={(e) =>
                                    form.setData(
                                        'maintenance_monthly_brl',
                                        e.target.value,
                                    )
                                }
                            />
                            <ItemizeButton
                                onClick={() => openModal('maintenance')}
                                count={(form.data.maintenance_items ?? []).length}
                            />
                            <Field
                                label="ALUGUEL/PARCELA MENSAL (OPCIONAL)"
                                value={form.data.rent_monthly_brl}
                                error={form.errors.rent_monthly_brl}
                                onChange={(e) =>
                                    form.setData('rent_monthly_brl', e.target.value)
                                }
                            />
                            <ItemizeButton
                                onClick={() => openModal('rent')}
                                count={(form.data.rent_items ?? []).length}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 text-base font-extrabold tracking-wide text-emerald-950 shadow-lg shadow-emerald-500/15 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Salvar
                        </button>

                        <div className="mt-4 flex items-center justify-center">
                            <Transition
                                show={form.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="text-sm font-semibold text-emerald-300">
                                    Salvo.
                                </div>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                <div className="bg-[#070B12] text-white">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                        <div className="text-base font-extrabold tracking-tight">
                            {modalType === 'rent'
                                ? 'Aluguel/Parcela mensal'
                                : 'Manutenção mensal'}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                        >
                            Fechar
                        </button>
                    </div>

                    <div className="space-y-4 px-6 py-6">
                        <div className="grid gap-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <select
                                    value={modalType}
                                    onChange={(e) => setModalType(e.target.value)}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0a1020]/60 px-4 text-sm font-semibold text-white focus:outline-none"
                                >
                                    <option value="maintenance">
                                        Manutenção
                                    </option>
                                    <option value="rent">
                                        Aluguel/Parcela
                                    </option>
                                </select>
                                <div className="rounded-2xl border border-white/10 bg-[#0a1020]/60 px-4 py-3 text-sm font-semibold text-white/80">
                                    Total:{' '}
                                    {modalType === 'rent'
                                        ? formatDecimalFromCents(rentTotalCents)
                                        : formatDecimalFromCents(maintenanceTotalCents)}
                                </div>
                            </div>

                            <input
                                value={draftLabel}
                                onChange={(e) => setDraftLabel(e.target.value)}
                                placeholder="Nome (ex.: Óleo, Revisão, Seguro)"
                                className="h-12 w-full rounded-2xl border border-white/10 bg-[#0a1020]/60 px-4 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1020]/60 px-4">
                                <div className="text-sm font-semibold text-white/60">
                                    R$
                                </div>
                                <input
                                    value={draftAmount}
                                    onChange={(e) => setDraftAmount(e.target.value)}
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    className="h-12 w-full border-0 bg-transparent p-0 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-emerald-950 hover:bg-emerald-400"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {(currentItems ?? []).length ? (
                                currentItems.map((item, idx) => (
                                    <div
                                        key={item?.id ?? idx}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                    >
                                        <div className="grid gap-3 sm:grid-cols-5 sm:items-center">
                                            <input
                                                value={item?.label ?? ''}
                                                onChange={(e) => {
                                                    const next = [...currentItems];
                                                    next[idx] = {
                                                        ...next[idx],
                                                        label: e.target.value,
                                                    };
                                                    setCurrentItems(next);
                                                }}
                                                placeholder="Nome"
                                                className="sm:col-span-3 h-11 w-full rounded-xl border border-white/10 bg-[#0a1020]/60 px-4 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                            />
                                            <input
                                                value={item?.amount_brl ?? ''}
                                                onChange={(e) => {
                                                    const next = [...currentItems];
                                                    next[idx] = {
                                                        ...next[idx],
                                                        amount_brl: e.target.value,
                                                    };
                                                    setCurrentItems(next);
                                                }}
                                                inputMode="decimal"
                                                placeholder="0,00"
                                                className="sm:col-span-2 h-11 w-full rounded-xl border border-white/10 bg-[#0a1020]/60 px-4 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentItems(
                                                    currentItems.filter((_, i) => i !== idx),
                                                )
                                            }
                                            className="mt-3 rounded-xl px-3 py-2 text-xs font-extrabold text-red-300 hover:bg-white/5"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm font-medium text-white/55">
                                    Nenhum item. Adicione acima.
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentItems([]);
                                    if (modalType === 'rent') {
                                        form.setData('rent_monthly_brl', '');
                                    } else {
                                        form.setData('maintenance_monthly_brl', '');
                                    }
                                }}
                                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-extrabold text-white hover:bg-white/10"
                            >
                                Limpar
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 text-sm font-extrabold text-emerald-950 hover:bg-emerald-400"
                            >
                                Concluir
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </DriverLayout>
    );
}
