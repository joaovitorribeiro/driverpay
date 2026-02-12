import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function UsersTable({ users, roles, canAssignMaster }) {
    const rows = users?.data ?? [];
    const initial = useMemo(() => {
        const map = {};
        rows.forEach((u) => {
            map[u.id] = u.role ?? '';
        });
        return map;
    }, [rows]);

    const [selected, setSelected] = useState(initial);

    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
                Nenhum usuário encontrado.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                Usuário
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                Cargo
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {rows.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">
                                        {u.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {u.email}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={selected[u.id] ?? ''}
                                        onChange={(e) =>
                                            setSelected((prev) => ({
                                                ...prev,
                                                [u.id]: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="" disabled>
                                            Selecione…
                                        </option>
                                        {roles.map((role) => (
                                            <option
                                                key={role}
                                                value={role}
                                                disabled={
                                                    role === 'master' &&
                                                    !canAssignMaster
                                                }
                                            >
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        disabled={
                                            (selected[u.id] ?? '') ===
                                            (u.role ?? '')
                                        }
                                        onClick={() =>
                                            router.put(
                                                route('users.role.update', u.id),
                                                { role: selected[u.id] },
                                            )
                                        }
                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                    >
                                        Salvar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

