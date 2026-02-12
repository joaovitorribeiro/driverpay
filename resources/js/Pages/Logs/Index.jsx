import MasterLayout from '@/Layouts/MasterLayout';
import { Head, router } from '@inertiajs/react';

function formatBytes(bytes) {
    const value = Number(bytes ?? 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogsIndex({ log }) {
    return (
        <MasterLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Logs
                        </h2>
                        <div className="mt-1 text-sm text-gray-500">
                            Apenas master tem acesso.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.reload({ only: ['log'] })}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Atualizar
                    </button>
                </div>
            }
        >
            <Head title="Logs" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <div className="text-xs font-medium text-gray-500">
                                    Arquivo
                                </div>
                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                    storage/logs/laravel.log
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">
                                    Tamanho
                                </div>
                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                    {log.exists ? formatBytes(log.size) : '—'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">
                                    Atualização
                                </div>
                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                    {log.exists && log.last_modified
                                        ? new Date(
                                              log.last_modified * 1000,
                                          ).toLocaleString('pt-BR')
                                        : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 px-5 py-4 text-sm font-semibold text-gray-900">
                            Últimos trechos (máx. 300 KB)
                        </div>
                        <pre className="max-h-[70vh] overflow-auto bg-gray-950 p-5 text-xs leading-relaxed text-gray-100">
                            {log.exists
                                ? log.content || '(arquivo vazio)'
                                : '(arquivo não encontrado)'}
                        </pre>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
}

