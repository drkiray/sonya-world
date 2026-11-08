import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  ClipboardList,
  Coins,
  Crown,
  Download,
  Egg,
  FileUp,
  Flame,
  Gem,
  Grid3X3,
  KeyRound,
  Medal,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { ACHIEVEMENTS, importCatalog, resetDemoData, updateProfile, verifyPin } from '../services/store';
import { parseCatalogJson } from '../services/catalog';
import { AvatarArt, ChildAvatar } from '../components/art';
import { CoinChip } from '../components/StatusChips';
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

const PARENT_SESSION_KEY = 'sonya-parent-auth';
const AVATAR_PRESETS = [11, 22, 33, 44, 55, 66, 77, 88];

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 512 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Profile() {
  const state = useAppState();
  const { toast } = useUi();
  const { profile, pets, collection, submissions, transactions, achievements } = state;

  const ownedCount = pets.filter((p) => collection[p.id]?.status === 'owned').length;
  const approvedQuests = submissions.filter((s) => s.status === 'approved').length;
  const unlocked = new Set(achievements.map((a) => a.achievementId));

  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [momAuthed, setMomAuthed] = useState(sessionStorage.getItem(PARENT_SESSION_KEY) === '1');
  const [showPin, setShowPin] = useState(false);

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
          <h1 className="text-2xl font-black">Это я!</h1>
          <CoinChip />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="relative animate-floaty active:scale-95 transition"
            aria-label="Сменить аватарку"
          >
            <ChildAvatar photo={profile.avatarPhoto} seed={profile.avatarSeed} size={88} />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-sun text-night shadow-card">
              <Sparkles size={14} />
            </span>
          </button>
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
          <Stat icon={ClipboardList} label="заданий" value={approvedQuests} color="text-sky" />
        </div>

        {/* Достижения */}
        <h2 className="mb-2 mt-6 px-1 text-lg font-black text-ink">
          Мои значки
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
                {isOpen && <Chip className="bg-green-100 px-1.5 text-[10px] text-green-700">Есть!</Chip>}
              </Card>
            );
          })}
        </div>

        {/* Настройки для мамы — неприметная плашка, всё под PIN */}
        <div className="mt-8 mb-1 px-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink/35">Настройки для мамы</p>
        </div>
        {momAuthed ? (
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

            <button className="flex w-full items-center gap-3 p-4 text-left active:bg-ink/5" onClick={() => setConfirmReset(true)}>
              <Sparkles className="text-ink/40" size={20} />
              <span className="flex-1 text-sm font-black text-ink">Сбросить демонстрационные данные</span>
            </button>

            <Link to="/parent/overview" className="flex w-full items-center gap-3 p-4 active:bg-ink/5">
              <ShieldCheck className="text-grape" size={20} />
              <span className="flex-1 text-sm font-black text-ink">Родительская панель</span>
              <Baby className="text-ink/30" size={18} />
            </Link>
          </Card>
        ) : (
          <button
            onClick={() => setShowPin(true)}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-left active:bg-white"
          >
            <KeyRound size={16} className="text-ink/40" />
            <span className="text-xs font-bold text-ink/50">Вход по PIN-коду</span>
            <span className="ml-auto text-[11px] font-bold text-ink/30">только для мамы</span>
          </button>
        )}
      </main>

      <AvatarPickerModal open={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />
      <PinModal open={showPin} onClose={() => setShowPin(false)} onSuccess={() => { setShowPin(false); setMomAuthed(true); }} />
      <ImportModal open={showImport} onClose={() => setShowImport(false)} />

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Сбросить демоданные?">
        <p className="text-sm font-semibold text-ink/70">
          Все питомцы, задания, монеты и достижения вернутся к первоначальному демонстрационному состоянию.
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

/** Выбор аватарки: готовые персонажи или своя фотография */
function AvatarPickerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useAppState();
  const { toast } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);
  const { profile } = state;

  const pickPreset = async (seed: number) => {
    await updateProfile({ avatarSeed: seed, avatarPhoto: null });
    toast('Новая аватарка!', 'success');
    onClose();
  };

  const pickPhoto = async (f: File) => {
    try {
      const data = await readPhoto(f);
      await updateProfile({ avatarPhoto: data });
      toast('Фото на аватарке!', 'success');
      onClose();
    } catch {
      toast('Не получилось загрузить фото', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Выбери аватарку">
      <div className="grid grid-cols-4 gap-2.5">
        {AVATAR_PRESETS.map((seed) => {
          const active = !profile.avatarPhoto && profile.avatarSeed === seed;
          return (
            <button
              key={seed}
              onClick={() => pickPreset(seed)}
              className={cn(
                'flex justify-center rounded-2xl p-1.5 transition active:scale-95',
                active ? 'bg-grape/15 ring-2 ring-grape' : 'bg-mist hover:bg-grape/5',
              )}
              aria-label={`Аватар ${seed}`}
            >
              <AvatarArt seed={seed} size={56} />
            </button>
          );
        })}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pickPhoto(f);
        }}
      />
      <Button size="lg" variant="sun" className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
        <Baby size={18} /> Своё фото
      </Button>
      <p className="mt-2 text-center text-[11px] font-semibold text-ink/40">
        Фото хранится только на этом устройстве
      </p>
    </Modal>
  );
}

/** PIN-вход к настройкам для мамы */
function PinModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useUi();
  const [pin, setPin] = useState('');

  const check = async () => {
    if (await verifyPin(pin)) {
      sessionStorage.setItem(PARENT_SESSION_KEY, '1');
      setPin('');
      onSuccess();
    } else {
      toast('Неверный PIN-код', 'error');
      setPin('');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Вход для мамы">
      <p className="text-sm font-semibold text-ink/60">Введите PIN-код, чтобы открыть настройки.</p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        onKeyDown={(e) => e.key === 'Enter' && check()}
        placeholder="••••"
        autoFocus
        className="mt-3 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-grape"
      />
      <Button size="lg" className="mt-3 w-full" onClick={check} disabled={pin.length !== 4}>
        Войти
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
