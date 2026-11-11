import { useMemo, useState } from 'react';
import { Coins, PackageCheck, ShoppingBag } from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { buyEgg, eggGrowMs, EGG_PRICE, petPhase, requestReward } from '../services/store';
import { EggArt, RewardArt, RARITY_COLORS, RARITY_LABELS } from '../components/art';
import { CoinChip } from '../components/StatusChips';
import { Button, Card, Chip, EmptyState, Modal, ProgressBar, Segmented } from '../components/ui';
import { REWARD_CATEGORY_LABELS, RARITIES, type Rarity, type Reward, type RewardCategory } from '../types';
import { cn } from '../lib/cn';

type CatFilter = 'eggs' | RewardCategory;

const CATEGORIES: Array<{ value: CatFilter; label: string }> = [
  { value: 'eggs', label: 'Яйца' },
  ...(Object.entries(REWARD_CATEGORY_LABELS) as Array<[RewardCategory, string]>).map(([value, label]) => ({ value, label })),
];

export default function Shop() {
  const state = useAppState();
  const [cat, setCat] = useState<CatFilter>('eggs');
  const [selected, setSelected] = useState<Reward | null>(null);

  const rewards = useMemo(
    () => state.rewards.filter((r) => r.enabled && cat !== 'eggs' && r.category === cat),
    [state.rewards, cat],
  );

  const myRequests = state.rewardRequests.filter((r) => r.status !== 'rejected').slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-4">
      <header className="rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-5 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Магазин наград</h1>
            <p className="mt-0.5 text-sm font-bold text-white/60">Обменивай монеты на призы</p>
          </div>
          <CoinChip />
        </div>
      </header>

      <main className="px-4">
        <Segmented className="mt-4" options={CATEGORIES} value={cat} onChange={setCat} />

        {cat === 'eggs' ? (
          <EggShop />
        ) : rewards.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Витрина пустует" text="Мама скоро добавит новые награды!" />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {rewards.map((r) => (
              <RewardCard key={r.id} reward={r} onPick={() => setSelected(r)} />
            ))}
          </div>
        )}

        {myRequests.length > 0 && (
          <>
            <h2 className="mb-2 mt-6 px-1 text-lg font-black text-ink">Мои заявки</h2>
            <div className="space-y-2">
              {myRequests.map((req) => (
                <Card key={req.id} className="flex items-center gap-3 px-3 py-2.5">
                  <PackageCheck size={18} className="shrink-0 text-grape" />
                  <p className="min-w-0 flex-1 truncate text-sm font-black text-ink">{req.rewardTitle}</p>
                  <StatusChip status={req.status} />
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <ExchangeModal reward={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/** Витрина сюрприз-яиц: одно яйцо = случайное существо выбранной редкости */
function EggShop() {
  const state = useAppState();
  const { toast } = useUi();
  const [selected, setSelected] = useState<Rarity | null>(null);

  const available = RARITIES.filter((r) => state.pets.some((p) => p.source === 'catalog' && !p.variantOf && p.rarity === r));

  if (available.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title="Яйца закончились" text="Новые существа скоро появятся!" />
      </div>
    );
  }

  return (
    <>
      <p className="mt-3 px-1 text-xs font-semibold text-ink/50">
        Купи яйцо — внутри случайное существо этой редкости. Если оно уже есть у Сони, выпадет
        его редкая вариация с новым именем и цветом!
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {available.map((rarity) => {
          const rc = RARITY_COLORS[rarity];
          const price = EGG_PRICE[rarity];
          const count = state.pets.filter((p) => p.source === 'catalog' && !p.variantOf && p.rarity === rarity).length;
          const affordable = state.profile.coins >= price;
          return (
            <Card key={rarity} className="flex flex-col items-center overflow-hidden p-3 text-center">
              <div
                className="flex h-24 w-full items-center justify-center rounded-2xl"
                style={{ background: `linear-gradient(180deg, ${rc.soft}, #fff)` }}
              >
                <EggArt rarity={rarity} seed={count * 7} size={76} />
              </div>
              <p className="mt-2 text-xs font-black text-ink">Сюрприз-яйцо</p>
              <Chip className={cn('mt-1 border', rc.soft, rc.text)} style={{ borderColor: rc.ring }}>
                {RARITY_LABELS[rarity]}
              </Chip>
              <p className="mt-1 text-[10px] font-bold text-ink/40">
                существ: {count} · рост {formatDuration(eggGrowMs(rarity))}
              </p>
              <div className="mt-auto flex w-full items-center justify-between pt-2">
                <Chip className="bg-night px-2 py-1 text-sun">
                  <Coins size={12} /> {price}
                </Chip>
                <Button size="sm" variant={affordable ? 'sun' : 'secondary'} onClick={() => setSelected(rarity)}>
                  Купить
                </Button>
              </div>
              {!affordable && (
                <p className="mt-1 text-[10px] font-bold text-red-500">Не хватает {price - state.profile.coins} монет</p>
              )}
            </Card>
          );
        })}
      </div>
      <BuyEggModal rarity={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function BuyEggModal({ rarity, onClose }: { rarity: Rarity | null; onClose: () => void }) {
  const state = useAppState();
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  if (!rarity) return null;

  const rc = RARITY_COLORS[rarity];
  const price = EGG_PRICE[rarity];
  const coins = state.profile.coins;
  const enough = coins >= price;

  const confirm = async () => {
    setBusy(true);
    try {
      await buyEgg(rarity);
      toast('Яйцо куплено! Оно ждёт среди питомцев.', 'success');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Не получилось купить', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Купить сюрприз-яйцо?">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl p-1" style={{ background: rc.soft }}>
          <EggArt rarity={rarity} seed={1} size={64} />
        </div>
        <div className="text-left">
          <p className="font-black text-ink">Сюрприз-яйцо</p>
          <p className="text-xs font-semibold text-ink/55">
            Редкость: <span className="font-black" style={{ color: rc.text }}>{RARITY_LABELS[rarity]}</span> ·
            рост: {formatDuration(eggGrowMs(rarity))}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-ink/45">
            Внутри случайное существо — или его редкая вариация!
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-mist p-3">
        <div className="flex justify-between text-sm font-black">
          <span className="text-ink/60">Цена</span>
          <span className="text-grape">{price} монет</span>
        </div>
        <div className="flex justify-between text-sm font-black">
          <span className="text-ink/60">У тебя</span>
          <span className={enough ? 'text-green-600' : 'text-red-500'}>{coins} монет</span>
        </div>
        {!enough && (
          <p className="mt-2 text-xs font-bold text-red-500">Не хватает {price - coins} монет. Выполни задания!</p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="sun" onClick={confirm} disabled={!enough || busy}>
          Купить за {price}
        </Button>
      </div>
    </Modal>
  );
}

function formatDuration(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} мин`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Ждёт маму', cls: 'bg-sky/15 text-sky' },
    approved: { label: 'Одобрено', cls: 'bg-green-100 text-green-700' },
    issued: { label: 'Выдано', cls: 'bg-grape/10 text-grape' },
    rejected: { label: 'Отклонено', cls: 'bg-red-100 text-red-700' },
  };
  const m = map[status] ?? map.pending;
  return <Chip className={m.cls}>{m.label}</Chip>;
}

function RewardCard({ reward, onPick }: { reward: Reward; onPick: () => void }) {
  const state = useAppState();
  const affordable = state.profile.coins >= reward.cost;
  const requested = state.rewardRequests.some((r) => r.rewardId === reward.id && r.status === 'pending');

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex justify-center bg-gradient-to-b from-sun/15 to-white pt-3">
        {reward.imageUrl ? (
          <img src={reward.imageUrl} alt={reward.title} className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <RewardArt seed={reward.imageSeed} size={84} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-black leading-tight text-ink">{reward.title}</p>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold text-ink/50">{reward.description}</p>
        <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-1.5 pt-2">
          <Chip className="shrink-0 bg-night px-2 py-1 text-sun">
            <Coins size={12} /> {reward.cost}
          </Chip>
          {requested ? (
            <Chip className="bg-sky/15 text-sky">Ждёт маму</Chip>
          ) : (
            <Button size="sm" variant={affordable ? 'primary' : 'secondary'} onClick={onPick}>
              Обменять
            </Button>
          )}
        </div>
        {!affordable && !requested && (
          <p className="mt-1.5 text-[10px] font-bold text-red-500">Не хватает {reward.cost - state.profile.coins} монет</p>
        )}
      </div>
    </Card>
  );
}

function ExchangeModal({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const state = useAppState();
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  if (!reward) return null;

  const coins = state.profile.coins;
  const enough = coins >= reward.cost;
  const missing = Math.max(0, reward.cost - coins);

  const confirm = async () => {
    setBusy(true);
    try {
      await requestReward(reward.id);
      toast('Заявка отправлена! Мама проверит её в родительском режиме.', 'success');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Не получилось оформить заявку', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Обменять монеты?">
      <div className="flex items-center gap-3">
        {reward.imageUrl ? (
          <img src={reward.imageUrl} alt={reward.title} className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <RewardArt seed={reward.imageSeed} size={64} />
        )}
        <div>
          <p className="font-black text-ink">{reward.title}</p>
          <p className="text-xs font-semibold text-ink/55">{reward.description}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-mist p-3">
        <div className="flex justify-between text-sm font-black">
          <span className="text-ink/60">Стоимость</span>
          <span className="text-grape">{reward.cost} монет</span>
        </div>
        <div className="flex justify-between text-sm font-black">
          <span className="text-ink/60">У тебя</span>
          <span className={enough ? 'text-green-600' : 'text-red-500'}>{coins} монет</span>
        </div>
        {!enough ? (
          <>
            <p className="mt-2 text-xs font-bold text-red-500">Не хватает {missing} монет. Выполни ещё заданий!</p>
            <ProgressBar value={coins} max={reward.cost} className="mt-1.5" gradient={false} />
          </>
        ) : (
          <p className="mt-2 text-xs font-bold text-ink/50">
            Монеты спишутся, когда мама одобрит заявку.
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button onClick={confirm} disabled={!enough || busy} className={cn(!enough && 'pointer-events-none opacity-50')}>
          Подтвердить
        </Button>
      </div>
    </Modal>
  );
}
