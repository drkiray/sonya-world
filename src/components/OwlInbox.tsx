import { useEffect, useState } from 'react';
import { Mail, Play } from 'lucide-react';
import { Button, Card, Modal } from './ui';
import { fetchInbox, makeMailboxProof, nextUnread, type InboxMessage } from '../services/inbox';
import { useAppState } from '../state/AppContext';

const URL = import.meta.env.VITE_INBOX_URL as string | undefined;
const SEEN_KEY = 'sonya-owl-inbox-seen-v1';

function loadSeen(): Set<string> {
  try {
    const value = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []);
  } catch { return new Set(); }
}

export function OwlInbox() {
  const botToken = useAppState().meta.telegramBotToken?.trim();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [seen, setSeen] = useState(loadSeen);
  const [alert, setAlert] = useState(false);
  const [opened, setOpened] = useState<InboxMessage | null>(null);
  const [showList, setShowList] = useState(false);
  const unread = nextUnread(messages, seen);

  useEffect(() => {
    if (!URL || !botToken) return;
    let active = true;
    const refresh = () => {
      void makeMailboxProof(botToken).then(proof => fetchInbox(URL, proof))
        .then(items => { if (active) setMessages(items); }).catch(() => {});
    };
    refresh();
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', refresh);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', refresh);
    };
  }, [botToken]);

  useEffect(() => {
    if (unread && !opened && !showList) setAlert(true);
  }, [unread?.id, opened, showList]);

  const openMessage = (message: InboxMessage) => {
    const updated = new Set(seen).add(message.id);
    setSeen(updated);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...updated])); } catch { /* reading still works */ }
    setAlert(false);
    setShowList(false);
    setOpened(message);
  };

  if (!URL || !botToken || messages.length === 0) return null;
  return <>
    <button aria-label="Письма от дяди Ярика" onClick={() => { setAlert(false); setShowList(true); }}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sun text-night shadow-pop">
      <Mail size={25} />
      {unread && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-rosa ring-2 ring-white" />}
    </button>

    {alert && unread && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-night/70 p-5">
      <Card className="w-full max-w-sm p-6 text-center">
        <span className="text-5xl" aria-hidden="true">🦉</span>
        <h2 className="mt-3 text-xl font-black text-ink">Сова принесла вам новое письмо от дяди Ярика</h2>
        <Button size="lg" className="mt-5 w-full" onClick={() => openMessage(unread)}>Посмотреть</Button>
        <button className="mt-3 p-2 text-sm font-bold text-ink/50" onClick={() => setAlert(false)}>Позже</button>
      </Card>
    </div>}

    <Modal open={showList} onClose={() => setShowList(false)} title="Письма от дяди Ярика">
      <div className="max-h-[55vh] space-y-2 overflow-y-auto">
        {[...messages].reverse().map(message => <button key={message.id} onClick={() => openMessage(message)}
          className="flex w-full items-center gap-3 rounded-2xl bg-mist p-3 text-left text-sm font-bold text-ink">
          {message.kind === 'voice' ? <Play size={18} className="shrink-0 text-grape" /> : <Mail size={18} className="shrink-0 text-grape" />}
          <span className="min-w-0 flex-1 truncate">{message.kind === 'voice' ? 'Голосовое сообщение' : message.text}</span>
          {!seen.has(message.id) && <span className="h-2 w-2 shrink-0 rounded-full bg-rosa" />}
        </button>)}
      </div>
    </Modal>

    <Modal open={opened !== null} onClose={() => setOpened(null)} title="Письмо от дяди Ярика">
      {opened?.kind === 'text' && <p className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-base font-semibold text-ink">{opened.text}</p>}
      {opened?.kind === 'voice' && <>
        <p className="mb-3 text-sm font-semibold text-ink/70">Нажми на треугольник, чтобы послушать запись 💜</p>
        <audio key={opened.id} controls preload="none" src={opened.audioUrl} className="w-full" />
      </>}
      <Button className="mt-5 w-full" onClick={() => setOpened(null)}>Закрыть</Button>
    </Modal>
  </>;
}
