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
  { id: 'eggs-10', title: '10 яиц', description: 'Купи 10 яиц в магазине', icon: 'egg' },
  { id: 'eggs-100', title: '100 яиц', description: 'Купи 100 яиц в магазине', icon: 'egg' },
  { id: 'first-cosmic', title: 'Первый космический', description: 'Заведи космического питомца или реже', icon: 'rocket' },
  { id: 'first-divine', title: 'Первый божественный', description: 'Заведи божественного питомца', icon: 'sun' },
  { id: 'letter-1', title: '1 письмо дяде', description: 'Отправь письмо дяде Ярику', icon: 'mail' },
  { id: 'letter-10', title: '10 писем у дяди', description: 'Отправь 10 писем дяде Ярику', icon: 'mailopen' },
  { id: 'collector-67', title: 'Коллекционер 67', description: 'Собери 67 питомцев', icon: 'crown' },
  { id: 'quest-50', title: '50 выполненных заданий', description: 'Выполни 50 заданий', icon: 'trophy' },
  { id: 'quest-150', title: '150 выполненных заданий', description: 'Выполни 150 заданий', icon: 'trophy' },
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

  const eggsBought = state.transactions.filter((t) => t.type === 'egg_purchase').length;
  const lettersSent = state.meta.lettersSent ?? 0;
  const hasCosmic = owned.some((p) => RARE_ORDER.indexOf(p.rarity) >= RARE_ORDER.indexOf('Космическая'));
  const hasDivine = owned.some((p) => RARE_ORDER.indexOf(p.rarity) >= RARE_ORDER.indexOf('Божественная'));

  const checks: Record<string, boolean> = {
    'first-egg': ownedCount >= 1 || eggCount >= 1,
    'first-pet': ownedCount >= 1,
    'collector-10': ownedCount >= 10,
    'collector-25': ownedCount >= 25,
    'collector-67': ownedCount >= 67,
    'first-rare': hasRare,
    'first-cosmic': hasCosmic,
    'first-divine': hasDivine,
    'first-quest': approvedSubs >= 1,
    'quest-5': approvedSubs >= 5,
    'quest-10': approvedSubs >= 10,
    'quest-50': approvedSubs >= 50,
    'quest-150': approvedSubs >= 150,
    'eggs-10': eggsBought >= 10,
    'eggs-100': eggsBought >= 100,
    'letter-1': lettersSent >= 1,
    'letter-10': lettersSent >= 10,
    'streak-7': state.profile.streakDays >= 7,
  };

  return Object.entries(checks)
    .filter(([, ok]) => ok)
    .map(([id]) => id);
}
