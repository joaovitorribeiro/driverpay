import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoneyFromCents } from '@/Pages/Costs/Partials/formatMoney';
import { Head, Link } from '@inertiajs/react';

function StatCard({ title, value, subtitle }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-sm font-medium text-gray-500">{title}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
                {value}
            </div>
            {subtitle ? (
                <div className="mt-2 text-xs text-gray-500">{subtitle}</div>
            ) : null}
        </div>
    );
}

function DriversTable({ drivers }) {
    const items = drivers?.items ?? [];

    const formatDate = (iso) => {
        if (!iso) return '-';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('pt-BR');
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                    <div className="text-sm font-semibold text-gray-900">
                        Motoristas
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Visão completa: Pro, expiração e status por usuário
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={route('users.index')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        Ver usuários
                    </Link>
                </div>
            </div>

            <div className="grid gap-3 border-b border-gray-200 px-5 py-4 sm:grid-cols-4">
                <StatCard title="Total" value={drivers?.total ?? 0} />
                <StatCard title="Pro" value={drivers?.pro ?? 0} />
                <StatCard title="Gratuito" value={drivers?.free ?? 0} />
                <StatCard title="Expira em 7d" value={drivers?.expiring_7d ?? 0} />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">
                                Motorista
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">
                                Plano
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">
                                Expira
                            </th>
                            <th className="px-5 py-3 text-right font-semibold text-gray-700">
                                Dias
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.length ? (
                            items.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-gray-900">
                                            {u.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {u.email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={
                                                (u.plan === 'pro'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-gray-100 text-gray-700') +
                                                ' inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold'
                                            }
                                        >
                                            {u.plan === 'pro'
                                                ? 'Pro'
                                                : 'Gratuito'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">
                                        {u.plan === 'pro' && u.pro_source === 'manual'
                                            ? 'Sem expiração'
                                            : formatDate(u.expires_at)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                        {u.plan === 'pro' && u.pro_source === 'manual'
                                            ? '—'
                                            : u.days_remaining ?? '—'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    className="px-5 py-8 text-sm text-gray-600"
                                    colSpan={4}
                                >
                                    Nenhum motorista encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function MasterDashboard({ metrics, latest, drivers }) {
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Dashboard
                        </h2>
                        <div className="mt-1 text-sm text-gray-500">
                            Master: visão completa + logs + exclusões.
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('logs.index')}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                        >
                            Logs
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard (Master)" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="Total hoje"
                            value={formatMoneyFromCents(
                                metrics.today_total_cents,
                            )}
                            subtitle="Somatório dos custos do dia"
                        />
                        <StatCard
                            title="Total do mês"
                            value={formatMoneyFromCents(
                                metrics.month_total_cents,
                            )}
                            subtitle="Somatório desde o início do mês"
                        />
                        <StatCard
                            title="Lançamentos no mês"
                            value={metrics.month_count}
                            subtitle="Quantidade de custos no mês"
                        />
                    </div>

                    {drivers ? <DriversTable drivers={drivers} /> : null}

                    <div className="rounded-xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                                Últimos lançamentos
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {(latest ?? []).length ? (
                                latest.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.description}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {item.date}
                                                {item.user
                                                    ? ` • ${item.user.name}`
                                                    : ''}
                                            </div>
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            {formatMoneyFromCents(
                                                item.amount_cents,
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-8 text-sm text-gray-600">
                                    Nenhum lançamento ainda.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
