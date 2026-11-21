import { idb, type StoreName } from './db';
import { makeProgressBackup } from './backup';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export interface BackupRemote {
  latest(): Promise<Date | null>;
  upload(name: string, json: string): Promise<void>;
}

/** Creates a read-only snapshot. Secrets remain in IndexedDB but never enter the cloud file. */
export function makeCloudSnapshot(
  readAll: (store: StoreName) => Promise<unknown[]>,
  now: Date = new Date(),
): Promise<string> {
  return makeProgressBackup(async (store) => {
    const rows = await readAll(store);
    if (store !== 'meta') return rows;
    return rows.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const { parentPin: _pin, telegramBotToken: _token, telegramChatId: _chat, ...safe } = row as Record<string, unknown>;
      return safe;
    });
  }, now);
}

export async function syncWeeklyBackup(
  remote: BackupRemote,
  readAll: (store: StoreName) => Promise<unknown[]> = (store) => idb.getAll(store),
  now: Date = new Date(),
  force = false,
): Promise<{ uploaded: boolean; latest: Date | null }> {
  const latest = await remote.latest();
  if (!force && latest && now.getTime() - latest.getTime() < WEEK) return { uploaded: false, latest };
  const json = await makeCloudSnapshot(readAll, now);
  const name = `${now.toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID()}.json`;
  await remote.upload(name, json);
  return { uploaded: true, latest: now };
}
