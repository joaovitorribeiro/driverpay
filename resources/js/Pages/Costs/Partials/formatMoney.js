export function formatMoneyFromCents(cents) {
    const value = Number(cents ?? 0) / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

