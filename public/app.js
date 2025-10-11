import events from './events.js';
import {
    fmtDateUA,
    relativeLabel,
    compareEventsByDateThenId,
    groupByDate,
} from './date-utils.js';

// ---- стан ----
const state = { expandedId: null, events };

// ---- рендер ----
const app = document.getElementById('app');

function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function')
            node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) node.append(c);
    return node;
}

function renderSection(date, items) {
    const section = el('section', { className: 'section' });
    const rel = relativeLabel(date);
    const hdr = el('div', { className: 'date-header' }, [
        fmtDateUA(date),
        rel ? el('span', { className: 'badge' }, [`• ${rel}`]) : ''
    ]);
    const list = el('div', { className: 'wrap' });

    for (const it of items) {
        const isExpanded = state.expandedId === it.id;
        const btn = el('button', {
            className: 'row-btn',
            role: 'button',
            'aria-expanded': String(isExpanded),
            'aria-controls': `full-${it.id}`,
            id: `row-${it.id}`,
            onClick: () => setExpanded(it.id),
            onKeydown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpanded(it.id);
                }
            }
        }, [
            el('div', { className: 'left' }, [
                el('div', { className: 'date muted' }, [`ID ${it.id}`]),
                el('div', { className: 'brief' }, [it.brief]),
            ]),
            el('span', { className: `chev ${isExpanded ? 'expanded' : ''}`, 'aria-hidden': 'true' }, ['▶'])
        ]);

        const card = el('div', { className: 'item', id: `card-${it.id}` }, [btn]);
        if (isExpanded) {
            card.append(el('div', { className: 'full', id: `full-${it.id}` }, [it.fulltext]));
        }
        list.append(card);
    }

    section.append(hdr, list);
    return section;
}

function render() {
    app.innerHTML = '';

    if (!state.events.length) {
        app.append(el('div', { className: 'wrap' }, [
            el('div', { className: 'muted' }, ['Подій поки немає.'])
        ]));
        return;
    }

    const sorted = [...state.events].sort(compareEventsByDateThenId);
    const grouped = groupByDate(sorted);
    for (const [date, items] of grouped) {
        app.append(renderSection(date, items));
    }
}

function setExpanded(id, { fromHash = false } = {}) {
    state.expandedId = (state.expandedId === id) ? null : id;
    if (!fromHash) {
        location.hash = state.expandedId ? `#id-${state.expandedId}` : '';
    }
    render();
    if (state.expandedId) {
        const target = document.getElementById(`card-${state.expandedId}`);
        if (target) {
            const rect = target.getBoundingClientRect();
            const fullyVisible = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
            if (!fullyVisible) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ---- “завантаження” (у тебе дані імпортуються як ESM) ----
async function loadEvents() {
    render();
    openFromHash();
}

// ---- хеш-навігація ----
function openFromHash() {
    const m = location.hash.match(/^#id-(\d+)$/);
    if (m) {
        const id = Number(m[1]);
        if (state.events.some(e => e.id === id)) {
            setExpanded(id, { fromHash: true });
        }
    }
}
window.addEventListener('hashchange', openFromHash);

// ---- старт ----
loadEvents();
