import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: ['src/services/localBackup.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { parseProgressBackup, createLocalBackupIfDue, restoreProgressBackup, phoneBackupStorage, listPhoneBackups, readPhoneBackup, preserveParentPin } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

const names = ['meta', 'profile', 'pets', 'collection', 'quests', 'submissions', 'rewards', 'rewardRequests', 'transactions', 'achievements'];
const rows = Object.fromEntries(names.map(name => [name, []]));
rows.meta = [{ id: 'main', parentPin: '1234', schemaVersion: 1, seededAt: '2026-11-01T00:00:00Z' }];
rows.profile = [{ id: 'main', childName: 'Соня', coins: 42, level: 3, xp: 8 }];
const snapshot = JSON.stringify({ format: 'sonya-world-indexeddb', version: 1, exportedAt: '2026-11-21T10:00:00.000Z', stores: rows });

test('rejects incomplete or malformed snapshots before restore', () => {
  assert.throws(() => parseProgressBackup('{}'), /копи/i);
  assert.throws(() => parseProgressBackup(JSON.stringify({ ...JSON.parse(snapshot), stores: { ...rows, pets: undefined } })), /копи/i);
  assert.throws(() => parseProgressBackup(JSON.stringify({ ...JSON.parse(snapshot), stores: { ...rows, pets: [{ name: 'Без id' }] } })), /копи/i);
  assert.throws(() => parseProgressBackup(JSON.stringify({ ...JSON.parse(snapshot), stores: { ...rows, profile: [{ id: 'main', coins: 'много' }] } })), /копи/i);
  assert.equal(parseProgressBackup(snapshot).stores.profile[0].coins, 42);
});

test('restore keeps the current parent PIN, even when an older copy has another PIN', () => {
  const backup = parseProgressBackup(snapshot);
  preserveParentPin(backup, { id: 'main', parentPin: '9876' });
  assert.equal(backup.stores.meta[0].parentPin, '9876');
});

test('creates first snapshot and another only after seven days', async () => {
  const files = [];
  const storage = { latest: async () => files.at(-1)?.date ?? null, write: async (json, date) => files.push({ json, date }) };
  const readAll = async name => rows[name];
  const day = new Date('2026-11-21T10:00:00Z');
  assert.equal(await createLocalBackupIfDue(storage, readAll, day), true);
  assert.equal(await createLocalBackupIfDue(storage, readAll, new Date('2026-11-27T10:00:00Z')), false);
  assert.equal(await createLocalBackupIfDue(storage, readAll, new Date('2026-11-28T10:00:00Z')), true);
  assert.equal(files.length, 2);
});

test('restore saves current data before replacing and leaves it alone when safety copy fails', async () => {
  const calls = [];
  await restoreProgressBackup(snapshot, async () => calls.push('safe'), async data => { calls.push(data.stores.profile[0].coins); });
  assert.deepEqual(calls, ['safe', 42]);
  await assert.rejects(restoreProgressBackup(snapshot, async () => { throw new Error('disk full'); }, async () => calls.push('replace')));
  assert.deepEqual(calls, ['safe', 42]);
});

test('phone storage writes a readable snapshot file without an adult prompt', async () => {
  const saved = new Map();
  const dir = {
    async getFileHandle(name, options = {}) {
      if (!saved.has(name) && !options.create) throw new Error('missing');
      if (!saved.has(name)) saved.set(name, { content: '', modified: Date.now() });
      return {
        async getFile() {
          const entry = saved.get(name);
          return { size: new Blob([entry.content]).size, lastModified: entry.modified, text: async () => entry.content };
        },
        async createWritable() {
          let pending = '';
          return { write: async value => { pending = value; }, close: async () => {
            saved.set(name, { content: pending, modified: Date.now() });
          }, abort: async () => {} };
        },
      };
    },
    async *entries() { for (const name of saved.keys()) yield [name, { kind: 'file' }]; },
    async removeEntry(name) { saved.delete(name); },
  };
  globalThis.navigator = { storage: { getDirectory: async () => ({ getDirectoryHandle: async () => dir }) } };
  await phoneBackupStorage.write(snapshot, new Date());
  const file = (await listPhoneBackups())[0];
  assert.ok(file.name.endsWith('.json'));
  assert.equal(await readPhoneBackup(file.name), snapshot);
});
