import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: ['src/services/inbox.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { parseInbox, nextUnread, makeMailboxProof, fetchInbox } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const serverCompiled = await build({ entryPoints: ['supabase/functions/_shared/mailbox.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { mailboxProof } = await import(`data:text/javascript;base64,${Buffer.from(serverCompiled.outputFiles[0].text).toString('base64')}`);

test('accepts text and voice messages in chronological order', () => {
  const items = parseInbox([
    { id: '2', kind: 'voice', audioUrl: './inbox/2.ogg', createdAt: '2026-11-23T10:00:00Z' },
    { id: '1', kind: 'text', text: 'Привет, Сонечка!', createdAt: '2026-11-22T10:00:00Z' },
  ]);
  assert.deepEqual(items.map(item => item.id), ['1', '2']);
  assert.equal(nextUnread(items, new Set(['1']))?.id, '2');
});

test('rejects malformed messages and unsafe audio URLs', () => {
  assert.throws(() => parseInbox([{ id: '1', kind: 'voice', audioUrl: 'javascript:alert(1)', createdAt: '2026-11-23T10:00:00Z' }]));
  assert.throws(() => parseInbox([{ id: '1', kind: 'text', text: '', createdAt: '2026-11-23T10:00:00Z' }]));
});

test('fetches private inbox using a proof derived from the saved bot token', async () => {
  const proof = await makeMailboxProof('local-bot-token');
  assert.equal(proof, await mailboxProof('local-bot-token'));
  assert.match(proof, /^[a-f0-9]{64}$/);
  let header;
  const messages = await fetchInbox('https://example.supabase.co/functions/v1/owl-mailbox', proof, async (_url, options) => {
    header = options.headers['X-Owl-Proof'];
    return new Response(JSON.stringify([{ id: '1', kind: 'text', text: 'Привет!', createdAt: '2026-11-23T10:00:00Z' }]));
  });
  assert.equal(header, proof);
  assert.equal(messages[0].text, 'Привет!');
});
