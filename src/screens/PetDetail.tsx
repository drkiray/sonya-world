import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Egg as EggIcon, Heart, Hourglass, Sparkles, Trash2 } from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { deleteCustomPet, EGG_GROW_MS, petPhase, startGrowing, toggleFavorite } from '../services/store';
import { EggArt, PetImage, petHabits, petStats, RARITY_COLORS, RARITY_LABELS } from '../components/art';
import { Button, Card, Chip, Modal, ProgressBar } from '../components/ui';
import type { CustomPet, Pet } from '../types';
import { cn } from '../lib/cn';

function formatDuration(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} мин`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'почти вылупилось…';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d} дн ${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  if (m > 0) return `${m} мин ${sec} сек`;
  return `${sec} сек`;
}

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useUi();
  const state = useAppState();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, setTick] = useState(0);

  const pet = state.pets.find((p) => p.id === id);

  // Тикаем каждую секунду, пока яйцо растёт, чтобы обновлять таймер
  const entry = pet ? state.collection[pet.id] : undefined;
  const phase = pet ? petPhase(pet, entry) : 'unknown';
  useEffect(() => {
    if (phase !== 'growing') return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  if (!pet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-mist p-6">
        <p className="font-bold text-ink/60">Питомец не найден</p>
        <Button onClick={() => navigate('/collection')}>Назад в альбом</Button>
      </div>
    );
  }

  const rc = RARITY_COLORS[pet.rarity];
  const custom = pet.source === 'custom' ? (pet as CustomPet) : null;
  const photo = custom?.photo ?? pet.imageUrl;
  const stats = petStats(pet.artSeed);
  const habits = petHabits(pet.artSeed);
  const revealed = phase === 'owned';

  const hatchAt = entry?.hatchAt ? Date.parse(entry.hatchAt) : 0;
  const total = EGG_GROW_MS[pet.rarity];
  const remaining = phase === 'growing' ? Math.max(0, hatchAt - Date.now()) : 0;
  const progress = phase === 'growing' ? 1 - remaining / total : 0;

  const grow = async () => {
    try {
      await startGrowing(pet.id);
      toast('Яйцо растёт! Загляни позже.', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Не получилось', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-6">
      <header
        className="relative flex flex-col items-center rounded-b-[2.5rem] px-4 pb-6 pt-4 text-white"
        style={{ background: `linear-gradient(180deg, #21183D 0%, ${rc.main}33 100%), linear-gradient(180deg, #21183D, #35285E)` }}
      >
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 rounded-full bg-white/15 p-2" aria-label="Назад">
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={async () => {
            await toggleFavorite(pet.id);
            toast(!entry?.favorite ? 'Добавлено в избранное!' : 'Убрано из избранного', 'success');
          }}
          className={cn('absolute right-4 top-4 rounded-full p-2 backdrop-blur', entry?.favorite ? 'bg-rosa text-white' : 'bg-white/15')}
          aria-label="Избранное"
        >
          <Heart size={18} className={entry?.favorite ? 'fill-white' : ''} />
        </button>

        <div className="mt-8 animate-floaty">
          {phase === 'unknown' && (
            <div className="rounded-full bg-white/10 p-3 backdrop-blur" style={{ filter: 'none' }}>
              <div style={{ filter: 'brightness(0.32) saturate(0.45)' }}>
                <EggArt rarity={pet.rarity} seed={pet.artSeed} size={150} />
              </div>
            </div>
          )}
          {phase === 'egg' && (
            <div className="rounded-full bg-white/10 p-3 backdrop-blur">
              <EggArt rarity={pet.rarity} seed={pet.artSeed} size={150} />
            </div>
          )}
          {phase === 'growing' && (
            <div className="rounded-full bg-white/10 p-3 backdrop-blur">
              <div className="egg-wobble inline-block">
                <EggArt rarity={pet.rarity} seed={pet.artSeed} size={150} />
              </div>
            </div>
          )}
          {revealed &&
            (photo ? (
              <img src={photo} alt={pet.name} className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-pop" />
            ) : (
              <PetImage pet={pet} size={160} />
            ))}
        </div>

        <h1 className="mt-3 text-center text-2xl font-black">
          {phase === 'unknown' ? 'Неизвестное существо' : pet.name}
        </h1>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <Chip className="border" style={{ background: rc.soft, color: rc.text, borderColor: rc.ring }}>
            {RARITY_LABELS[pet.rarity]}
          </Chip>
          <Chip className="bg-white/15 text-white">{pet.category}</Chip>
          {custom && <Chip className="bg-rosa text-white">Мой питомец</Chip>}
        </div>

        {/* Прогресс роста яйца */}
        {phase === 'growing' && (
          <div className="mt-4 w-full max-w-xs rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wide text-sky">
              <Hourglass size={13} /> Яйцо растёт… {formatCountdown(remaining)}
            </p>
            <ProgressBar value={progress * 100} max={100} className="mt-2 h-2.5 bg-white/15" gradient={false} />
          </div>
        )}
      </header>

      <main className="px-4">
        {/* Действия с яйцом */}
        {phase === 'unknown' && (
          <Card className="mt-4 flex flex-col items-center gap-3 p-4 text-center">
            <EggIcon size={28} className="text-grape" />
            <p className="text-sm font-bold text-ink/70">
              Это существо ещё не найдено. Купи его яйцо в магазине, вырасти — и узнаешь, кто внутри!
            </p>
            <Button size="lg" className="w-full" onClick={() => navigate('/shop')}>
              <Sparkles size={18} /> В магазин за яйцом
            </Button>
          </Card>
        )}
        {phase === 'egg' && (
          <Card className="mt-4 flex flex-col items-center gap-3 p-4 text-center">
            <p className="text-sm font-bold text-ink/70">
              Яйцо у Сони! Рост займёт около <span className="font-black text-grape">{formatDuration(total)}</span>.
            </p>
            <Button size="lg" variant="sun" className="w-full" onClick={grow}>
              <Sparkles size={18} /> Растить яйцо!
            </Button>
          </Card>
        )}

        {/* О питомце */}
        <Card className="mt-3 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/40">О питомце</p>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-ink/80">
            {revealed
              ? pet.description || 'Описание появится позже.'
              : 'Кто внутри яйца — пока загадка. Вырасти яйцо, чтобы узнать это существо!'}
          </p>
          {pet.source === 'catalog' && revealed && (
            <p className="mt-2 text-xs font-bold text-ink/40">
              Источник: {pet.catalogOrigin ?? 'каталог'}
              {pet.sourceVerified ? ' · проверено' : ''}
            </p>
          )}
          {custom?.note && (
            <p className="mt-2 rounded-2xl bg-rosa/10 p-3 text-sm font-semibold text-ink/80">
              <span className="font-black text-rosa">Заметка: </span>
              {custom.note}
            </p>
          )}
        </Card>

        {/* Характеристики */}
        <Card className="mt-3 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/40">Характеристики</p>
          <div className="mt-2 space-y-2.5">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs font-black">
                  <span className="text-ink/60">{s.label}</span>
                  <span className="text-ink">{revealed ? s.value : '???'}</span>
                </div>
                <ProgressBar
                  value={revealed ? s.value : 0}
                  max={100}
                  className="mt-1 h-2"
                  gradient={false}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Любимые привычки */}
        <Card className="mt-3 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/40">Любимые привычки</p>
          {revealed ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {habits.map((h) => (
                <Chip key={h} className="bg-grape/10 px-3 py-1.5 text-xs font-bold text-grape">
                  {h}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-sm font-semibold text-ink/50">Пока неизвестно…</p>
          )}
        </Card>

        {custom && (
          <Button variant="danger" className="mt-4 w-full" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} /> Удалить питомца
          </Button>
        )}
      </main>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Удалить питомца?">
        <p className="text-sm font-semibold text-ink/70">{pet.name} исчезнет из альбома навсегда.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Оставить</Button>
          <Button
            variant="danger"
            onClick={async () => {
              await deleteCustomPet(pet.id);
              toast('Питомец удалён');
              navigate('/collection');
            }}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
