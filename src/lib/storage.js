const KEYS = {
  prospects: 'am777_prospects',
  outreachLogs: 'am777_outreach_logs',
  followups: 'am777_followups',
  deals: 'am777_deals',
  settings: 'am777_settings',
  templates: 'am777_templates'
};

const DEFAULT_SETTINGS = {
  brandName: 'AM777 Automation Solutions',
  ownerName: 'Alecs Mazon',
  defaultCurrency: 'PHP',
  n8nWebhookUrl: ''
};

function loadData(key) {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    if (!raw) return key === 'settings' ? DEFAULT_SETTINGS : [];
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage`, err);
    return key === 'settings' ? DEFAULT_SETTINGS : [];
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage`, err);
    return false;
  }
}

function createItem(key, item) {
  const list = loadData(key);
  const next = [...list, item];
  saveData(key, next);
  return next;
}

function updateItem(key, id, updates) {
  const list = loadData(key);
  const next = list.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
  saveData(key, next);
  return next;
}

function deleteItem(key, id) {
  const list = loadData(key);
  const next = list.filter((entry) => entry.id !== id);
  saveData(key, next);
  return next;
}

function exportData() {
  const bundle = {};
  Object.keys(KEYS).forEach((key) => {
    bundle[key] = loadData(key);
  });
  bundle.exportedAt = new Date().toISOString();
  return bundle;
}

function importData(bundle) {
  Object.keys(KEYS).forEach((key) => {
    if (bundle[key] !== undefined) saveData(key, bundle[key]);
  });
  return true;
}

function clearAllData() {
  Object.values(KEYS).forEach((storageKey) => localStorage.removeItem(storageKey));
}

export { KEYS, DEFAULT_SETTINGS, loadData, saveData, createItem, updateItem, deleteItem, exportData, importData, clearAllData };
