import type { AppState } from './store';
import type { AchievementDef } from '../types';
import { RARITIES } from '../types';

// Оригинальные достижения. icon — ключ из ACHIEVEMENT_ICONS (см. components/art.tsx)
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-egg', title: 'Первое яйцо', description: 'Купи первое яйцо в магазине или найди питомца', icon: 'egg' },
  { id: 'first-pet', title: 'Первый питомец', description: 'Появился первый питомец в коллекции', icon: 'paw' },
  { id: 'collector-10', title: 'Коллекционер 10', description: 'Собери 10 питомцев', icon: 'grid' },
  { id: 'collector-25', title: 'Коллекционер 25', description: 'Собери 25 питомцев', icon: 'crown' },
  { id: 'first-rare', title: 'Первый редкий', description: 'Заведи питомца редкости Epic или выше', icon: 'gem' },
  { id: 'first-quest', title: 'Первое задание', description: 'Выполни первое задание', icon: 'clipboard' },
  { id: 'quest-5', title: '5 выполненных заданий', description: 'Выполни пять заданий', icon: 'medal' },
  { id: 'quest-10', title: '10 выполненных заданий', description: 'Выполни десять заданий', icon: 'trophy' },
  { id: 'streak-7', title: 'Серия из 7 дней', description: 'Заходи в мир 7 дней подряд', icon: 'flame' },
];

const RARE_ORDER = RARITIES;

export function checkAchievements(state: AppState): string[] {
  // Особые питомцы (Сова дяди Ярика) не считаются: достижения — только за найденных
  const owned = state.pets.filter((p) => !p.special && state.collection[p.id]?.status === 'owned');
  const ownedCount = owned.length;
  const eggCount = Object.values(state.collection).filter(
    (e) => (e.status === 'egg' || e.status === 'growing') && state.pets.some((p) => p.id === e.petId && !p.special),
  ).length;
  const approvedSubs = state.submissions.filter((s) => s.status === 'approved').length;
  const hasRare = owned.some((p) => RARE_ORDER.indexOf(p.rarity) >= RARE_ORDER.indexOf('Эпическая'));

  const checks: Record<string, boolean> = {
    'first-egg': ownedCount >= 1 || eggCount >= 1,
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
