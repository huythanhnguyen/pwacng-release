import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";

const storage = new BrowserPersistence();
const SEARCH_AI_SESSION = "search_ai_session";

const readList = () => {
    try { return JSON.parse(storage.getItem(SEARCH_AI_SESSION) || "[]"); } catch { return []; }
};

const writeList = list => storage.setItem(SEARCH_AI_SESSION, JSON.stringify(list));

export const saveToStorage = (title, url) => {
    const item = {
        title,
        url
    };
    const list = readList().filter(item => !(item?.title === title && item?.url === url));
    const updatedList = [item, ...list];

    // Limit to 20 keys maximum, remove oldest if exceeded
    if (updatedList.length > 20) {
        updatedList.splice(20); // Keep only first 20 items
    }

    writeList(updatedList);
    return item;
};

export const getAllSession = () => readList();

export const getLatestSession = () => {
    const list = readList();
    return list[0] || null;
};

export const removeSession = (title, url) => {
    const list = readList().filter(item => !(item?.title === title && item?.url === url));
    writeList(list);
    return list;
};

export const clearAllSession = () => writeList([]);
