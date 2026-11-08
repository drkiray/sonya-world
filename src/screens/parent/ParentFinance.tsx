import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, KeyRound, PencilLine } from 'lucide-react';
import { useAppState, useUi } from '../../state/AppContext';
import { adjustBalance, changePin } from '../../services/store';
import { Card, Chip, Button, Modal } from '../../components/ui';
import type { Transaction } from '../../types';
import { cn } from '../../lib/cn';

const TYPE_LABELS: Record<Transaction['type'], string> = {
  quest_reward: 'Награда за задание',
  reward_purchase: 'Покупка награды',
  manual_adjust: 'Ручная корректировка',
  achievement_bonus: 'Бонус достижения',
};

export default function ParentFinance() {
  const state = useAppState();
  const { toast } = useUi();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const txs = state.transactions;
  const earned = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = txs.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);

  const submit = async (sign: 1 | -1) => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast('Введите положительную сумму', 'error');
      return;
    }
    if (!reason.trim()) {
      toast('Обязательно укажите причину корректировки', 'error');
      return;
    }
    setBusy(true);
    try {
      await adjustBalance(sign * n, reason);
      toast(`Баланс изменён на ${sign > 0 ? '+' : '−'}${n} монет`, 'success');
      setAmount('');
      setReason('');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Ошибка корректировки', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-night to-[#35285E] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-white/60">Текущий баланс</p>
        <p className="mt-1 flex items-center gap-2 text-3xl font-black text-sun">
          <Coins size={26} /> {state.profile.coins}
        </p>
        <div className="mt-2 flex gap-4 text-xs font-bold text-white/60">
          <span className="flex items-center gap-1"><ArrowDownLeft size={13} className="text-green-400" /> начислено {earned}</span>
          <span className="flex items-center gap-1"><ArrowUpRight size={13} className="text-rosa" /> списано {spent}</span>
        </div>
      </Card>

      {/* Ручная корректировка */}
      <Card className="p-4">
        <p className="flex items-center gap-2 text-base font-black text-ink">
          <PencilLine size={18} className="text-grape" /> Ручная корректировка
        </p>
        <p className="mt-0.5 text-xs font-semibold text-ink/50">
          Сумма и причина обязательны. Увести баланс в минус нельзя.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs font-black uppercase text-ink/40">
            Сумма
            <input
              type="number" min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="20"
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-bold normal-case text-ink outline-none focus:border-grape"
            />
          </label>
          <label className="text-xs font-black uppercase text-ink/40">
            Причина *
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: помощь по дому"
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-bold normal-case text-ink outline-none focus:border-grape"
            />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="danger" onClick={() => submit(-1)} disabled={busy || !amount}>
            <ArrowUpRight size={15} /> Списать
          </Button>
          <Button onClick={() => submit(1)} disabled={busy || !amount}>
            <ArrowDownLeft size={15} /> Начислить
          </Button>
        </div>
      </Card>

      <button onClick={() => setShowPin(true)} className="flex w-full items-center gap-2 text-sm font-bold text-grape">
        <KeyRound size={15} /> Сменить PIN родительского режима
      </button>

      {/* Журнал */}
      <h2 className="text-base font-black text-ink">Журнал операций ({txs.length})</h2>
      {txs.length === 0 ? (
        <Card className="p-4 text-sm font-bold text-ink/50">Операций пока не было.</Card>
      ) : (
        <div className="space-y-2">
          {txs.map((t) => (
            <Card key={t.id} className="flex items-center gap-3 p-3">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500',
                )}
              >
                {t.amount > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-ink">{t.description}</p>
                <p className="text-[11px] font-semibold text-ink/40">
                  {TYPE_LABELS[t.type]} · {new Date(t.createdAt).toLocaleString('ru-RU')} · от {actorLabel(t.actor)}
                </p>
              </div>
              <span className={cn('text-base font-black', t.amount > 0 ? 'text-green-600' : 'text-red-500')}>
                {t.amount > 0 ? '+' : '−'}{Math.abs(t.amount)}
              </span>
            </Card>
          ))}
        </div>
      )}

      <PinModal open={showPin} onClose={() => setShowPin(false)} />
    </div>
  );
}

function actorLabel(actor: Transaction['actor']): string {
  return actor === 'parent' ? 'мамы' : actor === 'child' ? 'Сони' : 'системы';
}

function PinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useUi();
  const [pin, setPin] = useState('');

  const save = async () => {
    try {
      await changePin(pin);
      toast('PIN изменён', 'success');
      setPin('');
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Ошибка', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Смена PIN-кода">
      <p className="text-sm font-semibold text-ink/60">Введите новый PIN из 4 цифр. Запомните его: восстановить нельзя.</p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="••••"
        className="mt-3 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-grape"
      />
      <Button size="lg" className="mt-3 w-full" onClick={save} disabled={pin.length !== 4}>
        Сохранить PIN
      </Button>
    </Modal>
  );
}
