export type InboxMessage = {
  id: string;
  kind: 'text' | 'voice';
  text?: string;
  audioUrl?: string;
  createdAt: string;
};

export function parseInbox(value: unknown): InboxMessage[] {
  if (!Array.isArray(value)) throw new Error('Неверный формат почты');
  const ids = new Set<string>();
  const messages = value.map((row): InboxMessage => {
    if (!row || typeof row !== 'object') throw new Error('Неверное письмо');
    const item = row as Record<string, unknown>;
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
        typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) ||
        (item.kind !== 'text' && item.kind !== 'voice')) throw new Error('Неверное письмо');
    ids.add(item.id);
    if (item.kind === 'text' && (typeof item.text !== 'string' || !item.text.trim() || item.text.length > 4000)) {
      throw new Error('Неверный текст письма');
    }
    if (item.kind === 'voice') {
      if (typeof item.audioUrl !== 'string') throw new Error('Неверная запись');
      const url = new URL(item.audioUrl, 'https://example.com/');
      if (url.protocol !== 'https:' || item.audioUrl.startsWith('//')) {
        throw new Error('Неверная ссылка на запись');
      }
    }
    return item as InboxMessage;
  });
  return messages.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export function nextUnread(messages: InboxMessage[], seen: Set<string>): InboxMessage | undefined {
  return messages.find(message => !seen.has(message.id));
}

export async function makeMailboxProof(botToken: string): Promise<string> {
  const bytes = new TextEncoder().encode(`sonya-owl-inbox-v1:${botToken}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function fetchInbox(url: string, proof: string, fetcher: typeof fetch = fetch): Promise<InboxMessage[]> {
  const response = await fetcher(url, { cache: 'no-store', headers: { 'X-Owl-Proof': proof } });
  if (!response.ok) throw new Error('Почта совы пока недоступна');
  return parseInbox(await response.json());
}
