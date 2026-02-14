import Pagination from '@/Components/Pagination';
import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function UsersTable({
    users,
    roles,
    canAssignMaster,
    canManageRoles,
}) {
    const rows = users?.data ?? [];
    const initial = useMemo(() => {
        const map = {};
        rows.forEach((u) => {
            map[u.id] = u.role ?? '';
        });
        return map;
    }, [rows]);

    const [selected, setSelected] = useState(initial);
    const [proDays, setProDays] = useState({});

    const handleAddProDays = (userId) => {
        const days = proDays[userId];
        if (!days || days <= 0) return;

        router.post(
            route('users.pro_days.add', userId),
            { days: parseInt(days) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProDays((prev) => ({ ...prev, [userId]: '' }));
                },
            }
        );
    };

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
                            {canAssignMaster && (
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    PRO
                                </th>
                            )}
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
                                        disabled={!canManageRoles}
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
                                {canAssignMaster && (
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="text-xs text-gray-600">
                                                {u.pro_days_remaining > 0 ? (
                                                    <span className="text-green-600 font-semibold">
                                                        {u.pro_days_remaining} dias restantes
                                                        <br />
                                                        (até {u.pro_bonus_until})
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Sem PRO ativo</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Dias"
                                                    className="w-20 rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={proDays[u.id] || ''}
                                                    onChange={(e) =>
                                                        setProDays((prev) => ({
                                                            ...prev,
                                                            [u.id]: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddProDays(u.id)}
                                                    disabled={!proDays[u.id]}
                                                    className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-300"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        disabled={
                                            !canManageRoles ||
                                            (selected[u.id] ?? '') ===
                                            (u.role ?? '')
                                        }
                                        onClick={() =>
                                            router.put(
                                                route('users.role.update', u.id),
                                                { role: selected[u.id] },
                                                { preserveScroll: true, preserveState: true },
                                            )
                                        }
                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                    >
                                        Salvar Cargo
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 pb-4">
                <Pagination paginator={users} variant="light" />
            </div>
        </div>
    );
}
