import { idb, type StoreName } from './db';

const BACKUP_STORES: StoreName[] = [
  'meta', 'profile', 'pets', 'collection', 'quests', 'submissions',
  'rewards', 'rewardRequests', 'transactions', 'achievements',
];

/** Read-only export of every IndexedDB object store; no migration or writes. */
export async function makeProgressBackup(
  readAll: (store: StoreName) => Promise<unknown[]>,
  now: Date = new Date(),
): Promise<string> {
  const stores = {} as Record<StoreName, unknown[]>;
  for (const name of BACKUP_STORES) stores[name] = await readAll(name);
  return JSON.stringify({
    format: 'sonya-world-indexeddb',
    version: 1,
    exportedAt: now.toISOString(),
    stores,
  });
}

export function createProgressBackup(): Promise<string> {
  return makeProgressBackup((store) => idb.getAll(store));
}
