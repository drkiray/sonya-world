import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: ['supabase/functions/_shared/telegram.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { selectBotMessages } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('accepts only Yarik private text and voice messages', () => {
  const updates = [
    { update_id: 10, message: { from: { id: 7 }, chat: { id: 7, type: 'private' }, date: 1795428000, text: 'Привет, Соня!' } },
    { update_id: 11, message: { from: { id: 8 }, chat: { id: 8, type: 'private' }, date: 1795428001, text: 'Чужое письмо' } },
    { update_id: 12, message: { from: { id: 7 }, chat: { id: -12, type: 'group' }, date: 1795428002, text: 'Из группы' } },
    { update_id: 13, message: { from: { id: 7 }, chat: { id: 7, type: 'private' }, date: 1795428003, voice: { file_id: 'voice-1', file_size: 123 } } },
    { update_id: 14, message: { from: { id: 7 }, chat: { id: 7, type: 'private' }, date: 1795428004, voice: { file_id: 'too-big', file_size: 5_000_001 } } },
  ];
  assert.deepEqual(selectBotMessages(updates, 7), [
    { id: '10', kind: 'text', text: 'Привет, Соня!', createdAt: new Date(1795428000 * 1000).toISOString() },
    { id: '13', kind: 'voice', fileId: 'voice-1', createdAt: new Date(1795428003 * 1000).toISOString() },
  ]);
});
