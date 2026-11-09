import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Egg, Heart, Plus, Search } from 'lucide-react';
import { useAppState } from '../state/AppContext';
import { petPhase } from '../services/store';
import { EggArt, PetImage, RARITY_COLORS, RARITY_LABELS } from '../components/art';
import { Card, Chip, EmptyState, Segmented } from '../components/ui';
import type { CollectionStatus, Pet } from '../types';
import { cn } from '../lib/cn';

type Filter = 'all' | 'owned' | 'eggs' | 'missing' | 'favorite';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'owned', label: 'Найденные' },
  { value: 'eggs', label: 'Яйца' },
  { value: 'missing', label: 'Не найдены' },
  { value: 'favorite', label: 'Избранное' },
];

const STATUS_LABELS: Record<CollectionStatus, string> = {
  not_found: 'Не найден',
  egg: 'Яйцо ждёт',
  growing: 'Яйцо растёт!',
  owned: 'Есть у меня',
};

/** Яйцо существа: затемнённое, если существо ещё не найдено */
export function EggImage({ pet, size = 96, dark = false }: { pet: Pet; size?: number; dark?: boolean }) {
  return (
    <div style={dark ? { filter: 'brightness(0.32) saturate(0.45)' } : undefined}>
      <EggArt rarity={pet.rarity} seed={pet.artSeed} size={size} />
    </div>
  );
}

/** Единый питомник: энциклопедические существа, вариации из яиц и свои питомцы */
export default function Collection() {
  const state = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const bases = state.pets.filter((p) => p.source === 'catalog' && !p.variantOf);
    const rest = state.pets
      .filter((p) => p.source === 'custom' || p.variantOf)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return [...bases, ...rest];
  }, [state.pets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const phase = petPhase(p, state.collection[p.id]);
      if (filter === 'owned' && phase !== 'owned') return false;
      if (filter === 'eggs' && phase !== 'egg' && phase !== 'growing') return false;
      if (filter === 'missing' && phase !== 'unknown') return false;
      if (filter === 'favorite' && !state.collection[p.id]?.favorite) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, state.collection, filter, query]);

  const bases = state.pets.filter((p) => p.source === 'catalog' && !p.variantOf);
  const ownedTotal = state.pets.filter((p) => petPhase(p, state.collection[p.id]) === 'owned').length;
  const pctBases = bases.length ? Math.round((ownedTotal / bases.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-4">
      <header className="rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-5 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Питомцы</h1>
            <p className="mt-0.5 text-sm font-bold text-white/60">Питомник Сони: яйца и питомцы</p>
          </div>
          <Link
            to="/collection/new"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sun text-night shadow-card active:scale-95"
            aria-label="Добавить своего питомца"
          >
            <Plus size={20} />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-sky">{state.pets.length}</p>
            <p className="text-[10px] font-bold uppercase text-white/60">всего</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-sun">{ownedTotal}</p>
            <p className="text-[10px] font-bold uppercase text-white/60">найдено</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-rosa">{pctBases}%</p>
            <p className="text-[10px] font-bold uppercase text-white/60">питомник</p>
          </div>
        </div>

        <div className="relative mt-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти питомца по имени…"
            className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-ink outline-none placeholder:text-ink/40"
          />
        </div>
      </header>

      <main className="px-4">
        <Segmented className="mt-4" options={FILTERS} value={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              art={<Egg size={64} className="text-grape" />}
              title="Пока пусто"
              text="Купи яйцо в магазине или добавь своего питомца!"
              action={
                <Link to="/shop" className="rounded-2xl bg-grape px-4 py-2 text-sm font-black text-white">
                  Купить яйцо
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
            <Link
              to="/collection/new"
              className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-grape/40 bg-white/50 p-4 text-center transition active:scale-[0.97]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-grape/10 text-grape">
                <Plus size={30} />
              </span>
              <p className="text-sm font-black leading-tight text-grape">Завести своего питомца</p>
              <p className="text-[11px] font-semibold text-ink/40">Сфотографируй или придумай</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  const state = useAppState();
  const entry = state.collection[pet.id];
  const phase = petPhase(pet, entry);
  const rc = RARITY_COLORS[pet.rarity];

  return (
    <Link to={`/collection/${pet.id}`} className="block transition active:scale-[0.97]">
      <Card className="overflow-hidden">
        <div
          className="relative flex h-[108px] items-center justify-center"
          style={{ background: `linear-gradient(180deg, ${rc.soft}, #fff)` }}
        >
          {entry?.favorite && <Heart size={16} className="absolute right-2.5 top-2.5 fill-rosa text-rosa" />}
          {phase === 'unknown' && <EggImage pet={pet} size={88} dark />}
          {(phase === 'egg' || phase === 'growing') && <EggImage pet={pet} size={88} />}
          {phase === 'owned' && <PetImage pet={pet} size={88} />}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-black text-ink">
            {phase === 'owned' ? pet.name : phase === 'unknown' ? 'Неизвестное существо' : 'Секретное яйцо'}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Chip className={cn('border', rc.soft, rc.text)} style={{ borderColor: rc.ring }}>
              {RARITY_LABELS[pet.rarity]}
            </Chip>
            {pet.variantOf && <Chip className="bg-sky/15 px-1.5 text-[10px] text-sky">Вариация</Chip>}
          </div>
          <p
            className={cn(
              'mt-1.5 text-[11px] font-bold',
              phase === 'owned' ? 'text-green-600' : phase === 'unknown' ? 'text-ink/40' : 'text-sky',
            )}
          >
            {STATUS_LABELS[
              phase === 'unknown' ? 'not_found' : phase === 'egg' ? 'egg' : phase === 'growing' ? 'growing' : 'owned'
            ]}
          </p>
        </div>
      </Card>
    </Link>
  );
}
