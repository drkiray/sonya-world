import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  CalendarDays,
  ClipboardList,
  Coins,
  Crown,
  Download,
  Egg,
  FileUp,
  Flame,
  Gem,
  Grid3X3,
  Medal,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { ACHIEVEMENTS, importCatalog, resetDemoData, updateProfile } from '../services/store';
import { parseCatalogJson } from '../services/catalog';
import { AvatarArt } from '../components/art';
import { CoinChip, OnlineChip } from '../components/StatusChips';
import { Button, Card, Chip, Modal, ProgressBar } from '../components/ui';
import { cn } from '../lib/cn';

const ACHIEVEMENT_ICONS: Record<string, { icon: typeof Egg; bg: string }> = {
  egg: { icon: Egg, bg: 'from-sky to-grape' },
  paw: { icon: PawPrint, bg: 'from-grape to-rosa' },
  grid: { icon: Grid3X3, bg: 'from-green-400 to-sky' },
  crown: { icon: Crown, bg: 'from-sun to-[#FF9A3D]' },
  gem: { icon: Gem, bg: 'from-rosa to-grape' },
  clipboard: { icon: ClipboardList, bg: 'from-sky to-green-400' },
  medal: { icon: Medal, bg: 'from-sun to-grape' },
  trophy: { icon: Trophy, bg: 'from-[#FF9A3D] to-rosa' },
  flame: { icon: Flame, bg: 'from-red-400 to-sun' },
};

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export default function Profile() {
  const state = useAppState();
  const { toast } = useUi();
  const { profile, pets, collection, submissions, transactions, achievements } = state;

  const ownedCount = pets.filter((p) => collection[p.id]?.status === 'owned').length;
  const approvedQuests = submissions.filter((s) => s.status === 'approved').length;
  const unlocked = new Set(achievements.map((a) => a.achievementId));
  const earnedCoins = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

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

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-4">
      <header className="rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-6 pt-5 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Профиль</h1>
          <div className="flex items-center gap-2">
            <OnlineChip />
            <CoinChip />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="animate-floaty">
            <AvatarArt seed={profile.avatarSeed} size={84} />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-black">{profile.childName}</p>
            <p className="text-sm font-bold text-white/60">Коллекционер {profile.level} уровня</p>
            <ProgressBar value={profile.xp % 100} max={100} className="mt-2 h-2 bg-white/15" gradient={false} />
            <p className="mt-1 text-[11px] font-bold text-white/50">{profile.xp % 100}/100 опыта · серия {profile.streakDays} {dayWord(profile.streakDays)}</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        {/* Статистика */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat icon={Coins} label="монет" value={profile.coins} color="text-sun" />
          <Stat icon={PawPrint} label="питомцев" value={ownedCount} color="text-rosa" />
          <Stat icon={ClipboardList} label="квестов" value={approvedQuests} color="text-sky" />
        </div>
        <Card className="mt-2 flex items-center gap-2 p-3 text-sm font-bold text-ink/60">
          <CalendarDays size={16} className="text-grape" />
          Играет с {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
          <span className="ml-auto text-xs font-black text-ink/40">заработано всего: {earnedCoins}</span>
        </Card>

        {/* Достижения */}
        <h2 className="mb-2 mt-6 px-1 text-lg font-black text-ink">
          Значки достижений
          <span className="ml-2 text-sm font-bold text-ink/40">{unlocked.size} из {ACHIEVEMENTS.length}</span>
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const isOpen = unlocked.has(a.id);
            const meta = ACHIEVEMENT_ICONS[a.icon] ?? ACHIEVEMENT_ICONS.egg;
            const Icon = meta.icon;
            return (
              <Card key={a.id} className={cn('flex flex-col items-center gap-1.5 p-3 text-center', !isOpen && 'opacity-50 grayscale')}>
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-card', meta.bg)}>
                  <Icon size={22} />
                </span>
                <p className="text-[11px] font-black leading-tight text-ink">{a.title}</p>
                {isOpen && <Chip className="bg-green-100 px-1.5 text-[10px] text-green-700">Открыто</Chip>}
              </Card>
            );
          })}
        </div>

        {/* Настройки и действия */}
        <h2 className="mb-2 mt-6 px-1 text-lg font-black text-ink">Настройки</h2>
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
              <span className="flex-1 text-sm font-black text-ink">Установить на телефон</span>
              <Chip className="bg-sun/25 text-[#8A6100]">PWA</Chip>
            </button>
          )}

          <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setShowImport(true)}>
            <FileUp className="text-grape" size={20} />
            <span className="flex-1 text-sm font-black text-ink">Импорт каталога питомцев</span>
            <span className="text-xs font-bold text-ink/40">JSON</span>
          </button>

          <Link to="/parent" className="flex w-full items-center gap-3 p-4 active:bg-ink/5">
            <ShieldCheck className="text-grape" size={20} />
            <span className="flex-1 text-sm font-black text-ink">Режим для мамы</span>
            <Baby className="text-ink/30" size={18} />
          </Link>

          <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setConfirmReset(true)}>
            <Sparkles className="text-ink/40" size={20} />
            <span className="flex-1 text-sm font-black text-ink">Сбросить демонстрационные данные</span>
          </button>
        </Card>
      </main>

      <ImportModal open={showImport} onClose={() => setShowImport(false)} />

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Сбросить демоданные?">
        <p className="text-sm font-semibold text-ink/70">
          Все питомцы, квесты, монеты и достижения вернутся к первоначальному демонстрационному состоянию.
          Это действие нельзя отменить.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>Отмена</Button>
          <Button
            variant="danger"
            onClick={async () => {
              await resetDemoData();
              setConfirmReset(false);
              toast('Демоданные восстановлены', 'success');
            }}
          >
            Сбросить
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof Coins; label: string; value: number; color: string }) {
  return (
    <Card className="flex flex-col items-center p-3">
      <Icon size={18} className={color} />
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
      <p className="text-[10px] font-bold uppercase text-ink/40">{label}</p>
    </Card>
  );
}

function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
  return 'дней';
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
        placeholder='[{"id":"pet-1","name":"Питомец","rarity":"Rare","category":"Animal","description":"...","imageUrl":null,"source":"Steal an Egg","sourceVerified":false}]'
        className="mt-3 w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 font-mono text-xs outline-none focus:border-grape"
      />
      <Button size="lg" className="mt-3 w-full" onClick={run} disabled={busy || !text.trim()}>
        <FileUp size={16} /> {busy ? 'Импортируем…' : 'Импортировать'}
      </Button>
    </Modal>
  );
}
