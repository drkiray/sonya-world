import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { useAppState, useUi } from '../../state/AppContext';
import { deleteQuest, getState, reviewSubmission, saveQuest } from '../../services/store';
import { uid, todayKey } from '../../services/db';
import { Card, Chip, Modal, Button } from '../../components/ui';
import { QUEST_CATEGORY_LABELS, type Quest, type QuestCategory, type QuestDifficulty, type QuestSubmission } from '../../types';
import { cn } from '../../lib/cn';

export default function ParentQuests() {
  const state = useAppState();
  const { toast } = useUi();
  const [editing, setEditing] = useState<Quest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reviewing, setReviewing] = useState<QuestSubmission | null>(null);

  const pending = state.submissions.filter((s) => s.status === 'pending');
  const others = state.submissions.filter((s) => s.status !== 'pending').slice(0, 10);
  const quests = [...state.quests].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="space-y-4">
      {/* Заявки на проверку */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-ink">Заявки на проверку</h2>
        <Chip className={pending.length ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}>
          {pending.length ? `${pending.length} ждут` : 'всё проверено'}
        </Chip>
      </div>
      {pending.length === 0 ? (
        <Card className="p-4 text-sm font-bold text-ink/50">Новых выполнений пока нет.</Card>
      ) : (
        <div className="space-y-2">
          {pending.map((s) => (
            <Card key={s.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black text-ink">{s.questTitle}</p>
                  <p className="text-xs font-semibold text-ink/50">
                    {new Date(s.createdAt).toLocaleString('ru-RU')}
                  </p>
                  {s.comment && <p className="mt-1 text-sm font-semibold text-ink/70">«{s.comment}»</p>}
                  {s.photo && <img src={s.photo} alt="Фото результата" className="mt-2 max-h-36 rounded-2xl object-cover" />}
                </div>
                <Button size="sm" onClick={() => setReviewing(s)}>Проверить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Список заданий */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-ink">Задания Сони</h2>
        <Button size="sm" onClick={() => { setEditing(newQuest()); setShowForm(true); }}>
          <Plus size={15} /> Новое
        </Button>
      </div>
      <div className="space-y-2">
        {quests.map((q) => {
          const doneToday = q.lastCompletedOn === todayKey();
          return (
            <Card key={q.id} className={cn('flex items-center gap-3 p-3', !q.enabled && 'opacity-60')}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-black text-ink">{q.title}</p>
                  {q.isDemo && <Chip className="bg-sun/30 px-1.5 text-[10px] text-[#8A6100]">Demo</Chip>}
                  {doneToday && <Chip className="bg-green-100 px-1.5 text-[10px] text-green-700">Сегодня выполнено</Chip>}
                </div>
                <p className="text-xs font-semibold text-ink/50">
                  {QUEST_CATEGORY_LABELS[q.category]} · +{q.rewardCoins} монет, +{q.rewardXp} опыта
                </p>
              </div>
              <button
                onClick={async () => { await saveQuest({ ...q, enabled: !q.enabled }); }}
                className={cn('rounded-full p-2', q.enabled ? 'bg-green-100 text-green-600' : 'bg-ink/5 text-ink/40')}
                aria-label={q.enabled ? 'Отключить' : 'Включить'}
                title={q.enabled ? 'Отключить задание' : 'Включить задание'}
              >
                <Power size={15} />
              </button>
              <button onClick={() => { setEditing(q); setShowForm(true); }} className="rounded-full bg-grape/10 p-2 text-grape" aria-label="Редактировать">
                <Pencil size={15} />
              </button>
              <button
                onClick={async () => { await deleteQuest(q.id); toast('Задание удалено'); }}
                className="rounded-full bg-red-50 p-2 text-red-500"
                aria-label="Удалить"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          );
        })}
      </div>

      {/* История проверок */}
      {others.length > 0 && (
        <>
          <h2 className="text-base font-black text-ink">История проверок</h2>
          <div className="space-y-2">
            {others.map((s) => (
              <Card key={s.id} className="flex items-center gap-3 p-3">
                {s.status === 'approved' ? <Check size={16} className="shrink-0 text-green-600" /> : <X size={16} className="shrink-0 text-red-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">{s.questTitle}</p>
                  <p className="text-xs font-semibold text-ink/40">{new Date(s.createdAt).toLocaleString('ru-RU')}</p>
                </div>
                <Chip className={s.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                  {s.status === 'approved' ? 'Подтверждено' : 'Отклонено'}
                </Chip>
              </Card>
            ))}
          </div>
        </>
      )}

      <QuestFormModal quest={editing} open={showForm} onClose={() => setShowForm(false)} />
      <ReviewModal submission={reviewing} onClose={() => setReviewing(null)} />
    </div>
  );
}

function newQuest(): Quest {
  return {
    id: uid(),
    title: '',
    description: '',
    category: 'daily',
    difficulty: 'easy',
    rewardCoins: 5,
    rewardXp: 5,
    enabled: true,
    isDemo: false,
    lastCompletedOn: null,
    createdAt: new Date().toISOString(),
  };
}

function QuestFormModal({ quest, open, onClose }: { quest: Quest | null; open: boolean; onClose: () => void }) {
  const { toast } = useUi();
  const [draft, setDraft] = useState<Quest | null>(null);
  const isNew = quest ? !getState().quests.some((x) => x.id === quest.id) : true;

  useEffect(() => {
    if (open) setDraft(quest ?? newQuest());
    else setDraft(null);
  }, [open, quest]);

  if (!open || !draft) return null;

  const save = async () => {
    if (!draft.title.trim()) {
      toast('Укажите название задания', 'error');
      return;
    }
    if (draft.rewardCoins <= 0) {
      toast('Награда должна быть больше нуля', 'error');
      return;
    }
    await saveQuest({ ...draft, title: draft.title.trim() });
    toast('Задание сохранено', 'success');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? 'Новое задание' : 'Редактировать задание'}>
      <div className="space-y-3">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Название задания"
          className="w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
        />
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={2}
          placeholder="Описание — что нужно сделать"
          className="w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-black uppercase text-ink/40">
            Категория
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as QuestCategory })}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-2 py-2 text-sm font-bold normal-case text-ink outline-none"
            >
              {Object.entries(QUEST_CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black uppercase text-ink/40">
            Сложность
            <select
              value={draft.difficulty}
              onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as QuestDifficulty })}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-2 py-2 text-sm font-bold normal-case text-ink outline-none"
            >
              <option value="easy">Простое (5)</option>
              <option value="medium">Среднее (10–15)</option>
              <option value="hard">Сложное (20)</option>
              <option value="special">Особенное (30–50)</option>
            </select>
          </label>
          <label className="text-xs font-black uppercase text-ink/40">
            Награда, монет
            <input
              type="number" min={1} max={500}
              value={draft.rewardCoins}
              onChange={(e) => setDraft({ ...draft, rewardCoins: Number(e.target.value) })}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-2 py-2 text-sm font-bold text-ink outline-none"
            />
          </label>
          <label className="text-xs font-black uppercase text-ink/40">
            Опыт
            <input
              type="number" min={0} max={500}
              value={draft.rewardXp}
              onChange={(e) => setDraft({ ...draft, rewardXp: Number(e.target.value) })}
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
          Задание доступно Соне
        </label>
        <Button size="lg" className="w-full" onClick={save}>Сохранить</Button>
      </div>
    </Modal>
  );
}

function ReviewModal({ submission, onClose }: { submission: QuestSubmission | null; onClose: () => void }) {
  const { toast } = useUi();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  if (!submission) return null;

  const quest = getState().quests.find((q) => q.id === submission.questId);

  const review = async (approve: boolean) => {
    setBusy(true);
    try {
      await reviewSubmission(submission.id, approve, comment.trim() || undefined);
      toast(approve ? `Начислено ${quest?.rewardCoins ?? 0} монет` : 'Выполнение отклонено', approve ? 'success' : 'info');
      setComment('');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Ошибка проверки', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Проверка выполнения">
      <p className="font-black text-ink">{submission.questTitle}</p>
      {submission.comment && (
        <p className="mt-1 rounded-2xl bg-mist p-3 text-sm font-semibold text-ink/70">«{submission.comment}»</p>
      )}
      {submission.photo && <img src={submission.photo} alt="Фото" className="mt-2 max-h-48 rounded-2xl object-cover" />}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Комментарий (обязателен при отклонении)"
        className="mt-3 w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="danger" onClick={() => review(false)} disabled={busy || !comment.trim()}>
          <X size={16} /> Отклонить
        </Button>
        <Button onClick={() => review(true)} disabled={busy}>
          <Check size={16} /> Подтвердить (+{quest?.rewardCoins ?? 0})
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] font-bold text-ink/40">
        Монеты начислятся один раз — повторное начисление невозможно.
      </p>
    </Modal>
  );
}
