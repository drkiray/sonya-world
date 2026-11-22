import { useEffect, useState } from 'react';
import { Bug, Download, FileUp, KeyRound, PencilLine, RotateCw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAppState, useUi } from '../../state/AppContext';
import { changePin, importCatalog, resetDemoData, updateProfile } from '../../services/store';
import { createProgressBackup } from '../../services/backup';
import { checkLocalBackup, getLocalBackupStatus, listPhoneBackups, parseProgressBackup, readPhoneBackup, restoreFromJson, subscribeLocalBackupStatus } from '../../services/localBackup';
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
  const [updateBusy, setUpdateBusy] = useState(false);

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

  const updateGame = async () => {
    if (!navigator.onLine) { toast('Нужен интернет для обновления', 'error'); return; }
    setUpdateBusy(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        let reloaded = false;
        const reload = () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        };
        navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
        await registration.update();
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(reload, 3000);
      } else {
        window.location.reload();
      }
    } catch {
      setUpdateBusy(false);
      toast('Не удалось проверить обновление. Попробуйте ещё раз.', 'error');
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

        <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5 disabled:opacity-50"
          onClick={updateGame} disabled={updateBusy}>
          <RotateCw className="shrink-0 text-grape" size={20} />
          <span className="flex-1 text-sm font-black text-ink">{updateBusy ? 'Проверяем обновление…' : 'Обновить игру'}</span>
        </button>

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

        <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setConfirmReset(true)}>
          <Sparkles className="text-ink/40" size={20} />
          <span className="flex-1 text-sm font-black text-ink">Сбросить игру</span>
        </button>
      </Card>

      <LocalBackupCard />

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

function LocalBackupCard() {
  const { toast } = useUi();
  const [status, setStatus] = useState(getLocalBackupStatus);
  const [files, setFiles] = useState<Array<{ name: string; date: Date }>>([]);
  const [candidate, setCandidate] = useState<{ json: string; date: string; coins: number; pets: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStatus(getLocalBackupStatus());
      void listPhoneBackups().then(setFiles).catch(() => setFiles([]));
    };
    refresh();
    return subscribeLocalBackupStatus(refresh);
  }, []);

  const prepare = async (read: () => Promise<string>) => {
    try {
      const json = await read();
      const backup = parseProgressBackup(json);
      setCandidate({ json, date: new Date(backup.exportedAt).toLocaleString('ru-RU'),
        coins: Number(backup.stores.profile.find(row => row.id === 'main')?.coins ?? 0),
        pets: backup.stores.pets.length });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Не удалось открыть копию', 'error');
    }
  };

  return <Card className="p-4">
    <p className="text-sm font-black text-ink">Автокопии на этом телефоне</p>
    <p className="mt-1 text-xs font-semibold text-ink/60">
      Игра сохраняет копию при первом открытии и затем раз в 7 дней. Эти файлы находятся внутри Chrome;
      при очистке данных сайта или потере телефона они исчезнут.
    </p>
    <p className="mt-2 text-xs font-bold text-ink/70">
      {status.busy ? 'Создаём копию…' : status.latest ? `Последняя копия: ${status.latest.toLocaleString('ru-RU')}` : 'Копий пока нет'}
    </p>
    {status.error && <p role="alert" className="mt-1 text-xs font-bold text-red-600">Ошибка: {status.error}</p>}
    <Button size="sm" variant="secondary" className="mt-3 w-full" disabled={status.busy || busy} onClick={() => void checkLocalBackup()}>
      Проверить копии
    </Button>
    {files.length > 0 && <div className="mt-3 space-y-2">
      <p className="text-xs font-black text-ink">Восстановить из копии:</p>
      {files.map(file => <button key={file.name} className="w-full rounded-xl bg-mist px-3 py-2 text-left text-sm font-bold text-grape"
        onClick={() => void prepare(() => readPhoneBackup(file.name))}>{file.date.toLocaleString('ru-RU')}</button>)}
    </div>}
    <label className="mt-3 block cursor-pointer rounded-xl border-2 border-grape/20 px-3 py-3 text-center text-sm font-bold text-grape">
      Выбрать файл копии
      <input type="file" accept=".json,application/json" className="sr-only" onChange={event => {
        const file = event.target.files?.[0];
        if (file) void prepare(() => file.text());
        event.target.value = '';
      }} />
    </label>
    <Modal open={candidate !== null} onClose={() => setCandidate(null)} title="Восстановить прогресс?">
      <p className="text-sm font-semibold text-ink/70">
        Копия от {candidate?.date}: {candidate?.coins} монет, {candidate?.pets} питомцев.
        Текущий прогресс будет заменён. Перед этим игра сохранит его страховочную копию.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setCandidate(null)}>Отмена</Button>
        <Button variant="danger" disabled={busy} onClick={async () => {
          if (!candidate) return;
          setBusy(true);
          try { await restoreFromJson(candidate.json); window.location.reload(); }
          catch (error) { toast(error instanceof Error ? error.message : 'Не удалось восстановить', 'error'); setBusy(false); }
        }}>Восстановить</Button>
      </div>
    </Modal>
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
