import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: ['src/services/letters.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const { deliverLetter } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('sends trimmed letter text and subject to the configured form', async () => {
  let submitted;
  await deliverLetter('  Привет, дядя Ярик!  ', 'abcdefgh', async (url, options) => {
    submitted = { url, options };
    return new Response('{"ok":true}', { status: 200 });
  });
  assert.equal(submitted.url, 'https://formspree.io/f/abcdefgh');
  assert.equal(submitted.options.method, 'POST');
  assert.equal(submitted.options.headers.Accept, 'application/json');
  assert.equal(submitted.options.body.get('message'), 'Привет, дядя Ярик!');
  assert.equal(submitted.options.body.get('subject'), 'Письмо от Сони — Мир Сонечки');
  assert.deepEqual([...submitted.options.body.keys()].sort(), ['message', 'subject']);
});

test('rejects blank text before touching the network', async () => {
  let called = false;
  await assert.rejects(deliverLetter('  ', 'abcdefgh', async () => {
    called = true;
    return new Response();
  }), /Напиши хоть пару слов/);
  assert.equal(called, false);
});

test('rejects missing form configuration before touching the network', async () => {
  let called = false;
  await assert.rejects(deliverLetter('Привет', '', async () => {
    called = true;
    return new Response();
  }), /почта.*не настроена/i);
  assert.equal(called, false);
});

test('rejects letters over 2000 characters before touching the network', async () => {
  let called = false;
  await assert.rejects(deliverLetter('а'.repeat(2001), 'abcdefgh', async () => {
    called = true;
    return new Response();
  }), /слишком длинное/i);
  assert.equal(called, false);
});

test('reports service rejection and network failure', async () => {
  await assert.rejects(deliverLetter('Привет', 'abcdefgh', async () => new Response('blocked', { status: 429 })), /позже/i);
  await assert.rejects(deliverLetter('Привет', 'abcdefgh', async () => { throw new TypeError('offline'); }), /интернет/i);
});
