import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: ['src/services/db.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { idb } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

const names = ['meta', 'profile', 'pets', 'collection', 'quests', 'submissions', 'rewards', 'rewardRequests', 'transactions', 'achievements'];
const empty = () => Object.fromEntries(names.map(name => [name, []]));

test('restore replaces every store, including records removed since the snapshot', async () => {
  await idb.put('pets', { id: 'old', name: 'old pet' });
  const rows = empty();
  rows.meta = [{ id: 'main', parentPin: '1234' }];
  rows.profile = [{ id: 'main', coins: 42 }];
  rows.pets = [{ id: 'new', name: 'new pet' }];
  await idb.replaceAll(rows);
  assert.deepEqual(await idb.getAll('pets'), rows.pets);
  assert.deepEqual(await idb.getAll('profile'), rows.profile);
});

test('invalid last record aborts all changes and retains previous progress', async () => {
  const rows = empty();
  rows.profile = [{ id: 'main', coins: 0 }];
  rows.achievements = [{ broken: true }];
  await assert.rejects(idb.replaceAll(rows));
  assert.deepEqual(await idb.getAll('profile'), [{ id: 'main', coins: 42 }]);
  assert.deepEqual(await idb.getAll('pets'), [{ id: 'new', name: 'new pet' }]);
});
