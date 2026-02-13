import AdminLayout from '@/Layouts/AdminLayout';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ document, type }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        title: document.title || '',
        content: document.content || '',
        is_published: document.is_published ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('master.legal.update', type));
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Editar {data.title || 'Documento Legal'}
                </h2>
            }
        >
            <Head title={`Editar ${data.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="title" value="Título" />
                                <TextInput
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    isFocused
                                />
                                <InputError className="mt-2" message={errors.title} />
                            </div>

                            <div>
                                <InputLabel htmlFor="content" value="Conteúdo" />
                                <textarea
                                    id="content"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="20"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                ></textarea>
                                <InputError className="mt-2" message={errors.content} />
                                <p className="mt-1 text-sm text-gray-500">
                                    Use Markdown ou texto simples.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="is_published"
                                    checked={!!data.is_published}
                                    onChange={(e) =>
                                        setData('is_published', e.target.checked)
                                    }
                                />
                                <InputLabel
                                    htmlFor="is_published"
                                    value="Publicado"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.is_published}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Salvar</PrimaryButton>

                                {recentlySuccessful && (
                                    <p className="text-sm text-gray-600">Salvo.</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
