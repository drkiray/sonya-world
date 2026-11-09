import { useEffect, useMemo, useState } from 'react';
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

export default function Collection() {
  const state = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog');

  const { pets, collection } = state;
  const catalog = pets.filter((p) => p.source === 'catalog');
  const custom = pets.filter((p) => p.source === 'custom');
  const myEggs = catalog.filter((p) => {
    const phase = petPhase(p, collection[p.id]);
    return phase === 'egg' || phase === 'growing';
  });

  const list = useMemo(
    () => (tab === 'catalog' ? catalog : [...myEggs, ...custom]),
    [tab, catalog, custom, myEggs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const phase = petPhase(p, collection[p.id]);
      if (filter === 'owned' && phase !== 'owned') return false;
      if (filter === 'eggs' && phase !== 'egg' && phase !== 'growing') return false;
      if (filter === 'missing' && phase !== 'unknown') return false;
      if (filter === 'favorite' && !collection[p.id]?.favorite) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, collection, filter, query]);

  const ownedCatalog = catalog.filter((p) => petPhase(p, collection[p.id]) === 'owned').length;
  const pct = catalog.length ? Math.round((ownedCatalog / catalog.length) * 100) : 0;
  const foundTotal = pets.filter((p) => petPhase(p, collection[p.id]) === 'owned').length;
  const myCount = custom.length + myEggs.length;

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-4">
      <header className="rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-5 pt-5 text-white">
        <h1 className="text-2xl font-black">Альбом</h1>
        <p className="mt-0.5 text-sm font-bold text-white/60">Энциклопедия питомцев Сони</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-sky">{pets.length}</p>
            <p className="text-[10px] font-bold uppercase text-white/60">всего</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-sun">{foundTotal}</p>
            <p className="text-[10px] font-bold uppercase text-white/60">найдено</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-rosa">{pct}%</p>
            <p className="text-[10px] font-bold uppercase text-white/60">альбом</p>
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
        <div className="mt-4 flex items-center gap-2">
          <Segmented
            className="flex-1"
            options={[
              { value: 'catalog', label: 'Энциклопедия' },
              { value: 'custom', label: `Мои питомцы (${myCount})` },
            ]}
            value={tab}
            onChange={setTab}
          />
          <Link
            to="/collection/new"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-grape text-white shadow-pop active:scale-95"
            aria-label="Добавить своего питомца"
          >
            <Plus size={20} />
          </Link>
        </div>

        <Segmented className="mt-3" options={FILTERS} value={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              art={<Egg size={64} className="text-grape" />}
              title={tab === 'custom' ? 'Пока пусто' : 'Никого не нашлось'}
              text={
                tab === 'custom'
                  ? 'Добавь своего питомца или купи яйцо в магазине!'
                  : 'Попробуй изменить фильтр или поиск.'
              }
              action={
                tab === 'custom' ? (
                  <Link to="/shop" className="rounded-2xl bg-grape px-4 py-2 text-sm font-black text-white">
                    Купить яйцо
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
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
          <div className="mt-1 flex items-center gap-1">
            <Chip className={cn('border', rc.soft, rc.text)} style={{ borderColor: rc.ring }}>
              {RARITY_LABELS[pet.rarity]}
            </Chip>
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
