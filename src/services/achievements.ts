import type { AppState } from './store';
import type { AchievementDef } from '../types';

// Оригинальные достижения. icon — ключ из ACHIEVEMENT_ICONS (см. components/art.tsx)
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-egg', title: 'Первое яйцо', description: 'Отметь яйцо или питомца, которого хочешь получить', icon: 'egg' },
  { id: 'first-pet', title: 'Первый питомец', description: 'Появился первый питомец в коллекции', icon: 'paw' },
  { id: 'collector-10', title: 'Коллекционер 10', description: 'Собери 10 питомцев', icon: 'grid' },
  { id: 'collector-25', title: 'Коллекционер 25', description: 'Собери 25 питомцев', icon: 'crown' },
  { id: 'first-rare', title: 'Первый редкий', description: 'Заведи питомца редкости Epic или выше', icon: 'gem' },
  { id: 'first-quest', title: 'Первое задание', description: 'Выполни первое задание', icon: 'clipboard' },
  { id: 'quest-5', title: '5 выполненных заданий', description: 'Выполни пять заданий', icon: 'medal' },
  { id: 'quest-10', title: '10 выполненных заданий', description: 'Выполни десять заданий', icon: 'trophy' },
  { id: 'streak-7', title: 'Серия из 7 дней', description: 'Заходи в мир 7 дней подряд', icon: 'flame' },
];

const RARE_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret'];

export function checkAchievements(state: AppState): string[] {
  const owned = state.pets.filter((p) => state.collection[p.id]?.status === 'owned');
  const ownedCount = owned.length;
  const wantedCount = Object.values(state.collection).filter((e) => e.status === 'wanted').length;
  const approvedSubs = state.submissions.filter((s) => s.status === 'approved').length;
  const hasRare = owned.some((p) => RARE_ORDER.indexOf(p.rarity) >= RARE_ORDER.indexOf('Epic'));

  const checks: Record<string, boolean> = {
    'first-egg': ownedCount >= 1 || wantedCount >= 1,
    'first-pet': ownedCount >= 1,
    'collector-10': ownedCount >= 10,
    'collector-25': ownedCount >= 25,
    'first-rare': hasRare,
    'first-quest': approvedSubs >= 1,
    'quest-5': approvedSubs >= 5,
    'quest-10': approvedSubs >= 10,
    'streak-7': state.profile.streakDays >= 7,
  };

  return Object.entries(checks)
    .filter(([, ok]) => ok)
    .map(([id]) => id);
}
