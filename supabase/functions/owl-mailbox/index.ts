import { createClient } from 'npm:@supabase/supabase-js@2';
import { selectBotMessages } from '../_shared/telegram.ts';
import { equalSecrets, mailboxProof, webhookSecret } from '../_shared/mailbox.ts';

const cors = {
  'Access-Control-Allow-Origin': 'https://drkiray.github.io',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Owl-Proof, Content-Type',
  'Cache-Control': 'no-store',
};

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function adminClient() {
  const allSecrets = Deno.env.get('SUPABASE_SECRET_KEYS');
  const secret = allSecrets ? JSON.parse(allSecrets).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const url = Deno.env.get('SUPABASE_URL');
  if (!url || !secret) throw new Error('Supabase environment is incomplete');
  return createClient(url, secret, { auth: { persistSession: false } });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) return respond({ error: 'Mailbox unavailable' }, 503);

  if (request.method === 'GET' && new URL(request.url).searchParams.get('setup') === '1') {
    if (Deno.env.get('YARIK_TELEGRAM_ID')) return respond({ error: 'Setup closed' }, 403);
    const url = Deno.env.get('SUPABASE_URL');
    if (!url) return respond({ error: 'Mailbox unavailable' }, 503);
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: `${url}/functions/v1/owl-mailbox`,
        secret_token: await webhookSecret(token),
        allowed_updates: ['message'], drop_pending_updates: false,
      }),
    });
    const result = await response.json();
    return respond(response.ok && result.ok ? { ok: true } : { error: 'Webhook setup failed' }, response.ok && result.ok ? 200 : 502);
  }

  if (request.method === 'POST') {
    if (!equalSecrets(request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '', await webhookSecret(token))) {
      return respond({ error: 'Forbidden' }, 403);
    }
    const update = await request.json();
    const command = update?.message;
    if (['/id', 'id'].includes(command?.text?.trim().toLowerCase()) && command?.chat?.type === 'private' &&
        Number.isSafeInteger(command?.from?.id) && command.from.id === command.chat.id) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: command.chat.id, text: `Ваш Telegram ID: ${command.from.id}` }),
      });
      return respond({ ok: true });
    }
    const senderId = Number(Deno.env.get('YARIK_TELEGRAM_ID'));
    if (!Number.isSafeInteger(senderId) || senderId <= 0) return respond({ ok: true });
    try {
      const messages = selectBotMessages([update], senderId);
      if (messages.length === 0) return respond({ ok: true });
      const db = adminClient();
      for (const message of messages) {
        let audioPath: string | null = null;
        if (message.kind === 'voice') {
          const fileResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(message.fileId)}`);
          if (!fileResponse.ok) throw new Error('Telegram file lookup failed');
          const file = await fileResponse.json();
          if (!file.ok || typeof file.result?.file_path !== 'string' || file.result.file_size > 5_000_000) {
            throw new Error('Telegram voice is unavailable or too large');
          }
          const voiceResponse = await fetch(`https://api.telegram.org/file/bot${token}/${file.result.file_path}`);
          if (!voiceResponse.ok) throw new Error('Telegram voice download failed');
          const voice = await voiceResponse.arrayBuffer();
          if (voice.byteLength > 5_000_000) throw new Error('Voice is too large');
          audioPath = `voice/${message.id}.ogg`;
          const { error } = await db.storage.from('owl-voice').upload(audioPath, voice, {
            contentType: 'audio/ogg', upsert: true,
          });
          if (error) throw error;
        }
        const { error } = await db.from('owl_letters').upsert({
          id: Number(message.id), kind: message.kind,
          body: message.kind === 'text' ? message.text : null,
          audio_path: audioPath,
          sent_at: message.createdAt,
        });
        if (error) throw error;
      }
      return respond({ ok: true });
    } catch {
      return respond({ error: 'Message could not be saved' }, 500);
    }
  }

  if (request.method !== 'GET') return respond({ error: 'Method not allowed' }, 405);
  if (request.headers.get('Origin') !== 'https://drkiray.github.io') return respond({ error: 'Forbidden' }, 403);
  const proof = request.headers.get('X-Owl-Proof') ?? '';
  if (!equalSecrets(proof, await mailboxProof(token))) return respond({ error: 'Forbidden' }, 403);

  try {
    const db = adminClient();
    const { data, error } = await db.from('owl_letters')
      .select('id,kind,body,audio_path,sent_at')
      .order('sent_at', { ascending: false }).limit(100);
    if (error) throw error;
    const messages = [];
    for (const row of data ?? []) {
      let audioUrl: string | undefined;
      if (row.kind === 'voice') {
        const signed = await db.storage.from('owl-voice').createSignedUrl(row.audio_path, 3600);
        if (signed.error || !signed.data) throw signed.error ?? new Error('Voice signing failed');
        audioUrl = signed.data.signedUrl;
      }
      messages.push({ id: String(row.id), kind: row.kind,
        text: row.kind === 'text' ? row.body : undefined,
        audioUrl, createdAt: row.sent_at });
    }
    return respond(messages);
  } catch {
    return respond({ error: 'Mailbox unavailable' }, 503);
  }
});
