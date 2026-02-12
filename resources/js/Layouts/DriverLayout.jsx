import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DriverLayout({ header, children }) {
    const links = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
        },
        {
            label: 'Meus custos',
            href: route('costs.index'),
            active: route().current('costs.*'),
        },
    ];

    return (
        <AuthenticatedLayout header={header} links={links}>
            {children}
        </AuthenticatedLayout>
    );
}

