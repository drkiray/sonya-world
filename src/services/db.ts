// ─── Минимальная promise-обёртка над IndexedDB ─────────────────────────────

const DB_NAME = 'sonya-world';
const DB_VERSION = 1;

export type StoreName =
  | 'meta'
  | 'profile'
  | 'pets'
  | 'collection'
  | 'quests'
  | 'submissions'
  | 'rewards'
  | 'rewardRequests'
  | 'transactions'
  | 'achievements';

const STORES: StoreName[] = [
  'meta',
  'profile',
  'pets',
  'collection',
  'quests',
  'submissions',
  'rewards',
  'rewardRequests',
  'transactions',
  'achievements',
];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idb = {
  async get<T>(store: StoreName, id: string): Promise<T | undefined> {
    return tx(store, 'readonly', (s) => s.get(id) as IDBRequest<T | undefined>);
  },
  async getAll<T>(store: StoreName): Promise<T[]> {
    return tx(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);
  },
  async put<T extends { id: string }>(store: StoreName, value: T): Promise<void> {
    await tx(store, 'readwrite', (s) => s.put(value) as IDBRequest<unknown>);
  },
  async delete(store: StoreName, id: string): Promise<void> {
    await tx(store, 'readwrite', (s) => s.delete(id) as IDBRequest<unknown>);
  },
  async clear(store: StoreName): Promise<void> {
    await tx(store, 'readwrite', (s) => s.clear() as IDBRequest<unknown>);
  },
  /** Атомарная запись нескольких записей в несколько сторов */
  async batch(writes: Array<{ store: StoreName; value: { id: string } }>, deletes: Array<{ store: StoreName; id: string }> = []): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const t = db.transaction([...new Set([...writes.map((w) => w.store), ...deletes.map((d) => d.store)])], 'readwrite');
      for (const w of writes) t.objectStore(w.store).put(w.value);
      for (const d of deletes) t.objectStore(d.store).delete(d.id);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  },
};

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
