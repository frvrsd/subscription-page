export function convertBytes(
    bytes: number,
    options: { decimals?: number; useBinaryUnits?: boolean } = {},
): string {
    const { useBinaryUnits = true, decimals = 2 } = options;

    if (decimals < 0) {
        throw new Error(`Invalid decimals ${decimals}`);
    }

    if (!Number.isFinite(bytes) || bytes < 0) {
        throw new Error(`Invalid bytes ${bytes}`);
    }

    if (bytes === 0) {
        return '0 Б';
    }

    const base = useBinaryUnits ? 1024 : 1000;
    // Russian labels: binary GiB-style sizes shown as Гб / Мб / Кб
    const units = ['Б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб', 'Эб', 'Зб', 'Йб'];

    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);

    return `${(bytes / Math.pow(base, i)).toFixed(decimals)} ${units[i]}`;
}

const ENGLISH_UNIT_RE =
    /\b(YiB|ZiB|EiB|PiB|TiB|GiB|MiB|KiB|YB|ZB|EB|PB|TB|GB|MB|KB|Bytes?)\b/gi;

const ENGLISH_TO_RUSSIAN: Record<string, string> = {
    yib: 'Йб',
    zib: 'Зб',
    eib: 'Эб',
    pib: 'Пб',
    tib: 'Тб',
    gib: 'Гб',
    mib: 'Мб',
    kib: 'Кб',
    yb: 'Йб',
    zb: 'Зб',
    eb: 'Эб',
    pb: 'Пб',
    tb: 'Тб',
    gb: 'Гб',
    mb: 'Мб',
    kb: 'Кб',
    byte: 'Б',
    bytes: 'Б',
};

/**
 * Remnawave header templates look like:
 *   `- {{TRAFFIC_LEFT}} | {{TOTAL_TRAFFIC}}`
 * → `- 12.5 GiB | 100 GiB`
 *
 * Maps every English/IEC unit in the string to Russian (Гб, Мб, …).
 * Unlimited plans (`- 0 | 0`) become `- ∞ | ∞`.
 * Raw byte counts (digits only) are formatted via convertBytes.
 */
export function toRussianTrafficLabel(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return trimmed;
    }

    // Unlimited: both TRAFFIC_LEFT and TOTAL_TRAFFIC are 0 → `- ∞ | ∞`
    if (isUnlimitedTrafficHeader(trimmed)) {
        return trimmed.replace(/\d+(?:[.,]\d+)?/g, '∞');
    }

    if (/^\d+([.,]\d+)?$/.test(trimmed)) {
        return convertBytes(parseFloat(trimmed.replace(',', '.')));
    }

    return trimmed.replace(ENGLISH_UNIT_RE, (unit) => ENGLISH_TO_RUSSIAN[unit.toLowerCase()] ?? unit);
}

/**
 * Unlimited Remnawave plans render both placeholders as `0` (e.g. `- 0 | 0`).
 */
export function isUnlimitedTrafficHeader(value: string): boolean {
    const nums = [...value.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) =>
        parseFloat(m[0].replace(',', '.')),
    );
    return nums.length > 0 && nums.every((n) => n === 0);
}
