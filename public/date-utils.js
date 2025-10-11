// date-utils.js — реалізація на dayjs (легкий варіант)
import dayjs from 'https://esm.sh/dayjs@1';
import 'https://esm.sh/dayjs@1/locale/uk';
import localizedFormat from 'https://esm.sh/dayjs@1/plugin/localizedFormat';
import isSameOrAfter from 'https://esm.sh/dayjs@1/plugin/isSameOrAfter';
import isSameOrBefore from 'https://esm.sh/dayjs@1/plugin/isSameOrBefore';

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale('uk'); // глобально українська

/** Формат дня-місяця українською: 9 жовтня */
export function fmtDateUA(iso) {
    const d = dayjs(iso);
    return d.isValid() ? d.format('D MMMM') : String(iso ?? '');
}

/** “сьогодні/завтра/післязавтра” */
export function relativeLabel(iso, { today = dayjs() } = {}) {
    const d = dayjs(iso);
    if (!d.isValid()) return '';
    const diff = d.startOf('day').diff(dayjs(today).startOf('day'), 'day');
    if (diff === 0) return 'сьогодні';
    if (diff === 1) return 'завтра';
    if (diff === 2) return 'післязавтра';
    return '';
}

/** Порівняння двох подій за датою, потім за id (для sort) */
export function compareEventsByDateThenId(a, b) {
    const ta = dayjs(a.event_date).valueOf() || 0;
    const tb = dayjs(b.event_date).valueOf() || 0;
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
    // сортуємо за реальною датою; невалідні — в кінець (timestamp=0)
    return Array.from(map.entries())
        .sort(([a], [b]) => (dayjs(a).valueOf() || 0) - (dayjs(b).valueOf() || 0));
}
