import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Clock, Send } from 'lucide-react';
import { useAppState, useUi } from '../state/AppContext';
import { evaluateAchievements, submitQuest } from '../services/store';
import { QuestArt } from '../components/art';
import { Button, Card, Chip, EmptyState, Modal } from '../components/ui';
import { QUEST_CATEGORY_LABELS, type Quest } from '../types';
import { cn } from '../lib/cn';
import { todayKey } from '../services/db';

const DIFFICULTY_LABELS: Record<Quest['difficulty'], string> = {
  easy: 'Простое',
  medium: 'Среднее',
  hard: 'Сложное',
  special: 'Особенное',
};

export default function Quests() {
  const state = useAppState();

  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);

  const quests = useMemo(
    () => state.quests.filter((q) => q.enabled).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [state.quests],
  );

  // Достижения за выполненные задания открываются именно здесь — у Сони на глазах
  useEffect(() => {
    void evaluateAchievements();
  }, []);

  const doneToday = quests.filter((q) => q.lastCompletedOn === todayKey()).length;
  const pendingCount = state.submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-4">
      <header className="rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-5 pt-5 text-white">
        <h1 className="text-2xl font-black">Задания</h1>
        <p className="mt-0.5 text-sm font-bold text-white/60">
          Выполни задание — мама проверит и выдаст монеты
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-sun">{doneToday}</p>
            <p className="text-[10px] font-bold uppercase text-white/60">выполнено сегодня</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5">
            <p className="text-xl font-black text-sky">{pendingCount}</p>
            <p className="text-[10px] font-bold uppercase text-white/60">ждут проверки у мамы</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        {quests.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Здесь пока пусто" text="Мама скоро добавит новые задания!" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {quests.map((q) => (
              <QuestCard key={q.id} quest={q} onDo={() => setActiveQuest(q)} />
            ))}
          </div>
        )}
      </main>

      <SubmitModal quest={activeQuest} onClose={() => setActiveQuest(null)} />
    </div>
  );
}

function QuestCard({ quest, onDo }: { quest: Quest; onDo: () => void }) {
  const state = useAppState();
  const pending = state.submissions.find((s) => s.questId === quest.id && s.status === 'pending');
  const rejected = state.submissions.find((s) => s.questId === quest.id && s.status === 'rejected');
  const doneToday = quest.lastCompletedOn === todayKey();

  return (
    <Card className={cn('overflow-hidden p-3', pending && 'border-2 border-sky/40')}>
      {/* Верхняя строка: иконка · название · награда */}
      <div className="flex items-center gap-2.5">
        <div className="shrink-0">
          <QuestArt seed={questArtSeed(quest.id)} size={52} />
        </div>
        <p className="min-w-0 flex-1 font-black leading-tight text-ink">{quest.title}</p>
        <Chip className="shrink-0 bg-sun/25 px-2 py-1 text-[#8A6100]">
          +{quest.rewardCoins}
        </Chip>
      </div>

      {/* Описание */}
      <p className="mt-1.5 text-xs font-semibold leading-relaxed text-ink/55">{quest.description}</p>

      {rejected && (
        <p className="mt-1.5 rounded-xl bg-red-50 px-2 py-1.5 text-xs font-bold text-red-600">
          Мама отклонила{rejected.parentComment ? `: «${rejected.parentComment}»` : ''}. Попробуй ещё раз!
        </p>
      )}

      {/* Нижняя строка: теги слева, действие справа */}
      <div className="mt-2 flex items-center gap-1.5">
        <Chip className="bg-grape/10 px-2 py-0.5 text-[10px] text-grape">{QUEST_CATEGORY_LABELS[quest.category]}</Chip>
        <Chip className="bg-ink/5 px-2 py-0.5 text-[10px] text-ink/50">{DIFFICULTY_LABELS[quest.difficulty]}</Chip>
        <div className="ml-auto">
          {pending ? (
            <Chip className="bg-sky/15 text-sky">
              <Clock size={12} /> На проверке
            </Chip>
          ) : doneToday ? (
            <Chip className="bg-green-100 text-green-700">
              <CheckCheck size={12} /> Готово
            </Chip>
          ) : (
            <Button size="sm" onClick={onDo}>
              <Send size={13} /> Выполнить
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function questArtSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 997;
}

function SubmitModal({ quest, onClose }: { quest: Quest | null; onClose: () => void }) {
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!quest) return;
    setBusy(true);
    try {
      await submitQuest(quest.id, '', null);
      toast('Задание отправлено маме на проверку!', 'success');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Не получилось отправить', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={quest !== null} onClose={onClose} title={quest?.title ?? ''}>
      <p className="text-sm font-semibold text-ink/60">
        Монеты начислятся после проверки мамой. Она посмотрит и нажмёт «Подтвердить»!
      </p>
      <Button size="lg" className="mt-4 w-full" onClick={send} disabled={busy}>
        <Send size={16} /> {busy ? 'Отправляем…' : 'Отправить маме'}
      </Button>
    </Modal>
  );
}
