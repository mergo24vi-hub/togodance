import events from './events.js';
import {
    fmtDateUA, relativeLabel,
    compareEventsByDateThenId, groupByDate
} from './date-utils.js';
import {
    registerDefaultHelpers, renderTemplate
} from './tpl/engine.js';

const app = document.getElementById('app');

const state = {
    expandedId: null,
    events
};

// 1) Хелпери для шаблонізатора (1 раз)
registerDefaultHelpers({ fmtDateUA, relativeLabel });

// 2) Підготовка даних під шаблон
function buildViewModel() {
    const sorted = [...state.events].sort(compareEventsByDateThenId);
    const grouped = groupByDate(sorted);

    const groups = grouped.map(([date, items]) => ({
        date,
        rel: relativeLabel(date),
        items: items.map(it => ({
            ...it,
            expanded: state.expandedId === it.id
        }))
    }));

    return { groups };
}

// 3) Рендер через Handlebars
async function render() {
    const html = await renderTemplate('list', buildViewModel(), { baseUrl: './templates' });
    app.innerHTML = html;

    // Не прокручувати, якщо картка і так у видимій зоні
    if (state.expandedId) {
        const target = document.getElementById(`card-${state.expandedId}`);
        if (target) {
            const rect = target.getBoundingClientRect();
            const visible = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
            if (!visible) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// 4) Делегування подій (клік/клавіші на рядку)
app.addEventListener('click', (e) => {
    const btn = e.target.closest('.row-btn');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    toggleExpanded(id);
});

app.addEventListener('keydown', (e) => {
    const btn = e.target.closest('.row-btn');
    if (!btn) return;
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        toggleExpanded(id);
    }
});

/**
 * Відкриває/закриває картку.
 * - Звичайний режим: перемикач + оновлення location.hash
 * - fromHash:true: форсовано встановлює конкретний id (без перемикача та без зміни hash)
 */
function toggleExpanded(id, { fromHash = false } = {}) {
    if (fromHash) {
        if (state.expandedId !== id) {
            state.expandedId = id;
            render();
        }
        return;
    }
    state.expandedId = (state.expandedId === id) ? null : id;
    location.hash = state.expandedId ? `#id-${state.expandedId}` : '';
    render();
}

// 5) Хеш-навігація (не викликаємо повторно на той самий id)
function openFromHash() {
    const m = location.hash.match(/^#id-(\d+)$/);
    if (m) {
        const id = Number(m[1]);
        if (state.events.some(e => e.id === id) && state.expandedId !== id) {
            toggleExpanded(id, { fromHash: true });
        }
    }
}
window.addEventListener('hashchange', openFromHash);

// 6) Старт
render().then(openFromHash);
