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

function getListData(listName) {
    const raw = localStorage.getItem(listName);
    if (!raw) return null;
    return JSON.parse(raw);
}

function getCheckedItems(listName) {
    const data = getListData(listName);
    if (!data) return [];
    return Object.values(data).filter(item => item.checked);
}
