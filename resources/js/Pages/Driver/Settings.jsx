import DriverLayout from '@/Layouts/DriverLayout';
import { Head, Link } from '@inertiajs/react';

export default function Settings() {
    return (
        <DriverLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Ajustes
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
            <Head title="Ajustes" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="text-sm text-gray-600">
                            Para ajustar seus dados, use a tela de perfil.
                        </div>
                        <div className="mt-4">
                            <Link
                                href={route('profile.edit')}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Ir para perfil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
