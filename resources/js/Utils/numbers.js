export function parseLocaleNumber(value, options = {}) {
    const maxDecimals =
        typeof options.maxDecimals === 'number' ? options.maxDecimals : 2;

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (value === null || value === undefined) {
        return 0;
    }

    let s = String(value).trim();
    if (!s) return 0;

    s = s.replace(/[^\d,.\-]/g, '');
    if (!s) return 0;

    const negative = s.startsWith('-');
    s = s.replace(/-/g, '');

    const commaPositions = [];
    const dotPositions = [];

    for (let i = 0; i < s.length; i += 1) {
        if (s[i] === ',') commaPositions.push(i);
        if (s[i] === '.') dotPositions.push(i);
    }

    const hasComma = commaPositions.length > 0;
    const hasDot = dotPositions.length > 0;

    const resolveDecimalSeparator = () => {
        if (hasComma && hasDot) {
            return commaPositions[commaPositions.length - 1] >
                dotPositions[dotPositions.length - 1]
                ? ','
                : '.';
        }

        if (hasComma) {
            const last = commaPositions[commaPositions.length - 1];
            const digitsAfter = s.length - last - 1;
            if (digitsAfter <= 0) return null;
            if (digitsAfter <= maxDecimals) return ',';
            return null;
        }

        if (hasDot) {
            const last = dotPositions[dotPositions.length - 1];
            const digitsAfter = s.length - last - 1;
            if (digitsAfter <= 0) return null;
            if (digitsAfter <= maxDecimals) return '.';
            return null;
        }

        return null;
    };

    const decimalSep = resolveDecimalSeparator();

    if (!decimalSep) {
        const num = Number(s.replace(/[.,]/g, ''));
        if (!Number.isFinite(num)) return 0;
        return negative ? -num : num;
    }

    const lastIndex = s.lastIndexOf(decimalSep);
    const before = s.slice(0, lastIndex).replace(/[.,]/g, '');
    const after = s.slice(lastIndex + 1).replace(/[.,]/g, '');

    const normalized = `${before}.${after}`;
    const num = Number(normalized);
    if (!Number.isFinite(num)) return 0;
    return negative ? -num : num;
}

export function parseMoneyToCents(value) {
    const num = parseLocaleNumber(value, { maxDecimals: 2 });
    if (!Number.isFinite(num)) return 0;
    return Math.round(num * 100);
}

export function formatPtBrDecimal(value, decimals = 2) {
    const num = Number(value);
    const safe = Number.isFinite(num) ? num : 0;
    return safe.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatMoneyInput(value) {
    if (value === null || value === undefined) return '';
    const cents = parseMoneyToCents(value);
    return formatPtBrDecimal(cents / 100, 2);
}

function normalizeNumericInput(raw) {
    if (raw === null || raw === undefined) return '';
    let s = String(raw);
    s = s.replace(/[^\d,.\-]/g, '');
    if (!s) return '';

    const negative = s.startsWith('-');
    s = s.replace(/-/g, '');

    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');

    let decimalSep = null;
    if (lastComma >= 0 && lastDot >= 0) {
        decimalSep = lastComma > lastDot ? ',' : '.';
    } else if (lastComma >= 0) {
        decimalSep = ',';
    } else if (lastDot >= 0) {
        decimalSep = '.';
    }

    if (!decimalSep) {
        s = s.replace(/[.,]/g, '');
        return (negative ? '-' : '') + s;
    }

    const idx = s.lastIndexOf(decimalSep);
    const before = s.slice(0, idx).replace(/[.,]/g, '');
    const after = s.slice(idx + 1).replace(/[.,]/g, '');
    return (negative ? '-' : '') + before + decimalSep + after;
}

export function sanitizeDecimalInput(raw, maxDecimals = 2) {
    const s = normalizeNumericInput(raw);
    if (!s) return '';
    const withComma = s.replace('.', ',');
    const [intPart, decPart] = withComma.split(',');
    const dec = typeof decPart === 'string' ? decPart.slice(0, maxDecimals) : undefined;
    if (dec === undefined) return intPart;
    return `${intPart},${dec}`;
}

export function sanitizeMoneyInput(raw) {
    return sanitizeDecimalInput(raw, 2);
}
