export type BotMessage =
  | { id: string; kind: 'text'; text: string; createdAt: string }
  | { id: string; kind: 'voice'; fileId: string; createdAt: string };

/** Accept only letters from Yarik's private Telegram chat. */
export function selectBotMessages(updates: unknown[], senderId: number): BotMessage[] {
  const selected: BotMessage[] = [];
  for (const raw of updates) {
    if (!raw || typeof raw !== 'object') continue;
    const update = raw as Record<string, unknown>;
    const message = update.message as Record<string, unknown> | undefined;
    const from = message?.from as Record<string, unknown> | undefined;
    const chat = message?.chat as Record<string, unknown> | undefined;
    if (!Number.isSafeInteger(update.update_id) || !message ||
        from?.id !== senderId || chat?.id !== senderId || chat.type !== 'private' ||
        !Number.isSafeInteger(message.date)) continue;
    const id = String(update.update_id);
    const createdAt = new Date(Number(message.date) * 1000).toISOString();
    if (typeof message.text === 'string' && message.text.trim() &&
        !message.text.startsWith('/') && message.text.length <= 4000) {
      selected.push({ id, kind: 'text', text: message.text.trim(), createdAt });
    } else {
      const voice = message.voice as Record<string, unknown> | undefined;
      if (typeof voice?.file_id === 'string' && Number(voice.file_size ?? 0) <= 5_000_000) {
        selected.push({ id, kind: 'voice', fileId: voice.file_id, createdAt });
      }
    }
  }
  return selected;
}
