import { useEffect, useState } from 'react';
import { Bug, Download, FileUp, KeyRound, PencilLine, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAppState, useUi } from '../../state/AppContext';
import { changePin, importCatalog, resetDemoData, saveTelegramSettings, updateProfile } from '../../services/store';
import { createProgressBackup } from '../../services/backup';
import { backupConfigured, checkBackup, downloadCloudBackup, getBackupStatus, requestBackupCode, subscribeBackupStatus, verifyBackupCode } from '../../services/backupCloud';
import { parseCatalogJson } from '../../services/catalog';
import { Button, Card, Chip, Modal } from '../../components/ui';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export default function ParentSettings() {
  const state = useAppState();
  const { toast } = useUi();
  const { profile } = state;

  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    setInstallEvt(null);
  };

  const downloadBackup = async () => {
    setBackupBusy(true);
    try {
      const json = await createProgressBackup();
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `sonya-world-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast('Резервная копия скачана', 'success');
    } catch {
      toast('Не удалось создать копию. Попробуйте ещё раз.', 'error');
    } finally {
      setBackupBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="divide-y divide-ink/5">
        <button
          className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5"
          onClick={async () => {
            await updateProfile({ soundEnabled: !profile.soundEnabled });
            toast(profile.soundEnabled ? 'Звук выключен' : 'Звук включён', 'success');
          }}
        >
          {profile.soundEnabled ? <Volume2 className="text-grape" size={20} /> : <VolumeX className="text-ink/40" size={20} />}
          <span className="flex-1 text-sm font-black text-ink">Звуковые эффекты</span>
          <Chip className={profile.soundEnabled ? 'bg-green-100 text-green-700' : 'bg-ink/5 text-ink/50'}>
            {profile.soundEnabled ? 'Вкл' : 'Выкл'}
          </Chip>
        </button>

        {installEvt && (
          <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={install}>
            <Download className="text-grape" size={20} />
            <span className="flex-1 text-sm font-black text-ink">Установить приложение на телефон</span>
            <Chip className="bg-sun/25 text-[#8A6100]">PWA</Chip>
          </button>
        )}

        <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setShowImport(true)}>
          <FileUp className="text-grape" size={20} />
          <span className="flex-1 text-sm font-black text-ink">Импорт каталога питомцев</span>
          <span className="text-xs font-bold text-ink/40">JSON</span>
        </button>

        <button
          className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5 disabled:opacity-50"
          onClick={downloadBackup}
          disabled={backupBusy}
        >
          <Download className="shrink-0 text-grape" size={20} />
          <span className="flex-1">
            <span className="block text-sm font-black text-ink">Скачать резервную копию</span>
            <span className="block text-xs font-semibold text-ink/50">Питомцы, монеты и фото. Храните файл у себя.</span>
          </span>
        </button>

        <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setShowPin(true)}>
          <KeyRound className="text-grape" size={20} />
          <span className="flex-1 text-sm font-black text-ink">Сменить PIN-код</span>
        </button>

        <button
          className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5"
          onClick={async () => {
            const devMode = !profile.devMode;
            await updateProfile(devMode ? { devMode, coins: 10000 } : { devMode });
            toast(
              devMode
                ? 'Режим разработчика включён: яйца вылупляются за 1 секунду, на балансе 10000 монет'
                : 'Режим разработчика выключен',
              'success',
            );
          }}
        >
          <Bug className={profile.devMode ? 'text-green-600' : 'text-ink/40'} size={20} />
          <span className="flex-1 text-sm font-black text-ink">Режим разработчика</span>
          <Chip className={profile.devMode ? 'bg-green-100 text-green-700' : 'bg-ink/5 text-ink/50'}>
            {profile.devMode ? 'Вкл' : 'Выкл'}
          </Chip>
        </button>

      <Card className="p-4">
        <p className="flex items-center gap-2 text-sm font-black text-ink">
          <Send size={16} className="text-grape" /> Письма дяде Ярику (Telegram)
        </p>
        <p className="mt-1 text-xs font-semibold text-ink/50">
          Чтобы письма Сони приходили вам в Telegram: создайте бота через @BotFather, вставьте токен
          и ваш chat id (узнать можно через @userinfobot).
        </p>
        <TelegramForm />
      </Card>

        <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setConfirmReset(true)}>
          <Sparkles className="text-ink/40" size={20} />
          <span className="flex-1 text-sm font-black text-ink">Сбросить игру</span>
        </button>
      </Card>

      {backupConfigured() && <CloudBackupCard />}

      <ImportModal open={showImport} onClose={() => setShowImport(false)} />
      <ChangePinModal open={showPin} onClose={() => setShowPin(false)} />

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Сбросить игру?">
        <p className="text-sm font-semibold text-ink/70">
          Все питомцы, задания, монеты и достижения Сони вернутся к самому началу.
          Это действие нельзя отменить.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>Отмена</Button>
          <Button
            variant="danger"
            onClick={async () => {
              await resetDemoData();
              setConfirmReset(false);
              toast('Игра сброшена', 'success');
            }}
          >
            Сбросить
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function CloudBackupCard() {
  const { toast } = useUi();
  const [status, setStatus] = useState(getBackupStatus);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeBackupStatus(() => setStatus(getBackupStatus())), []);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); }
    catch (error) { toast(error instanceof Error ? error.message : 'Ошибка соединения', 'error'); }
    finally { setBusy(false); }
  };

  const download = () => run(async () => {
    const blob = await downloadCloudBackup();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sonya-world-cloud-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  });

  return <Card className="p-4">
    <p className="text-sm font-black text-ink">Облачные копии прогресса</p>
    {status.connected ? <>
      <p className="mt-1 text-xs font-semibold text-ink/60">
        {status.latest ? `Последняя копия: ${status.latest.toLocaleString('ru-RU')}` : 'Копий пока нет'}.
        Новая копия отправится при открытии игры после 7 дней.
      </p>
      {status.error && <p role="alert" className="mt-2 text-xs font-bold text-red-600">Ошибка: {status.error}</p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" disabled={busy || status.busy} onClick={() => run(() => checkBackup(true))}>
          {status.busy ? 'Проверяем…' : 'Создать копию'}
        </Button>
        <Button size="sm" variant="secondary" disabled={busy || !status.latest} onClick={download}>Скачать копию</Button>
      </div>
    </> : <>
      <p className="mt-1 text-xs font-semibold text-ink/60">Взрослому нужно один раз войти по коду из почты. После этого копии будут отправляться сами.</p>
      {status.error && <p role="alert" className="mt-2 text-xs font-bold text-red-600">Ошибка: {status.error}</p>}
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Почта взрослого"
        className="mt-3 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm outline-none focus:border-grape" />
      {codeSent && <input inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} placeholder="Код из письма"
        className="mt-2 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm outline-none focus:border-grape" />}
      <Button size="sm" className="mt-2 w-full" disabled={busy || !email.trim() || (codeSent && !code.trim())}
        onClick={() => run(async () => {
          if (codeSent) { await verifyBackupCode(email, code); toast('Облачные копии подключены', 'success'); }
          else { await requestBackupCode(email); setCodeSent(true); toast('Код отправлен на почту', 'success'); }
        })}>
        {busy ? 'Подождите…' : codeSent ? 'Подключить' : 'Получить код'}
      </Button>
    </>}
  </Card>;
}

function ChangePinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useUi();
  const [pin, setPin] = useState('');

  const save = async () => {
    try {
      await changePin(pin);
      toast('PIN изменён', 'success');
      setPin('');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Ошибка', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Смена PIN-кода">
      <p className="flex items-start gap-2 text-sm font-semibold text-ink/60">
        <PencilLine size={16} className="mt-0.5 shrink-0 text-grape" />
        Введите новый PIN из 4 цифр. Запомните его: восстановить нельзя.
      </p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="••••"
        className="mt-3 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-grape"
      />
      <Button size="lg" className="mt-3 w-full" onClick={save} disabled={pin.length !== 4}>
        Сохранить PIN
      </Button>
    </Modal>
  );
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useUi();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const { items, errors } = parseCatalogJson(text);
      if (items.length === 0) {
        toast(errors[0] ?? 'В файле нет подходящих записей', 'error');
        return;
      }
      const result = await importCatalog(items);
      const parts = [`Добавлено: ${result.added}`];
      if (result.skippedDuplicates) parts.push(`пропущено дубликатов: ${result.skippedDuplicates}`);
      if (result.errors.length) parts.push(`ошибок: ${result.errors.length}`);
      toast(parts.join(', '), result.added > 0 ? 'success' : 'error');
      if (result.added > 0) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Импорт каталога">
      <p className="text-xs font-semibold text-ink/60">
        Вставь JSON-массив записей вида {'{ id, name, rarity, category, description, imageUrl, source, sourceVerified }'}.
        Дубликаты по id и имени будут пропущены.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder='[{"id":"pet-1","name":"Питомец","rarity":"Редкая","category":"Animal","description":"...","imageUrl":null,"source":"Steal an Egg","sourceVerified":false}]'
        className="mt-3 w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 font-mono text-xs outline-none focus:border-grape"
      />
      <Button size="lg" className="mt-3 w-full" onClick={run} disabled={busy || !text.trim()}>
        <FileUp size={16} /> {busy ? 'Импортируем…' : 'Импортировать'}
      </Button>
    </Modal>
  );
}

function TelegramForm() {
  const state = useAppState();
  const { toast } = useUi();
  const [token, setToken] = useState(state.meta.telegramBotToken ?? '');
  const [chatId, setChatId] = useState(state.meta.telegramChatId ?? '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await saveTelegramSettings(token, chatId);
      toast('Настройки Telegram сохранены', 'success');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Токен бота, например 7123456789:AAH…"
        autoComplete="off"
        className="w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 font-mono text-xs outline-none focus:border-grape"
      />
      <input
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        placeholder="Chat id, например 123456789"
        autoComplete="off"
        className="w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 font-mono text-xs outline-none focus:border-grape"
      />
      <Button size="sm" className="w-full" onClick={save} disabled={busy}>
        Сохранить
      </Button>
    </div>
  );
}
