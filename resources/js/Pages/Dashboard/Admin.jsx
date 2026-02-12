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

export default function AdminDashboard({ metrics, latest }) {
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Dashboard
                        </h2>
                        <div className="mt-1 text-sm text-gray-500">
                            Admin: visão operacional (sem apagar registros).
                        </div>
                    </div>
                    <Link
                        href={route('costs.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Novo custo
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard (Admin)" />

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

                    <div className="rounded-xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                                Últimos lançamentos
                            </div>
                            <Link
                                href={route('costs.index')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                Ver tudo
                            </Link>
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

