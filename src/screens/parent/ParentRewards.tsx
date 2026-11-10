import { useEffect, useState } from 'react';
import { Check, Gift, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAppState, useUi } from '../../state/AppContext';
import { deleteReward, getState, markRewardIssued, reviewRewardRequest, saveReward } from '../../services/store';
import { uid } from '../../services/db';
import { RewardArt } from '../../components/art';
import { Card, Chip, Modal, Button } from '../../components/ui';
import { REWARD_CATEGORY_LABELS, type Reward, type RewardCategory, type RewardRequest } from '../../types';
import { cn } from '../../lib/cn';

export default function ParentRewards() {
  const state = useAppState();
  const { toast } = useUi();
  const [editing, setEditing] = useState<Reward | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reviewing, setReviewing] = useState<RewardRequest | null>(null);

  const pending = state.rewardRequests.filter((r) => r.status === 'pending');
  const approved = state.rewardRequests.filter((r) => r.status === 'approved');
  const rewards = [...state.rewards].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="space-y-4">
      {/* Заявки */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-ink">Заявки на награды</h2>
        <Chip className={pending.length ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}>
          {pending.length ? `${pending.length} ждут` : 'пусто'}
        </Chip>
      </div>
      {pending.length === 0 && approved.length === 0 && (
        <Card className="p-4 text-sm font-bold text-ink/50">Новых заявок нет.</Card>
      )}
      <div className="space-y-2">
        {pending.map((r) => (
          <Card key={r.id} className="flex items-center gap-3 p-3">
            <Gift size={18} className="shrink-0 text-grape" />
            <div className="min-w-0 flex-1">
              <p className="font-black text-ink">{r.rewardTitle}</p>
              <p className="text-xs font-semibold text-ink/50">
                {new Date(r.createdAt).toLocaleString('ru-RU')} · стоимость {r.cost} монет
              </p>
            </div>
            <Button size="sm" onClick={() => setReviewing(r)}>Решить</Button>
          </Card>
        ))}
        {approved.map((r) => (
          <Card key={r.id} className="flex items-center gap-3 border-2 border-green-200 p-3">
            <Gift size={18} className="shrink-0 text-green-600" />
            <div className="min-w-0 flex-1">
              <p className="font-black text-ink">{r.rewardTitle}</p>
              <p className="text-xs font-semibold text-ink/50">Одобрено, монеты списаны. Выдайте награду Соне!</p>
            </div>
            <Button size="sm" variant="sun" onClick={async () => { await markRewardIssued(r.id); toast('Награда отмечена как выданная', 'success'); }}>
              <Check size={14} /> Выдано
            </Button>
          </Card>
        ))}
      </div>

      {/* Витрина */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-ink">Витрина наград</h2>
        <Button size="sm" onClick={() => { setEditing(newReward()); setShowForm(true); }}>
          <Plus size={15} /> Новая
        </Button>
      </div>
      <div className="space-y-2">
        {rewards.map((r) => (
          <Card key={r.id} className={cn('flex items-center gap-3 p-3', !r.enabled && 'opacity-60')}>
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.title} className="h-12 w-12 rounded-2xl object-cover" />
            ) : (
              <RewardArt seed={r.imageSeed} size={48} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-black text-ink">{r.title}</p>
              </div>
              <p className="text-xs font-semibold text-ink/50">
                {REWARD_CATEGORY_LABELS[r.category]} · {r.cost} монет{r.enabled ? '' : ' · отключена'}
              </p>
            </div>
            <button onClick={() => { setEditing(r); setShowForm(true); }} className="rounded-full bg-grape/10 p-2 text-grape" aria-label="Редактировать">
              <Pencil size={15} />
            </button>
            <button onClick={async () => { await deleteReward(r.id); toast('Награда удалена'); }} className="rounded-full bg-red-50 p-2 text-red-500" aria-label="Удалить">
              <Trash2 size={15} />
            </button>
          </Card>
        ))}
      </div>

      <RewardFormModal reward={editing} open={showForm} onClose={() => setShowForm(false)} />
      <RequestReviewModal request={reviewing} onClose={() => setReviewing(null)} />
    </div>
  );
}

