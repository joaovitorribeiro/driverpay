import AdminLayout from '@/Layouts/AdminLayout';
import UsersTable from '@/Pages/Users/Partials/UsersTable';
import { Head } from '@inertiajs/react';

export default function UsersIndex({ users, roles, canAssignMaster }) {
    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Usuários
                    </h2>
                    <div className="mt-1 text-sm text-gray-500">
                        Master pode definir cargos e tem permissão de apagar
                        registros.
                    </div>
                </div>
            }
        >
            <Head title="Usuários" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <UsersTable
                        users={users}
                        roles={roles}
                        canAssignMaster={canAssignMaster}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
