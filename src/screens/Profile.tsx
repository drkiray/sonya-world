import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  ClipboardList,
  Coins,
  Crown,
  Egg,
  Flame,
  Gem,
  Grid3X3,
  KeyRound,
  Mail,
  MailOpen,
  Medal,
  PawPrint,
  Rocket,
  Sparkles,
  Sun,
  Trophy,
} from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { ACHIEVEMENTS, updateProfile, xpProgress } from '../services/store';
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
  rocket: { icon: Rocket, bg: 'from-[#4F46E5] to-sky' },
  sun: { icon: Sun, bg: 'from-sun to-[#FF9A3D]' },
  mail: { icon: Mail, bg: 'from-sky to-grape' },
  mailopen: { icon: MailOpen, bg: 'from-grape to-rosa' },
};

const AVATAR_PRESETS = [11, 22, 33, 44, 55, 66, 77, 88];

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
  const navigate = useNavigate();
  const { profile, pets, collection, submissions, transactions, achievements } = state;

  const ownedCount = pets.filter((p) => collection[p.id]?.status === 'owned').length;
  const approvedQuests = submissions.filter((s) => s.status === 'approved').length;
  const unlocked = new Set(achievements.map((a) => a.achievementId));

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);


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
            <ProgressBar value={xpProgress(profile).intoLevel} max={xpProgress(profile).needed} className="mt-2 h-2 bg-white/15" gradient={false} />
            <p className="mt-1 text-[11px] font-bold text-white/50">
              {xpProgress(profile).intoLevel}/{xpProgress(profile).needed} опыта до следующего уровня
            </p>
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

        {/* Настройки для мамы — вход сразу в родительскую панель по PIN */}
        <div className="mt-8 mb-1 px-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink/35">Настройки для мамы</p>
        </div>
        <button
          onClick={() => navigate('/parent')}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-left active:bg-white"
        >
          <KeyRound size={16} className="text-ink/40" />
          <span className="text-xs font-bold text-ink/50">Вход по PIN-коду</span>
          <span className="ml-auto text-[11px] font-bold text-ink/30">только для мамы</span>
        </button>
      </main>

      <AvatarPickerModal open={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />


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
