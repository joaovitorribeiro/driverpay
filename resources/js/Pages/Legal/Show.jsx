import AdminLayout from '@/Layouts/AdminLayout';
import DriverLayout from '@/Layouts/DriverLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show({ document }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const Content = () => (
        <div className="py-12">
            <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <div className="prose max-w-none whitespace-pre-wrap">
                        {document.content}
                    </div>
                </div>
            </div>
        </div>
    );

    if (user) {
        // Se for motorista usa DriverLayout, caso contrário (master/admin) usa AdminLayout
        const Layout = user.roles && user.roles.some(r => r.name === 'driver') 
            ? DriverLayout 
            : (user.role === 'driver' ? DriverLayout : AdminLayout); // Fallback caso roles não venha formatado como esperado, checando propriedade direta se existir

        // Nota: O objeto user pode variar dependendo de como é serializado (se tem roles array ou atributo role).
        // Assumindo que a verificação de role no AdminLayout usava user.role, vou manter compatibilidade.
        // Se user.role for 'master' ou 'admin', usa AdminLayout.

        const ActualLayout = (user.role === 'driver') ? DriverLayout : AdminLayout;

        return (
            <ActualLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {document.title}
                    </h2>
                }
            >
                <Head title={document.title} />
                <Content />
            </ActualLayout>
        );
    }

    // Public Layout
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={document.title} />
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Link href={route('login')} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                                Entrar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {document.title}
                    </h2>
                </div>
            </header>

            <main>
                <Content />
            </main>
        </div>
    );
}
