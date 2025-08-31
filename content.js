// Add styles for the checkboxes
const style = document.createElement("style");
style.textContent = `
    .ext-checkbox {
        margin-left: 5px;
        transform: scale(1.2);
    }
    .ext-watchlist {
        margin-left: 5px;
        transform: scale(1.2);
        accent-color: #ff6b6b;
    }
`;
document.head.appendChild(style);



function showList(listName, title) {
    const raw = localStorage.getItem(listName);
    if (!raw) {
        alert(`${title} is empty`);
        return;
    }
    
    const data = JSON.parse(raw);
    const items = Object.values(data).filter(item => item.checked);
    
    if (items.length === 0) {
        alert(`${title} is empty`);
        return;
    }
    
    const list = items.map(item => `${item.name} (${item.type})`).join('\n');
    alert(`${title}:\n\n${list}`);
}

// Add single button with dropdown
const mainBtn = document.createElement("button");
mainBtn.textContent = "🤓";
mainBtn.style.cssText = `
    position: fixed;
    top: 60px;
    right: 10px;
    z-index: 999999;
    width: 30px;
    height: 30px;
    background: #333;
    color: white;
    border: 2px solid #000;
    border-radius: 0;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 2px 2px 0 #000;
`;

const dropdown = document.createElement("div");
dropdown.style.cssText = `
    position: fixed;
    top: 95px;
    right: 10px;
    z-index: 999999;
    display: none;
    flex-direction: column;
    gap: 3px;
    background: #333;
    padding: 5px;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #000;
`;

const watchedBtn = document.createElement("button");
watchedBtn.textContent = "Watched";
watchedBtn.style.cssText = `
    padding: 3px 6px;
    background: #4a90e2;
    color: white;
    border: 1px solid #000;
    border-radius: 0;
    cursor: pointer;
    font-size: 9px;
    font-weight: bold;
`;

const watchlistBtn = document.createElement("button");
watchlistBtn.textContent = "Watchlist";
watchlistBtn.style.cssText = `
    padding: 3px 6px;
    background: #ff6b6b;
    color: white;
    border: 1px solid #000;
    border-radius: 0;
    cursor: pointer;
    font-size: 9px;
    font-weight: bold;
`;

const hideWatchedCheckbox = document.createElement("div");
hideWatchedCheckbox.style.cssText = `
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    padding: 3px;
    border-top: 1px solid #555;
`;

const hideWatchedInput = document.createElement("input");
hideWatchedInput.type = "checkbox";
hideWatchedInput.checked = true;
hideWatchedInput.style.cssText = `
    margin: 0;
    cursor: pointer;
`;

const hideWatchedLabel = document.createElement("label");
hideWatchedLabel.textContent = "Hide watched";
hideWatchedLabel.style.cssText = `
    color: white;
    font-size: 9px;
    cursor: pointer;
    margin: 0;
`;

hideWatchedCheckbox.appendChild(hideWatchedInput);
hideWatchedCheckbox.appendChild(hideWatchedLabel);

watchedBtn.onclick = () => showList("watched", "Watched");
watchlistBtn.onclick = () => showList("watchlist", "Watchlist");

function applyHideWatched() {
    const watchedCheckboxes = document.querySelectorAll('.ext-checkbox');
    watchedCheckboxes.forEach(cb => {
        const titleItem = cb.closest('.titleitem');
        if (titleItem) {
            titleItem.style.display = hideWatchedInput.checked && cb.checked ? 'none' : '';
        }
    });
}

hideWatchedInput.onchange = applyHideWatched;

dropdown.appendChild(watchedBtn);
dropdown.appendChild(watchlistBtn);
dropdown.appendChild(hideWatchedCheckbox);

mainBtn.onclick = () => {
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
};

document.body.appendChild(mainBtn);
document.body.appendChild(dropdown);

function saveState(item, checked, list = "watched") {
    const raw = localStorage.getItem(list);
    const data = raw ? JSON.parse(raw) : {};
    data[item.key] = {
        type: item.type,
        id: item.id,
        name: item.name,
        checked: checked
    };
    localStorage.setItem(list, JSON.stringify(data));
}

function restoreState(cb, list = "watched") {
    const raw = localStorage.getItem(list);
    if (!raw) return;
    const data = JSON.parse(raw);
    const key = `${cb.dataset.type}:${cb.dataset.id}:${cb.dataset.name.toLowerCase()}`;
    if (data[key]?.checked) cb.checked = true;
}

function attachCheckbox(a, type, id, name, list = "watched", className = "ext-checkbox") {
    if (a.nextElementSibling?.classList.contains(className)) return;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = className;
    cb.dataset.type = type;
    cb.dataset.id = id;
    cb.dataset.name = name;

    cb.addEventListener("click", ev => {
        ev.stopPropagation();
        const key = `${type}:${id}:${name.toLowerCase()}`;
        saveState({ key, type, id, name }, cb.checked, list);
    });

    a.insertAdjacentElement("afterend", cb);
    restoreState(cb, list);
}


function get_titles() {
    // console.log("scanning...");
    const seen = new Set();
    const rows = [];

    for (const a of document.querySelectorAll('a[href]')) {
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

    // Apply hide logic after new elements are added
    setTimeout(applyHideWatched, 100);

    // console.table(rows);
}


const obs = new MutationObserver(muts => {
    for (const m of muts) {
        for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue; // only elements
            if (n.matches?.('a[href]') || n.querySelector?.('a[href]')) {
                get_titles();
                return;
            }
        }
    }
});
obs.observe(document, { childList: true, subtree: true });

