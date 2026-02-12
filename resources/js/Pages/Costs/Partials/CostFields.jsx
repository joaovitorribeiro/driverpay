import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { formatMoneyFromCents } from './formatMoney';

export default function CostFields({ data, setData, errors }) {
    return (
        <div className="space-y-6">
            <div>
                <InputLabel htmlFor="date" value="Data" />
                <TextInput
                    id="date"
                    type="date"
                    name="date"
                    value={data.date}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('date', e.target.value)}
                    required
                />
                <InputError className="mt-2" message={errors.date} />
            </div>

            <div>
                <InputLabel htmlFor="description" value="Descrição" />
                <TextInput
                    id="description"
                    type="text"
                    name="description"
                    value={data.description}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('description', e.target.value)}
                    required
                />
                <InputError className="mt-2" message={errors.description} />
            </div>

            <div>
                <InputLabel htmlFor="amount_cents" value="Valor (centavos)" />
                <TextInput
                    id="amount_cents"
                    type="number"
                    name="amount_cents"
                    value={data.amount_cents}
                    className="mt-1 block w-full"
                    onChange={(e) =>
                        setData('amount_cents', e.target.value)
                    }
                    min="0"
                    required
                />
                <div className="mt-2 text-xs text-gray-500">
                    {formatMoneyFromCents(data.amount_cents)}
                </div>
                <InputError className="mt-2" message={errors.amount_cents} />
            </div>

            <div>
                <InputLabel htmlFor="notes" value="Observações" />
                <textarea
                    id="notes"
                    name="notes"
                    value={data.notes ?? ''}
                    onChange={(e) => setData('notes', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="4"
                />
                <InputError className="mt-2" message={errors.notes} />
            </div>
        </div>
    );
}

