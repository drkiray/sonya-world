import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Trash2 } from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { deleteCustomPet, setPetStatus, toggleFavorite } from '../services/store';
import { PetAvatar, RARITY_COLORS, RARITY_LABELS } from '../components/art';
import { Button, Card, Chip, Modal } from '../components/ui';
import type { CollectionStatus, CustomPet } from '../types';
import { cn } from '../lib/cn';

const STATUS_OPTIONS: Array<{ value: CollectionStatus; label: string }> = [
  { value: 'not_found', label: 'Не найден' },
  { value: 'wanted', label: 'Хочу получить' },
  { value: 'owned', label: 'Есть у меня' },
];

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useUi();
  const state = useAppState();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pet = state.pets.find((p) => p.id === id);
  if (!pet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-mist p-6">
        <p className="font-bold text-ink/60">Питомец не найден</p>
        <Button onClick={() => navigate('/collection')}>Назад в коллекцию</Button>
      </div>
    );
  }

  const entry = state.collection[pet.id];
  const status: CollectionStatus = entry?.status ?? 'not_found';
  const rc = RARITY_COLORS[pet.rarity];
  const custom = pet.source === 'custom' ? (pet as CustomPet) : null;
  const photo = custom?.photo ?? pet.imageUrl;

  const handleStatus = async (s: CollectionStatus) => {
    await setPetStatus(pet.id, s);
    toast(
      s === 'owned' ? 'Питомец добавлен в твою коллекцию!' : s === 'wanted' ? 'Отмечено: очень хочу получить!' : 'Статус обновлён',
      'success',
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-6">
      <header className="relative flex flex-col items-center rounded-b-[2.5rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-6 pt-4 text-white"
        style={{ background: `linear-gradient(180deg, #21183D 0%, ${rc.main}33 100%), linear-gradient(180deg, #21183D, #35285E)` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-white/15 p-2 backdrop-blur"
          aria-label="Назад"
        >
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
          {photo ? (
            <img src={photo} alt={pet.name} className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-pop" />
          ) : (
            <PetAvatar seed={pet.artSeed} rarity={pet.rarity} size={160} silhouette={pet.source === 'catalog' && status !== 'owned'} />
          )}
        </div>
        <h1 className="mt-3 text-center text-2xl font-black">{pet.name}</h1>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <Chip className="border" style={{ background: rc.soft, color: rc.text, borderColor: rc.ring }}>
            {RARITY_LABELS[pet.rarity]}
          </Chip>
          <Chip className="bg-white/15 text-white">{pet.category}</Chip>
          {pet.isDemo && <Chip className="bg-sun/80 text-night">Demo</Chip>}
          {custom && <Chip className="bg-rosa text-white">Мой питомец</Chip>}
        </div>
      </header>

      <main className="px-4">
        <Card className="mt-4 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/40">Статус в коллекции</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => handleStatus(o.value)}
                className={cn(
                  'rounded-2xl border-2 px-2 py-2.5 text-xs font-black transition active:scale-95',
                  status === o.value
                    ? 'border-grape bg-grape text-white shadow-pop'
                    : 'border-ink/10 bg-white text-ink/60',
                )}
              >
                {status === o.value && <Check size={13} className="mr-1 inline" />}
                {o.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-3 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/40">О питомце</p>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-ink/80">{pet.description || 'Описание появится позже.'}</p>
          {pet.source === 'catalog' && (
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

        {custom && (
          <Button variant="danger" className="mt-4 w-full" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} /> Удалить питомца
          </Button>
        )}
      </main>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Удалить питомца?">
        <p className="text-sm font-semibold text-ink/70">{pet.name} исчезнет из коллекции навсегда.</p>
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
