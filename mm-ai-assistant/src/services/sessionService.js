const SESSION_KEY = "ai_session_ids";

const readIds = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeIds = (ids) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(ids));
};

const uuidv4 = () => {
  if (crypto?.randomUUID) return crypto.randomUUID();
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const h = Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export const createNewSessionId = (prefix = "mmvn") => {
  const id = `${prefix}_${uuidv4()}`;
  const list = readIds();
  const updatedList = [id, ...list];

  // Limit to 20 keys maximum, remove oldest if exceeded
  if (updatedList.length > 20) {
    updatedList.splice(20); // Keep only first 20 items
  }

  writeIds(updatedList);
  return id;
};

export const getAllSessionIds = () => readIds();

export const getLatestSessionId = () => {
  const list = readIds();
  return list[0] || null;
};

export const removeSessionId = (id) => {
  const list = readIds().filter((x) => x !== id);
  writeIds(list);
  return list;
};

export const clearAllSessionIds = () => writeIds([]);

