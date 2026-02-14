import { Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { formatMoneyFromCents } from './formatMoney';

export default function CostsTable({ costs }) {
    const items = costs?.data ?? [];

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
                Nenhum custo cadastrado ainda.
            </div>
        );
    }

    return (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Data
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Descrição
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Motorista
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((cost) => (
                                <tr key={cost.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                        {cost.date}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900">
                                        <div className="font-medium">
                                            {cost.description}
                                        </div>
                                        {cost.notes ? (
                                            <div className="mt-1 text-xs text-gray-500">
                                                {cost.notes}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                                        {formatMoneyFromCents(cost.amount_cents)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {cost.user ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {cost.user.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {cost.user.email}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {cost.can?.update ? (
                                                <Link
                                                    href={route('costs.edit', cost.id)}
                                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Editar
                                                </Link>
                                            ) : null}
                                            {cost.can?.delete ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            !confirm(
                                                                'Apagar este custo? Esta ação é irreversível.',
                                                            )
                                                        ) {
                                                            return;
                                                        }

                                                        router.delete(
                                                            route(
                                                                'costs.destroy',
                                                                cost.id,
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                                preserveState: true,
                                                            },
                                                        );
                                                    }}
                                                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                                                >
                                                    Apagar
                                                </button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 pb-4">
                    <Pagination paginator={costs} variant="light" />
                </div>
            </div>
    );
}
