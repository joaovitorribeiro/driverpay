import AdminLayout from '@/Layouts/AdminLayout';
import CostsTable from '@/Pages/Costs/Partials/CostsTable';
import { Head, Link } from '@inertiajs/react';

export default function Index({ costs }) {
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Custos
                        </h2>
                        <div className="mt-1 text-sm text-gray-500">
                            Visão master (tudo).
                        </div>
                    </div>
                    <Link
                        href={route('costs.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Novo custo
                    </Link>
                </div>
            }
        >
            <Head title="Custos" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <CostsTable costs={costs} />
                </div>
            </div>
        </AdminLayout>
    );
}
