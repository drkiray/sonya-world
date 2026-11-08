import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Egg, Heart, Plus, Search } from 'lucide-react';
import { useAppState } from '../state/AppContext';
import { PetImage, RARITY_COLORS, RARITY_LABELS } from '../components/art';
import { Card, Chip, EmptyState, Segmented } from '../components/ui';
import type { CollectionStatus, Pet } from '../types';
import { cn } from '../lib/cn';

type Filter = 'all' | 'owned' | 'wanted' | 'missing' | 'favorite';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'owned', label: 'Найденные' },
  { value: 'wanted', label: 'Хочу получить' },
  { value: 'missing', label: 'Не найдены' },
  { value: 'favorite', label: 'Избранное' },
];

const STATUS_LABELS: Record<CollectionStatus, string> = {
  not_found: 'Не найден',
  wanted: 'Хочу получить',
  owned: 'Есть у меня',
};

export default function Collection() {
  const state = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog');

  const { pets, collection } = state;
  const catalog = pets.filter((p) => p.source === 'catalog');
  const custom = pets.filter((p) => p.source === 'custom');

  const list = tab === 'catalog' ? catalog : custom;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const entry = collection[p.id];
      const status: CollectionStatus = entry?.status ?? 'not_found';
      if (filter === 'owned' && status !== 'owned') return false;
      if (filter === 'wanted' && status !== 'wanted') return false;
      if (filter === 'missing' && status !== 'not_found') return false;
      if (filter === 'favorite' && !entry?.favorite) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, collection, filter, query]);

  const ownedCatalog = catalog.filter((p) => collection[p.id]?.status === 'owned').length;
  const pct = catalog.length ? Math.round((ownedCatalog / catalog.length) * 100) : 0;
  const foundTotal = pets.filter((p) => collection[p.id]?.status === 'owned').length;

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
              { value: 'custom', label: `Мои питомцы (${custom.length})` },
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

        {tab === 'catalog' && (
          <Segmented className="mt-3" options={FILTERS} value={filter} onChange={setFilter} />
        )}

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              art={<Egg size={64} className="text-grape" />}
              title={tab === 'custom' ? 'Пока нет своих питомцев' : 'Никого не нашлось'}
              text={tab === 'custom' ? 'Слепи, нарисуй или придумай питомца и добавь его сюда!' : 'Попробуй изменить фильтр или поиск.'}
              action={
                tab === 'custom' ? (
                  <Link to="/collection/new" className="rounded-2xl bg-grape px-4 py-2 text-sm font-black text-white">
                    Добавить питомца
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
  const status: CollectionStatus = entry?.status ?? 'not_found';
  const rc = RARITY_COLORS[pet.rarity];
  const owned = status === 'owned';

  return (
    <Link to={`/collection/${pet.id}`} className="block active:scale-[0.97] transition">
      <Card className={cn('overflow-hidden', !owned && pet.source === 'catalog' && 'opacity-90')}>
        <div className="relative flex justify-center pt-3" style={{ background: `linear-gradient(180deg, ${rc.soft}, #fff)` }}>
          {entry?.favorite && (
            <Heart size={16} className="absolute right-2.5 top-2.5 fill-rosa text-rosa" />
          )}
          <PetImage pet={pet} size={96} silhouette={pet.source === 'catalog' && !owned} />
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-black text-ink">{pet.name}</p>
          <div className="mt-1 flex items-center gap-1">
            <Chip className={cn('border', rc.soft, rc.text)} style={{ borderColor: rc.ring }}>
              {RARITY_LABELS[pet.rarity]}
            </Chip>
          </div>
          <p className={cn('mt-1.5 text-[11px] font-bold', status === 'owned' ? 'text-green-600' : status === 'wanted' ? 'text-rosa' : 'text-ink/40')}>
            {STATUS_LABELS[status]}
          </p>
        </div>
      </Card>
    </Link>
  );
}
