import DriverLayout from '@/Layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

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

export default function Settings({ settings }) {
    const billingLabel = usePage().props.billing?.label ?? 'Conta Gratuita';

    const form = useForm({
        fuel_price_brl: settings?.fuel_price_brl ?? '0',
        consumption_km_per_l: settings?.consumption_km_per_l ?? '0',
        maintenance_monthly_brl: settings?.maintenance_monthly_brl ?? '',
        rent_monthly_brl: settings?.rent_monthly_brl ?? '',
    });

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
                            <Field
                                label="ALUGUEL/PARCELA MENSAL (OPCIONAL)"
                                value={form.data.rent_monthly_brl}
                                error={form.errors.rent_monthly_brl}
                                onChange={(e) =>
                                    form.setData('rent_monthly_brl', e.target.value)
                                }
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
        </DriverLayout>
    );
}
