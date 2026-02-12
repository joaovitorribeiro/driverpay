import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MasterLayout({ header, children }) {
    const links = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
        },
        {
            label: 'Custos',
            href: route('costs.index'),
            active: route().current('costs.*'),
        },
        {
            label: 'Usuários',
            href: route('users.index'),
            active: route().current('users.*'),
        },
        {
            label: 'Logs',
            href: route('logs.index'),
            active: route().current('logs.*'),
        },
    ];

    return (
        <AuthenticatedLayout header={header} links={links}>
            {children}
        </AuthenticatedLayout>
    );
}