function newReward(): Reward {
  return {
    id: uid(),
    title: '',
    description: '',
    category: 'gifts',
    cost: 10,
    imageSeed: Math.floor(Math.random() * 1000),
    imageUrl: null,
    enabled: true,
    isDemo: false,
    createdAt: new Date().toISOString(),
  };
}

function RewardFormModal({ reward, open, onClose }: { reward: Reward | null; open: boolean; onClose: () => void }) {
  const { toast } = useUi();
  const [draft, setDraft] = useState<Reward | null>(null);
  const isNew = reward ? !getState().rewards.some((x) => x.id === reward.id) : true;

  useEffect(() => {
    if (open) setDraft(reward ?? newReward());
    else setDraft(null);
  }, [open, reward]);

  if (!open || !draft) return null;

  const save = async () => {
    if (!draft.title.trim()) {
      toast('Укажите название награды', 'error');
      return;
    }
    if (draft.cost <= 0) {
      toast('Стоимость должна быть больше нуля', 'error');
      return;
    }
    await saveReward({ ...draft, title: draft.title.trim() });
    toast('Награда сохранена', 'success');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? 'Новая награда' : 'Редактировать награду'}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl bg-mist p-1">
            <RewardArt seed={draft.imageSeed} size={56} />
          </div>
          <button
            onClick={() => setDraft({ ...draft, imageSeed: Math.floor(Math.random() * 1000) })}
            className="rounded-2xl bg-grape/10 px-3 py-2 text-xs font-black text-grape active:scale-95"
          >
            Сменить картинку
          </button>
        </div>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Название награды"
          className="w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
        />
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={2}
          placeholder="Описание"
          className="w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-black uppercase text-ink/40">
            Категория
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as RewardCategory })}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-2 py-2 text-sm font-bold normal-case text-ink outline-none"
            >
              {Object.entries(REWARD_CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black uppercase text-ink/40">
            Стоимость, монет
            <input
              type="number" min={1} max={10000}
              value={draft.cost}
              onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) })}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-2 py-2 text-sm font-bold text-ink outline-none"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
            className="h-4 w-4 accent-grape"
          />
          Награда доступна в магазине
        </label>
        <Button size="lg" className="w-full" onClick={save}>Сохранить</Button>
      </div>
    </Modal>
  );
}

function RequestReviewModal({ request, onClose }: { request: RewardRequest | null; onClose: () => void }) {
  const state = useAppState();
  const { toast } = useUi();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  if (!request) return null;

  const decide = async (approve: boolean) => {
    setBusy(true);
    try {
      await reviewRewardRequest(request.id, approve, comment.trim() || undefined);
      toast(
        approve
          ? `Заявка одобрена, списано ${request.cost} монет. Не забудьте выдать награду!`
          : 'Заявка отклонена, монеты не списаны',
        approve ? 'success' : 'info',
      );
      setComment('');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Ошибка', 'error');
    } finally {
      setBusy(false);
    }
  };

  const enough = state.profile.coins >= request.cost;

  return (
    <Modal open onClose={onClose} title="Заявка на награду">
      <p className="font-black text-ink">{request.rewardTitle}</p>
      <p className="mt-1 text-sm font-semibold text-ink/60">
        Стоимость: {request.cost} монет · на балансе Сони: {state.profile.coins}
      </p>
      {!enough && (
        <p className="mt-2 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">
          Внимание: монет недостаточно. При одобрении заявка будет отклонена системой защиты от минуса.
        </p>
      )}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Комментарий Соне (при отклонении рекомендуется)"
        className="mt-3 w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="danger" onClick={() => decide(false)} disabled={busy}>
          <X size={16} /> Отклонить
        </Button>
        <Button onClick={() => decide(true)} disabled={busy || !enough}>
          <Check size={16} /> Одобрить (−{request.cost})
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] font-bold text-ink/40">
        Списание произойдёт один раз и защищено от повтора.
      </p>
    </Modal>
  );
}
