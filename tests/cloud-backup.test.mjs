import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: ['src/services/weeklyBackup.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { makeCloudSnapshot, syncWeeklyBackup } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('cloud snapshot keeps progress and omits credentials without changing IndexedDB records', async () => {
  const meta = { id: 'main', parentPin: '1234', telegramBotToken: 'secret', telegramChatId: '123', lettersSent: 5 };
  const stores = { meta: [meta], profile: [{ id: 'main', coins: 42 }], pets: [{ id: 'p1', photo: 'data:image/jpeg;base64,abc' }] };
  const snapshot = JSON.parse(await makeCloudSnapshot(async name => stores[name] ?? [], new Date('2026-11-21T10:00:00Z')));
  assert.deepEqual(snapshot.stores.meta, [{ id: 'main', lettersSent: 5 }]);
  assert.deepEqual(snapshot.stores.profile, stores.profile);
  assert.deepEqual(snapshot.stores.pets, stores.pets);
  assert.equal(meta.parentPin, '1234');
});

test('weekly backup uploads on first run and after seven days, but not earlier', async () => {
  const uploaded = [];
  const remote = { latest: async () => uploaded.at(-1)?.date ?? null, upload: async (name, json) => uploaded.push({ name, json, date: new Date('2026-11-21T10:00:00Z') }) };
  const readAll = async () => [];
  const now = new Date('2026-11-21T10:00:00Z');
  assert.equal((await syncWeeklyBackup(remote, readAll, now)).uploaded, true);
  assert.equal((await syncWeeklyBackup(remote, readAll, now)).uploaded, false);
  assert.equal(uploaded.length, 1);
  assert.equal((await syncWeeklyBackup(remote, readAll, new Date('2026-11-28T10:00:00Z'))).uploaded, true);
  assert.equal(uploaded.length, 2);
});

test('failed upload never reports a successful copy', async () => {
  const remote = { latest: async () => null, upload: async () => { throw new Error('offline'); } };
  await assert.rejects(syncWeeklyBackup(remote, async () => [], new Date('2026-11-21T10:00:00Z')), /offline/);
});
