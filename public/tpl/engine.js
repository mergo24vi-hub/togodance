// Підключаємо Handlebars як ES-модуль через ESM-CDN (CJS→ESM)
// Якщо потрібно, можна замінити на jspm.dev
import Handlebars from 'https://esm.sh/handlebars@4.7.8?bundle';

// Кеш скомпільованих шаблонів
const tplCache = new Map();

/** Реєстрація дефолтних хелперів (можеш викликати 1 раз на старті) */
export function registerDefaultHelpers({ fmtDateUA, relativeLabel } = {}) {
    if (!Handlebars.helpers.fmtDateUA) {
        Handlebars.registerHelper('fmtDateUA', (iso) => fmtDateUA?.(iso) ?? String(iso));
    }
    if (!Handlebars.helpers.relative) {
        Handlebars.registerHelper('relative', (iso) => relativeLabel?.(iso) ?? '');
    }
    if (!Handlebars.helpers.eq) {
        Handlebars.registerHelper('eq', (a, b) => a === b);
    }
    if (!Handlebars.helpers.json) {
        Handlebars.registerHelper('json', (ctx) => JSON.stringify(ctx));
    }
}

/** Завантажити й скомпілювати шаблон .hbs з кешем */
export async function loadTemplate(name, { baseUrl = './templates' } = {}) {
    if (tplCache.has(name)) return tplCache.get(name);
    const url = `${baseUrl}/${name}.hbs`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Не вдалося завантажити шаблон: ${name} (HTTP ${res.status})`);
    const src = await res.text();
    const fn = Handlebars.compile(src);
    tplCache.set(name, fn);
    return fn;
}

/** Рендер обраного шаблону з контекстом */
export async function renderTemplate(name, context, opts) {
    const fn = await loadTemplate(name, opts);
    return fn(context);
}
