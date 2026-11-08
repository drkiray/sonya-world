// ─── Модели данных «Мир Сонечки» ───────────────────────────────────────────

export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic'
  | 'Secret';

export const RARITIES: Rarity[] = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Secret',
];

export type CollectionStatus = 'not_found' | 'wanted' | 'owned';

export type PetSource = 'catalog' | 'custom';

export interface Pet {
  id: string;
  name: string;
  rarity: Rarity;
  category: string;
  description: string;
  /** dataURL локальной картинки либо null (тогда рисуем процедурный арт) */
  imageUrl: string | null;
  /** Процедурный сид для генеративной иллюстрации */
  artSeed: number;
  source: PetSource;
  /** Отметка Demo для демонстрационных существ */
  isDemo: boolean;
  /** Источник каталога, например «Steal an Egg» или «Демо-каталог» */
  catalogOrigin: string | null;
  sourceVerified: boolean;
  createdAt: string;
}

/** Пользовательский питомец — расширение поверх Pet */
export interface CustomPet extends Pet {
  source: 'custom';
  note: string;
  photo: string | null; // dataURL фотографии с устройства
}

export interface CollectionEntry {
  petId: string;
  status: CollectionStatus;
  favorite: boolean;
  updatedAt: string;
}

export type QuestCategory =
  | 'daily'
  | 'weekly'
  | 'special'
  | 'creative'
  | 'family';

export const QUEST_CATEGORY_LABELS: Record<QuestCategory, string> = {
  daily: 'Ежедневные',
  weekly: 'Еженедельные',
  special: 'Особенные',
  creative: 'Творческие',
  family: 'Семейные',
};

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'special';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  rewardCoins: number;
  rewardXp: number;
  enabled: boolean;
  isDemo: boolean;
  /** Дата, когда квест последний раз был выполнен (для сброса ежедневных) */
  lastCompletedOn: string | null;
  createdAt: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface QuestSubmission {
  id: string;
  questId: string;
  questTitle: string;
  status: SubmissionStatus;
  comment: string;
  photo: string | null;
  /** Комментарий мамы при отклонении */
  parentComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export type RewardCategory = 'robux' | 'gift' | 'surprise' | 'virtual';

export const REWARD_CATEGORY_LABELS: Record<RewardCategory, string> = {
  robux: 'Robux',
  gift: 'Подарки',
  surprise: 'Сюрпризы',
  virtual: 'Виртуальные предметы',
};

export interface Reward {
  id: string;
  title: string;
  description: string;
  category: RewardCategory;
  cost: number;
  imageSeed: number;
  imageUrl: string | null;
  enabled: boolean;
  isDemo: boolean;
  createdAt: string;
}

export type RewardRequestStatus = 'pending' | 'approved' | 'rejected' | 'issued';

export interface RewardRequest {
  id: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  status: RewardRequestStatus;
  parentComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
  issuedAt: string | null;
}

export type TransactionType =
  | 'quest_reward'
  | 'reward_purchase'
  | 'manual_adjust'
  | 'achievement_bonus';

export type TransactionActor = 'child' | 'parent' | 'system';

export interface Transaction {
  id: string;
  amount: number; // положительное — начисление, отрицательное — списание
  type: TransactionType;
  description: string;
  /** Идемпотентность: одна операция с referenceId не повторяется */
  referenceId: string | null;
  actor: TransactionActor;
  createdAt: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  /** ключ иконки из набора достижений */
  icon: string;
}

export interface ChildAchievement {
  achievementId: string;
  unlockedAt: string;
}

export interface Profile {
  childName: string;
  avatarSeed: number;
  level: number;
  xp: number;
  coins: number;
  createdAt: string;
  /** Серия ежедневных входов */
  streakDays: number;
  lastLoginDay: string | null;
  soundEnabled: boolean;
  /** Собственная фотография-аватар (dataURL), выбранная в профиле */
  avatarPhoto?: string | null;
}

export interface AppMeta {
  seededAt: string;
  parentPin: string;
  schemaVersion: number;
}

// ─── DTO для импорта каталога ──────────────────────────────────────────────

export interface CatalogImportItem {
  id: string;
  name: string;
  rarity: Rarity;
  category: string;
  description: string;
  imageUrl: string | null;
  source: string;
  sourceVerified: boolean;
}

export interface ImportResult {
  added: number;
  skippedDuplicates: number;
  errors: string[];
}
