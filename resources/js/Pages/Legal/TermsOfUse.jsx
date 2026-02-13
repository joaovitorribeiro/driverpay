import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link } from '@inertiajs/react';

export default function TermsOfUse() {
    return (
        <DriverLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Termos de Uso
                    </h2>
                    <Link
                        href={route('dashboard')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Termos de Uso" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="text-sm text-gray-700">
                            Esta é uma página placeholder. Substitua este texto
                            pelos termos de uso oficiais do Driver Pay.
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
