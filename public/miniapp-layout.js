// miniapp-layout.js
// Відповідає за: висоту контейнера, реакцію на зміну розміру, інтеграцію з Telegram WebApp.

(function initMiniAppLayout() {
    // Якщо всередині Telegram — готовність і "розширення" контейнера
    if (window.Telegram && Telegram.WebApp) {
        try {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
        } catch (_) {}
    }

    function setVh() {
        // Стабільна висота для вебв’ю/мобільних контейнерів
        const h = Math.max(window.innerHeight || 0, 300);
        document.documentElement.style.setProperty('--vh', h + 'px');
    }

    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
})();

// Опційна утиліта: підлаштовує Leaflet при зміні розміру/завантаженні
export function attachMapInvalidate(map) {
    const invalidate = () => map && map.invalidateSize();
    window.addEventListener('resize', invalidate);
    window.addEventListener('load', () => setTimeout(invalidate, 0));
}
