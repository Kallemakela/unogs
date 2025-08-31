function formatTitle(name, type) {
    // Convert kebab-case to Title Case
    const formattedName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    // Capitalize type
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    
    return `${formattedName} (${formattedType})`;
}

function showList(listName, title) {
    const items = getCheckedItems(listName);
    
    if (items.length === 0) {
        alert(`${title} is empty`);
        return;
    }
    
    const list = items.map(item => formatTitle(item.name, item.type)).join('\n');
    
    const modal = document.createElement("div");
    modal.className = "ext-modal";
    
    const modalContent = document.createElement("div");
    modalContent.className = "ext-modal-content";
    
    const modalTitle = document.createElement("h3");
    modalTitle.textContent = title;
    modalTitle.className = "ext-modal-title";
    
    const textarea = document.createElement("textarea");
    textarea.value = list;
    textarea.className = "ext-modal-textarea";
    
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.className = "ext-modal-close-btn";
    
    closeBtn.onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    };
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(textarea);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    textarea.focus();
    textarea.select();
}

function createUI() {
    const mainBtn = document.createElement("button");
    mainBtn.textContent = "🤓";
    mainBtn.className = "ext-main-btn";

    const dropdown = document.createElement("div");
    dropdown.className = "ext-dropdown";

    const watchedBtn = document.createElement("button");
    watchedBtn.textContent = "Watched";
    watchedBtn.className = "ext-watched-btn";

    const watchlistBtn = document.createElement("button");
    watchlistBtn.textContent = "Watchlist";
    watchlistBtn.className = "ext-watchlist-btn";

    const hideWatchedCheckbox = document.createElement("div");
    hideWatchedCheckbox.className = "ext-hide-watched-container";

    const hideWatchedInput = document.createElement("input");
    hideWatchedInput.type = "checkbox";
    hideWatchedInput.checked = false;
    hideWatchedInput.className = "ext-hide-watched-input";

    const hideWatchedLabel = document.createElement("label");
    hideWatchedLabel.textContent = "Hide watched";
    hideWatchedLabel.className = "ext-hide-watched-label";

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
    
    return { applyHideWatched };
}

function attachCheckbox(a, type, id, name, list = "watched", className = "ext-checkbox") {
    // Check if checkbox already exists
    if (a.nextElementSibling?.classList.contains(className)) return;
    
    // Check if we already have 2 checkboxes (watched + watchlist)
    const existingCheckboxes = a.parentElement.querySelectorAll('.ext-checkbox, .ext-watchlist');
    if (existingCheckboxes.length >= 2) return;

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
