// Утиліти для дат (без залежностей)

/** Початок доби для заданої дати */
export function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

/** Безпечний parse ISO-рядка → timestamp (або 0, якщо невалідно) */
export function safeParseDate(iso) {
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : 0;
}

/** Різниця в днях між двома датами (d2 - d1), обрубуючи час до початку доби */
export function diffInDays(d1, d2) {
    const a = startOfDay(d1).getTime();
    const b = startOfDay(d2).getTime();
    return Math.round((b - a) / 86400000);
}

/** “сьогодні / завтра / післязавтра” для ISO-дати */
export function relativeLabel(iso, { today = new Date() } = {}) {
    const diff = diffInDays(today, new Date(iso));
    if (diff === 0) return 'сьогодні';
    if (diff === 1) return 'завтра';
    if (diff === 2) return 'післязавтра';
    return '';
}

/** Формат дня-місяця українською: 9 жовтня */
export function fmtDateUA(iso) {
    return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' })
        .format(new Date(iso));
}

/** Порівняння двох подій за датою, потім за id (для sort) */
export function compareEventsByDateThenId(a, b) {
    const ta = safeParseDate(a.event_date);
    const tb = safeParseDate(b.event_date);
    return (ta - tb) || ((a.id ?? 0) - (b.id ?? 0));
}

/** Групування подій за датою (ISO), відсортовано за зростанням дати */
export function groupByDate(items) {
    const map = new Map();
    for (const it of items) {
        const key = it.event_date || 'невідома дата';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(it);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => safeParseDate(a) - safeParseDate(b));
}
