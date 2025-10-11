import events from './events.js';

const fmtDateUA = (iso) =>
    new Intl.DateTimeFormat('uk-UA', {day: 'numeric', month: 'long'})
        .format(new Date(iso));

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function relativeLabel(iso) {
    const d = startOfDay(new Date(iso)), t = startOfDay(new Date());
    const diff = Math.round((d - t) / 86400000);
    if (diff === 0) return 'сьогодні';
    if (diff === 1) return 'завтра';
    if (diff === 2) return 'післязавтра';
    return '';
}

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

// ---- стан ----
const state = {expandedId: null, events};

// ---- рендер ----
const app = document.getElementById('app');

function renderSection(date, items) {
    const section = el('section', {className: 'section'});
    const rel = relativeLabel(date);
    const hdr = el('div', {className: 'date-header'}, [
        fmtDateUA(date),
        rel ? el('span', {className: 'badge'}, [`• ${rel}`]) : ''
    ]);
    const list = el('div', {className: 'wrap'});

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
                if (e.key === 'Enter') setExpanded(it.id);
            }
        }, [
            el('div', {className: 'left'}, [
                el('div', {className: 'date muted'}, [`ID ${it.id}`]),
                el('div', {className: 'brief'}, [it.brief]),
            ]),
            el('span', {className: `chev ${isExpanded ? 'expanded' : ''}`, 'aria-hidden': 'true'}, ['▶'])
        ]);

        const card = el('div', {className: 'item', id: `card-${it.id}`}, [btn]);
        if (isExpanded) {
            card.append(el('div', {className: 'full', id: `full-${it.id}`}, [it.fulltext]));
        }
        list.append(card);
    }

    section.append(hdr, list);
    return section;
}

function groupByDate(items) {
    const map = new Map();
    for (const it of items) {
        const key = it.event_date || 'невідома дата';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(it);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => (Date.parse(a) || 0) - (Date.parse(b) || 0));
}

function render() {
    app.innerHTML = '';

    if (!state.events.length) {
        app.append(el('div', {className: 'wrap'}, [
            el('div', {className: 'muted'}, ['Подій поки немає.'])
        ]));
        return;
    }

    const sorted = [...state.events].sort((a, b) => {
        const ta = Date.parse(a.event_date) || 0;
        const tb = Date.parse(b.event_date) || 0;
        return (ta - tb) || ((a.id ?? 0) - (b.id ?? 0));
    });

    const grouped = groupByDate(sorted);
    for (const [date, items] of grouped) {
        app.append(renderSection(date, items));
    }
}

function setExpanded(id, {fromHash = false} = {}) {
    state.expandedId = (state.expandedId === id) ? null : id;
    if (!fromHash) {
        location.hash = state.expandedId ? `#id-${state.expandedId}` : '';
    }
    render();
    if (state.expandedId) {
        document.getElementById(`card-${state.expandedId}`)
            ?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
}

// ---- завантаження JSON ----
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
            setExpanded(id, {fromHash: true});
        }
    }
}

window.addEventListener('hashchange', openFromHash);

// ---- старт ----
loadEvents();
