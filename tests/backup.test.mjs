import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: ['src/services/backup.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const { makeProgressBackup } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

const stores = [
  'meta', 'profile', 'pets', 'collection', 'quests', 'submissions',
  'rewards', 'rewardRequests', 'transactions', 'achievements',
];

test('exports every existing store without changing records', async () => {
  const profile = { id: 'main', coins: 725, level: 4, avatarPhoto: 'data:image/jpeg;base64,abc' };
  const pet = { id: 'pet-1', name: 'Сова', photo: 'data:image/jpeg;base64,def' };
  const records = { profile: [profile], pets: [pet], meta: [{ id: 'main', lettersSent: 3 }] };
  const seen = [];

  const json = await makeProgressBackup(async (store) => {
    seen.push(store);
    return records[store] ?? [];
  }, new Date('2026-11-21T10:00:00.000Z'));

  assert.deepEqual(seen, stores);
  const backup = JSON.parse(json);
  assert.equal(backup.format, 'sonya-world-indexeddb');
  assert.equal(backup.version, 1);
  assert.equal(backup.exportedAt, '2026-11-21T10:00:00.000Z');
  assert.deepEqual(Object.keys(backup.stores), stores);
  assert.deepEqual(backup.stores.profile, [profile]);
  assert.deepEqual(backup.stores.pets, [pet]);
  assert.deepEqual(backup.stores.meta, records.meta);
});

test('refuses to create a partial backup if a store cannot be read', async () => {
  await assert.rejects(makeProgressBackup(async (store) => {
    if (store === 'pets') throw new Error('IndexedDB unavailable');
    return [];
  }), /IndexedDB unavailable/);
});
