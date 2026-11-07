import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint, ScrollText, Sparkles } from 'lucide-react';
import { useAppState } from '../state/AppContext';
import { AvatarArt, IslandHero, PetAvatar } from '../components/art';
import { CoinChip, OnlineChip } from '../components/StatusChips';
import { Button, Card, Chip, ProgressBar, SectionTitle } from '../components/ui';
import { xpProgress } from '../services/store';

export default function Home() {
  const state = useAppState();
  const { profile, pets, collection, quests, submissions, achievements } = state;

  const catalogPets = pets.filter((p) => p.source === 'catalog');
  const owned = pets.filter((p) => collection[p.id]?.status === 'owned');
  const ownedCatalog = catalogPets.filter((p) => collection[p.id]?.status === 'owned');
  const progressPct = catalogPets.length ? Math.round((ownedCatalog.length / catalogPets.length) * 100) : 0;

  const activeQuest = quests.find((q) => q.enabled && !submissions.some((s) => s.questId === q.id && s.status === 'pending'));
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const lastAchievements = achievements.slice(-3).reverse();
  const xp = xpProgress(profile);
  const featuredPet = owned[0] ?? pets[0];

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-4">
      {/* Шапка */}
      <header className="rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-6 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarArt seed={profile.avatarSeed} size={48} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-sun">Мир Сонечки</p>
              <h1 className="text-xl font-black leading-tight">Привет, {profile.childName}!</h1>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <CoinChip />
            <OnlineChip />
          </div>
        </div>

        {/* Игровой остров */}
        <div className="mt-4 overflow-hidden rounded-3xl shadow-pop">
          <IslandHero />
        </div>

        {/* Уровень и баланс */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">Уровень коллекционера</p>
            <p className="text-2xl font-black text-sun">{profile.level}</p>
            <ProgressBar value={xp.intoLevel} max={xp.needed} className="mt-1.5 h-2 bg-white/15" gradient={false} />
            <p className="mt-1 text-[11px] font-bold text-white/60">{xp.intoLevel}/{xp.needed} опыта</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
            {featuredPet && (
              <PetAvatar
                seed={featuredPet.artSeed}
                rarity={featuredPet.rarity}
                size={56}
                silhouette={collection[featuredPet.id]?.status !== 'owned'}
                className="animate-floaty shrink-0"
              />
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">Питомцы</p>
              <p className="text-2xl font-black text-white">
                {owned.length}
                <span className="text-sm font-bold text-white/50"> / {pets.length}</span>
              </p>
              <Chip className="mt-1 bg-sun/20 text-sun">собрано {progressPct}%</Chip>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4">
        {/* Прогресс коллекции */}
        <SectionTitle
          action={
            <Link to="/collection" className="flex items-center gap-1 text-sm font-bold text-grape">
              Открыть <ArrowRight size={15} />
            </Link>
          }
        >
          Прогресс коллекции
        </SectionTitle>
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-ink/60">Энциклопедия питомцев</span>
            <span className="text-grape">{ownedCatalog.length} из {catalogPets.length}</span>
          </div>
          <ProgressBar value={ownedCatalog.length} max={catalogPets.length} className="mt-2" />
          <p className="mt-2 text-xs font-semibold text-ink/50">
            {progressPct < 25 && 'Впереди ещё много удивительных питомцев!'}
            {progressPct >= 25 && progressPct < 60 && 'Отличный темп, коллекция растёт!'}
            {progressPct >= 60 && 'Почти все питомцы найдены — ты звезда!'}
          </p>
        </Card>

        {/* Активный квест */}
        <SectionTitle
          action={
            <Link to="/quests" className="flex items-center gap-1 text-sm font-bold text-grape">
              Все квесты <ArrowRight size={15} />
            </Link>
          }
        >
          Квест дня
        </SectionTitle>
        {activeQuest ? (
          <Card className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grape/10">
              <ScrollText className="text-grape" size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-black text-ink">{activeQuest.title}</p>
              <p className="truncate text-xs font-semibold text-ink/50">{activeQuest.description}</p>
            </div>
            <Chip className="bg-sun/25 text-[#8A6100]">+{activeQuest.rewardCoins}</Chip>
          </Card>
        ) : (
          <Card className="p-4 text-center text-sm font-bold text-ink/50">
            Все задания выполнены или ждут проверки у мамы. Загляни позже!
          </Card>
        )}
        {pendingCount > 0 && (
          <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-bold text-grape">
            <Sparkles size={14} /> {pendingCount === 1 ? 'Одно задание ждёт проверки у мамы' : `Заданий на проверке у мамы: ${pendingCount}`}
          </p>
        )}

        {/* Последние достижения */}
        <SectionTitle
          action={
            <Link to="/profile" className="flex items-center gap-1 text-sm font-bold text-grape">
              Все <ArrowRight size={15} />
            </Link>
          }
        >
          Достижения
        </SectionTitle>
        {lastAchievements.length === 0 ? (
          <Card className="p-4 text-sm font-semibold text-ink/50">
            Выполняй квесты и собирай питомцев — достижения найдут тебя сами!
          </Card>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {lastAchievements.map((a) => (
              <Card key={a.achievementId} className="flex shrink-0 items-center gap-2 px-3 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sun to-rosa">
                  <Sparkles size={15} className="text-white" />
                </span>
                <span className="text-xs font-black text-ink">{achievementsLabel(a.achievementId)}</span>
              </Card>
            ))}
          </div>
        )}

        <Link to="/collection" className="mt-6 block">
          <Button size="lg" className="w-full">
            <PawPrint size={20} /> Моя коллекция
          </Button>
        </Link>
      </main>
    </div>
  );
}

function achievementsLabel(id: string): string {
  const map: Record<string, string> = {
    'first-egg': 'Первое яйцо',
    'first-pet': 'Первый питомец',
    'collector-10': 'Коллекционер 10',
    'collector-25': 'Коллекционер 25',
    'first-rare': 'Первый редкий',
    'first-quest': 'Первое задание',
    'quest-5': '5 квестов',
    'quest-10': '10 квестов',
    'streak-7': 'Серия 7 дней',
  };
  return map[id] ?? id;
}
