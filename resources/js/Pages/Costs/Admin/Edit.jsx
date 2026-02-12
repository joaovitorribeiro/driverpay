import PrimaryButton from '@/Components/PrimaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import CostFields from '@/Pages/Costs/Partials/CostFields';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ cost }) {
    const form = useForm({
        date: cost.date ?? new Date().toISOString().slice(0, 10),
        description: cost.description ?? '',
        amount_cents: cost.amount_cents ?? 0,
        notes: cost.notes ?? '',
    });

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Editar custo
                    </h2>
                    <Link
                        href={route('costs.index')}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Editar custo" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.put(route('costs.update', cost.id));
                        }}
                        className="rounded-lg border border-gray-200 bg-white p-6"
                    >
                        <CostFields
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                        />

                        <div className="mt-8 flex justify-end">
                            <PrimaryButton disabled={form.processing}>
                                Salvar
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
