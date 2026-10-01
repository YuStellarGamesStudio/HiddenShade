import { SAVE_VERSION, SAVE_KEY, BACKUP_KEY, SAVE_THROTTLE_MS, RECORD_LIMIT, DEFAULT_SETTINGS, DEFAULT_KEYS } from '../data/settings.js';

let lastWrite = -Infinity;
let timer = null;
let pending = null;
export let storageError = false;

export function createDefaultSave() {
  return { saveVersion: SAVE_VERSION, floor: 1, serial: 1, updatedAt: new Date().toISOString(), records: [], stats: { escapes: 0, catches: 0, detections: 0, hideUses: 0, playTime: 0, highestFloor: 1, bestStars: 0 }, settings: { ...DEFAULT_SETTINGS, keys: { ...DEFAULT_KEYS } } };
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function number(value, name, min = 0, max = Number.MAX_SAFE_INTEGER, integer = true) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) throw new Error(`Invalid ${name}`);
  return value;
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('Invalid timestamp');
  return new Date(value).toISOString();
}
function decode(raw) {
  const bytes = Uint8Array.from(atob(raw.replace(/\s/g, '')), char => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
export function parseSave(raw) {
  let value;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) throw new Error('Empty save');
    try { value = JSON.parse(text.startsWith('{') ? text : decode(text)); }
    catch { throw new Error('Invalid save data'); }
  } else value = raw;
  if (!object(value)) throw new Error('Invalid save');
  const version = value.saveVersion ?? 0;
  if (version !== 0 && version !== SAVE_VERSION) throw new Error('Unsupported save version');
  if (version === 0) {
    if (!Object.hasOwn(value, 'floor') || !Object.hasOwn(value, 'serial')) throw new Error('Incomplete legacy save');
    const defaults = createDefaultSave();
    value = { ...defaults, ...value, saveVersion: SAVE_VERSION, stats: { ...defaults.stats, ...value.stats }, settings: { ...defaults.settings, ...value.settings, keys: { ...defaults.settings.keys, ...value.settings?.keys } } };
  }
  if (!object(value.stats) || !object(value.settings) || !object(value.settings.keys) || !Array.isArray(value.records)) throw new Error('Incomplete save');
  const result = { saveVersion: SAVE_VERSION, floor: number(value.floor, 'floor', 1), serial: number(value.serial, 'serial', 1), updatedAt: date(value.updatedAt), records: [], stats: {}, settings: { keys: {} } };
  for (const key of ['escapes', 'catches', 'detections', 'hideUses']) result.stats[key] = number(value.stats[key], key);
  result.stats.playTime = number(value.stats.playTime, 'playTime', 0, Number.MAX_SAFE_INTEGER, false);
  result.stats.highestFloor = number(value.stats.highestFloor, 'highestFloor', 1);
  if (version === 0) result.stats.highestFloor = Math.max(result.stats.highestFloor,result.floor);
  result.stats.bestStars = number(value.stats.bestStars, 'bestStars', 0, 3);
  if (!['zh', 'en', 'ja'].includes(value.settings.language)) throw new Error('Invalid language');
  result.settings.language = value.settings.language;
  for (const key of ['music', 'sfx']) {
    if (typeof value.settings[key] !== 'boolean') throw new Error(`Invalid ${key}`);
    result.settings[key] = value.settings[key];
  }
  for (const key of ['masterVolume', 'musicVolume', 'sfxVolume']) result.settings[key] = number(value.settings[key], key, 0, 1, false);
  for (const key of Object.keys(DEFAULT_KEYS)) {
    const code = value.settings.keys[key];
    if (typeof code !== 'string' || !/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Escape|Enter|Tab|Backspace|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Bracket(Left|Right)|Semicolon|Quote|Comma|Period|Slash|Backslash|Minus|Equal|Backquote)$/.test(code)) throw new Error(`Invalid key: ${key}`);
    result.settings.keys[key] = code;
  }
  if (new Set(Object.values(result.settings.keys)).size !== Object.keys(DEFAULT_KEYS).length) throw new Error('Duplicate key bindings');
  result.records = value.records.map(record => {
    if (!object(record)) throw new Error('Invalid record');
    return { floor: number(record.floor, 'record floor', 1), stars: number(record.stars, 'record stars', 1, 3), elapsed: number(record.elapsed, 'record elapsed', 0, Number.MAX_SAFE_INTEGER, false), detections: number(record.detections, 'record detections'), hideUses: number(record.hideUses, 'record hideUses'), at: date(record.at) };
  }).slice(-RECORD_LIMIT);
  return result;
}
export function exportSave(save) { return JSON.stringify(parseSave(save), null, 2); }
export function encodeSave(save) {
  const bytes = new TextEncoder().encode(exportSave(save));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function store(save) {
  try { localStorage.setItem(SAVE_KEY, exportSave(save)); lastWrite = Date.now(); storageError = false; return true; }
  catch { storageError = true; return false; }
}
export function persistSave(save, { force = false } = {}) {
  // Snapshot now: callers may mutate live statistics before the trailing write.
  try { pending = parseSave(save); pending.updatedAt = new Date().toISOString(); }
  catch { storageError = true; return false; }
  if (force || Date.now() - lastWrite >= SAVE_THROTTLE_MS) {
    clearTimeout(timer); timer = null;
    const next = pending; pending = null;
    return store(next);
  }
  clearTimeout(timer);
  timer = setTimeout(() => { timer = null; const next = pending; pending = null; if (next) store(next); }, Math.max(0, SAVE_THROTTLE_MS - (Date.now() - lastWrite)));
  return !storageError;
}
export function readBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? parseSave(raw) : null;
  } catch { storageError = true; return null; }
}
export function restoreBackup() {
  const save = readBackup();
  // Keep readable progress available even when repairing the primary slot fails.
  if (save) persistSave(save, { force: true });
  return save;
}
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try { const save = parseSave(raw); storageError = false; return save; }
      catch { const backup = restoreBackup(); if (backup) return backup; storageError = true; return createDefaultSave(); }
    }
    return restoreBackup() ?? createDefaultSave();
  } catch { storageError = true; return createDefaultSave(); }
}
export function importSave(candidate, current) {
  const next = parseSave(candidate);
  const backup = exportSave(current);
  clearTimeout(timer); timer = null; pending = null;
  try {
    // Never replace the active slot unless its recoverable predecessor is safe.
    localStorage.setItem(BACKUP_KEY, backup);
    localStorage.setItem(SAVE_KEY, exportSave(next));
    storageError = false; lastWrite = Date.now();
    return next;
  } catch { storageError = true; throw new Error('Storage unavailable'); }
}
export function exportFile(save) {
  const url = URL.createObjectURL(new Blob([exportSave(save)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = `hiddenshade-floor-${save.floor}.json`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), SAVE_THROTTLE_MS);
}
