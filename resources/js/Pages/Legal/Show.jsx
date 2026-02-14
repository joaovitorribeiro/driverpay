import AdminLayout from '@/Layouts/AdminLayout';
import DriverLayout from '@/Layouts/DriverLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Show({ document }) {
    const user = usePage().props.auth?.user;
    const isDriver = user?.role === 'driver';

    const DocumentView = () => (
        <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 shadow sm:px-10 sm:py-12">
                    <div className="text-center">
                        <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            <span className="text-emerald-600">Driver</span>{' '}
                            <span className="text-gray-500">Pay</span>
                        </div>
                        <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-gray-900">
                            {document.title}
                        </h1>
                    </div>

                    <div className="mt-10 whitespace-pre-wrap font-serif text-[15px] leading-7 text-gray-900 [text-align:justify]">
                        {document.content}
                    </div>
                </div>
            </div>
        </div>
    );

    const DriverContent = () => (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-white/10 bg-white px-6 py-8 shadow sm:px-10 sm:py-12">
                    <div className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-gray-900 [text-align:justify]">
                        {document.content}
                    </div>
                </div>
            </div>
        </div>
    );

    const AdminContent = () => (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="prose max-w-none whitespace-pre-wrap">
                        {document.content}
                    </div>
                </div>
            </div>
        </div>
    );

    if (!user) {
        return (
            <>
                <Head title={document.title} />
                <DocumentView />
            </>
        );
    }

    if (isDriver) {
        return (
            <DriverLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-white">
                        {document.title}
                    </h2>
                }
            >
                <Head title={document.title} />
                <DriverContent />
            </DriverLayout>
        );
    }

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {document.title}
                </h2>
            }
        >
            <Head title={document.title} />
            <AdminContent />
        </AdminLayout>
    );
}
