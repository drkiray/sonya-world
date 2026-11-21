import { BACKUP_STORES, makeProgressBackup } from './backup';
import { idb, type StoreName } from './db';

const WEEK = 7 * 24 * 60 * 60 * 1000;
const DIRECTORY = 'sonya-world-backups';
const PREFIX = 'backup-';
const KEEP = 8;

export type ProgressBackup = {
  format: 'sonya-world-indexeddb';
  version: 1;
  exportedAt: string;
  stores: Record<StoreName, { id: string; [key: string]: unknown }[]>;
};

export function parseProgressBackup(json: string): ProgressBackup {
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new Error('Неверный файл копии'); }
  if (!value || typeof value !== 'object') throw new Error('Неверный файл копии');
  const backup = value as Partial<ProgressBackup>;
  if (backup.format !== 'sonya-world-indexeddb' || backup.version !== 1 ||
      typeof backup.exportedAt !== 'string' || !Number.isFinite(Date.parse(backup.exportedAt)) ||
      !backup.stores || typeof backup.stores !== 'object') throw new Error('Неверный формат копии');
  for (const name of BACKUP_STORES) {
    const records = backup.stores[name];
    if (!Array.isArray(records)) throw new Error('Неполная копия прогресса');
    const ids = new Set<string>();
    for (const record of records) {
      if (!record || typeof record !== 'object' || Array.isArray(record) ||
          typeof record.id !== 'string' || !record.id || ids.has(record.id)) {
        throw new Error('Повреждённая копия прогресса');
      }
      ids.add(record.id);
    }
  }
  if (!backup.stores.profile.some(row => row.id === 'main') ||
      !backup.stores.meta.some(row => row.id === 'main')) throw new Error('Неполная копия прогресса');
  const profile = backup.stores.profile.find(row => row.id === 'main')!;
  if (typeof profile.childName !== 'string' || !profile.childName ||
      typeof profile.coins !== 'number' || !Number.isFinite(profile.coins) ||
      typeof profile.level !== 'number' || !Number.isFinite(profile.level) ||
      typeof profile.xp !== 'number' || !Number.isFinite(profile.xp)) {
    throw new Error('Повреждённая копия прогресса');
  }
  return backup as ProgressBackup;
}

export interface LocalBackupStorage {
  latest(): Promise<Date | null>;
  write(json: string, at: Date): Promise<void>;
}

export async function createLocalBackupIfDue(
  storage: LocalBackupStorage,
  readAll: (store: StoreName) => Promise<unknown[]> = store => idb.getAll(store),
  now: Date = new Date(),
  force = false,
): Promise<boolean> {
  const latest = await storage.latest();
  if (!force && latest && now.getTime() - latest.getTime() < WEEK) return false;
  const json = await makeProgressBackup(readAll, now);
  parseProgressBackup(json);
  await storage.write(json, now);
  return true;
}

export async function restoreProgressBackup(
  json: string,
  saveSafetyCopy: () => Promise<unknown>,
  replace: (backup: ProgressBackup) => Promise<void>,
): Promise<void> {
  const backup = parseProgressBackup(json);
  await saveSafetyCopy();
  await replace(backup);
}

function requireStorage(): StorageManager & { getDirectory(): Promise<FileSystemDirectoryHandle> } {
  if (!navigator.storage?.getDirectory) throw new Error('Автокопии не поддерживаются этим браузером');
  return navigator.storage as StorageManager & { getDirectory(): Promise<FileSystemDirectoryHandle> };
}

async function directory(): Promise<FileSystemDirectoryHandle> {
  const root = await requireStorage().getDirectory();
  return root.getDirectoryHandle(DIRECTORY, { create: true });
}

async function files(): Promise<Array<{ name: string; date: Date }>> {
  const dir = await directory();
  const found: Array<{ name: string; date: Date }> = [];
  const entries = dir as FileSystemDirectoryHandle & { entries(): AsyncIterable<[string, FileSystemHandle]> };
  for await (const [name, handle] of entries.entries()) {
    if (handle.kind !== 'file' || !name.startsWith(PREFIX) || !name.endsWith('.json')) continue;
    const file = await dir.getFileHandle(name).then(h => h.getFile());
    if (file.size > 0) found.push({ name, date: new Date(file.lastModified) });
  }
  return found.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const phoneBackupStorage: LocalBackupStorage = {
  async latest() { return (await files())[0]?.date ?? null; },
  async write(json, at) {
    const dir = await directory();
    const name = `${PREFIX}${at.toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID()}.json`;
    const handle = await dir.getFileHandle(name, { create: true });
    const writer = await handle.createWritable();
    try { await writer.write(json); await writer.close(); }
    catch (error) { await writer.abort(); throw error; }
    const saved = await handle.getFile();
    if (saved.size !== new Blob([json]).size || await saved.text() !== json) {
      await dir.removeEntry(name);
      throw new Error('Не удалось проверить локальную копию');
    }
    const all = await files();
    for (const old of all.slice(KEEP)) await dir.removeEntry(old.name);
  },
};

export async function listPhoneBackups(): Promise<Array<{ name: string; date: Date }>> {
  return files();
}

export async function readPhoneBackup(name: string): Promise<string> {
  if (!/^backup-[\w-]+\.json$/.test(name)) throw new Error('Неверное имя копии');
  const handle = await (await directory()).getFileHandle(name);
  return (await handle.getFile()).text();
}

export function preserveParentPin(backup: ProgressBackup, currentMeta?: { parentPin?: string }): void {
  const incoming = backup.stores.meta.find(row => row.id === 'main');
  if (incoming && currentMeta?.parentPin) incoming.parentPin = currentMeta.parentPin;
}

export async function restoreFromJson(json: string): Promise<void> {
  await restoreProgressBackup(json, () => createLocalBackupIfDue(phoneBackupStorage, undefined, new Date(), true), async backup => {
    const currentMeta = await idb.get<{ id: string; parentPin?: string }>('meta', 'main');
    preserveParentPin(backup, currentMeta);
    await idb.replaceAll(backup.stores);
  });
}

export type LocalBackupStatus = { latest: Date | null; busy: boolean; error: string | null };
let status: LocalBackupStatus = { latest: null, busy: false, error: null };
let currentCheck: Promise<void> | null = null;
const EVENT = 'sonya-local-backup-status';

export function getLocalBackupStatus(): LocalBackupStatus { return { ...status }; }

export function subscribeLocalBackupStatus(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

function setStatus(patch: Partial<LocalBackupStatus>) {
  status = { ...status, ...patch };
  window.dispatchEvent(new Event(EVENT));
}

export function checkLocalBackup(): Promise<void> {
  if (currentCheck) return currentCheck;
  currentCheck = (async () => {
    setStatus({ busy: true, error: null });
    try {
      await createLocalBackupIfDue(phoneBackupStorage);
      setStatus({ latest: await phoneBackupStorage.latest() });
    } catch (error) {
      setStatus({ error: error instanceof Error ? error.message : 'Не удалось создать копию' });
    } finally {
      setStatus({ busy: false });
    }
  })().finally(() => { currentCheck = null; });
  return currentCheck;
}

export function startLocalBackupChecks(): void {
  void checkLocalBackup();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkLocalBackup();
  });
}
