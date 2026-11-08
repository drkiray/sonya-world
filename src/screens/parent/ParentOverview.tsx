import { Link } from 'react-router-dom';
import { AlertCircle, Bell, Coins, Inbox, Package, PawPrint, ScrollText, Sparkles } from 'lucide-react';
import { useAppState } from '../../state/AppContext';
import { ACHIEVEMENTS } from '../../services/store';
import { Card, Chip } from '../../components/ui';

export default function ParentOverview() {
  const state = useAppState();
  const { profile, pets, collection, submissions, rewardRequests } = state;

  const owned = pets.filter((p) => collection[p.id]?.status === 'owned').length;
  const pendingSubs = submissions.filter((s) => s.status === 'pending');
  const pendingReqs = rewardRequests.filter((r) => r.status === 'pending');
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const issuedCount = rewardRequests.filter((r) => r.status === 'issued').length;
  const approvedAwaitIssue = rewardRequests.filter((r) => r.status === 'approved');
  const newAchievements = state.achievements.slice(-3).reverse();
  const notifications = pendingSubs.length + pendingReqs.length + approvedAwaitIssue.length;

  return (
    <div className="space-y-4">
      {/* Баланс */}
      <Card className="bg-gradient-to-br from-night to-[#35285E] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-white/60">Баланс Сони</p>
        <p className="mt-1 flex items-center gap-2 text-3xl font-black text-sun">
          <Coins size={26} /> {profile.coins}
        </p>
        <p className="mt-1 text-xs font-bold text-white/50">Уровень {profile.level} · {profile.xp} опыта · серия {profile.streakDays} дн.</p>
      </Card>

      {notifications > 0 && (
        <Card className="flex items-start gap-3 border-2 border-sun bg-sun/10 p-4">
          <Bell size={20} className="shrink-0 text-[#8A6100]" />
          <div className="text-sm font-bold text-ink">
            {pendingSubs.length > 0 && <p>{pendingSubs.length} {questWord(pendingSubs.length)} на проверке</p>}
            {pendingReqs.length > 0 && <p>{pendingReqs.length} {requestWord(pendingReqs.length)} на награды ждут решения</p>}
            {approvedAwaitIssue.length > 0 && <p>{approvedAwaitIssue.length} одобренных наград нужно выдать</p>}
          </div>
        </Card>
      )}
      {notifications === 0 && (
        <Card className="flex items-center gap-3 p-4 text-sm font-bold text-ink/50">
          <AlertCircle size={18} className="text-grape" /> Новых действий нет — всё проверено.
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <MiniStat icon={PawPrint} label="Питомцев в альбоме" value={owned} />
        <MiniStat icon={ScrollText} label="Квестов выполнено" value={approvedCount} />
        <MiniStat icon={Package} label="Наград выдано" value={issuedCount} />
        <MiniStat icon={Coins} label="Достижений открыто" value={state.achievements.length} />
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/parent/quests">
          <Card className="flex items-center gap-2 p-3 text-sm font-black text-grape active:scale-95 transition">
            <Inbox size={18} /> Проверить задания {pendingSubs.length > 0 && <Chip className="bg-red-100 px-1.5 text-red-600">{pendingSubs.length}</Chip>}
          </Card>
        </Link>
        <Link to="/parent/rewards">
          <Card className="flex items-center gap-2 p-3 text-sm font-black text-grape active:scale-95 transition">
            <Package size={18} /> Заявки на награды {pendingReqs.length > 0 && <Chip className="bg-red-100 px-1.5 text-red-600">{pendingReqs.length}</Chip>}
          </Card>
        </Link>
      </div>

      {newAchievements.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink/40">Новые достижения Сони</p>
          <div className="mt-2 space-y-1.5">
            {newAchievements.map((a) => {
              const def = ACHIEVEMENTS.find((d) => d.id === a.achievementId);
              return def ? (
                <p key={a.achievementId} className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <Sparkles size={14} className="text-sun" /> {def.title}
                  <span className="ml-1 text-xs font-semibold text-ink/40">{new Date(a.unlockedAt).toLocaleDateString('ru-RU')}</span>
                </p>
              ) : null;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-2 p-3">
      <Icon size={18} className="shrink-0 text-grape" />
      <div>
        <p className="text-lg font-black leading-none text-ink">{value}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase text-ink/40">{label}</p>
      </div>
    </Card>
  );
}

function questWord(n: number): string {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'задание';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'задания';
  return 'заданий';
}

function requestWord(n: number): string {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'заявка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'заявки';
  return 'заявок';
}
