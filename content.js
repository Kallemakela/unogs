const { applyHideWatched } = createUI();

function get_titles() {
    const seen = new Set();
    const rows = [];

    // Only process links that match our specific format
    for (const a of document.querySelectorAll('a[href*="/movie/"], a[href*="/series/"]')) {
        let u;
        try { u = new URL(a.getAttribute('href'), location.href); }
        catch { continue; }

        const m = u.pathname.match(/^\/(movie|series)\/(\d+)\/([^/?#]+)/);
        if (!m) continue;

        const [, type, id, rawName] = m;
        const name = decodeURIComponent(rawName);
        const key = `${type}:${id}:${name.toLowerCase()}`;

        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ type, id, name });

        attachCheckbox(a, type, id, name, "watched", "ext-checkbox");
        attachCheckbox(a, type, id, name, "watchlist", "ext-watchlist");
    }

    setTimeout(applyHideWatched, 100);
}

// Observe DOM changes
const obs = new MutationObserver(muts => {
    for (const m of muts) {
        for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue;
            if (n.matches?.('a[href]') || n.querySelector?.('a[href]')) {
                get_titles();
                return;
            }
        }
    }
});
obs.observe(document, { childList: true, subtree: true });

