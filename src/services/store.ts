// ─── Центральный сервис данных и бизнес-логики (Local Demo Mode) ──────────
// Все операции, влияющие на баланс, атомарны (batch) и идемпотентны
// (проверка referenceId среди транзакций).

import { idb, uid, todayKey } from './db';
import {
  buildDemoPets,
  buildDemoQuests,
  buildDemoRewards,
  buildInitialMeta,
  buildInitialProfile,
  buildOneTimeQuests,
  buildSonyaQuests,
  OWL_PET,
} from './seed';
import { ACHIEVEMENTS, checkAchievements } from './achievements';
import { playSound } from './sound';
import type {
  AppMeta,
  Rarity,
  CatalogImportItem,
  ChildAchievement,
  CollectionEntry,
  CollectionStatus,
  CustomPet,
  ImportResult,
  Pet,
  Profile,
  Quest,
  QuestSubmission,
  Reward,
  RewardRequest,
  Transaction,
  TransactionActor,
} from '../types';
import { LEGACY_RARITIES } from '../types';
import { makeVariant } from './variants';

export interface AppState {
  ready: boolean;
  profile: Profile;
  pets: Pet[];
  collection: Record<string, CollectionEntry>;
  quests: Quest[];
  submissions: QuestSubmission[];
  rewards: Reward[];
  rewardRequests: RewardRequest[];
  transactions: Transaction[];
  achievements: ChildAchievement[];
  meta: AppMeta;
}

const PROFILE_ID = 'main';
const META_ID = 'main';

let state: AppState = {
  ready: false,
  profile: buildInitialProfile(),
  pets: [],
  collection: {},
  quests: [],
  submissions: [],
  rewards: [],
  rewardRequests: [],
  transactions: [],
  achievements: [],
  meta: buildInitialMeta(),
};

const listeners = new Set<() => void>();

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState(): AppState {
  return state;
}

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  for (const fn of listeners) fn();
}

export class BizError extends Error {}

async function loadAll(): Promise<AppState> {
  const [meta, profileRow, pets, entries, quests, submissions, rewards, requests, transactions, achRows] =
    await Promise.all([
      idb.get<{ id: string } & AppMeta>('meta', META_ID),
      idb.get<{ id: string } & Profile>('profile', PROFILE_ID),
      idb.getAll<Pet>('pets'),
      idb.getAll<CollectionEntry>('collection'),
      idb.getAll<Quest>('quests'),
      idb.getAll<QuestSubmission>('submissions'),
      idb.getAll<Reward>('rewards'),
      idb.getAll<RewardRequest>('rewardRequests'),
      idb.getAll<Transaction>('transactions'),
      idb.getAll<{ id: string } & ChildAchievement>('achievements'),
    ]);

  const baseProfile = profileRow ?? { id: PROFILE_ID, ...buildInitialProfile() };

  // Серия входов: +1 день, если вчера был вход; сброс, если пропуск
  const today = todayKey();
  let streak = baseProfile.streakDays || 1;
  let lastLogin = baseProfile.lastLoginDay;
  if (lastLogin !== today) {
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    streak = lastLogin === yesterday ? (baseProfile.streakDays || 0) + 1 : 1;
    lastLogin = today;
  }
  const profile: Profile = { ...baseProfile, streakDays: streak, lastLoginDay: lastLogin };

  const collection: Record<string, CollectionEntry> = {};
  for (const e of entries) collection[e.petId] = e;

  return {
    ready: true,
    profile,
    pets,
    collection,
    quests,
    submissions,
    rewards,
    rewardRequests: requests,
    transactions,
    achievements: achRows.map(({ id, ...rest }) => rest),
    meta: meta ?? { id: META_ID, ...buildInitialMeta() },
  };
}

async function persistMeta(meta: AppMeta) {
  await idb.put('meta', { id: META_ID, ...meta });
}

async function persistProfile(profile: Profile) {
  await idb.put('profile', { id: PROFILE_ID, ...profile });
}

export async function initStore(): Promise<void> {
  const existing = await idb.getAll('pets');
  if (existing.length === 0) {
    await seedDemoData();
  }
  let loaded = await loadAll();

  // Миграция старых английских редкостей → новые русские названия
  const legacyPets = loaded.pets.filter((p) => LEGACY_RARITIES[p.rarity as string]);
  if (legacyPets.length > 0) {
    const migrated = legacyPets.map((p) => ({ ...p, rarity: LEGACY_RARITIES[p.rarity as string] }));
    await idb.batch(migrated.map((value) => ({ store: 'pets' as const, value })));
    const byId = new Map(migrated.map((p) => [p.id, p]));
    loaded = { ...loaded, pets: loaded.pets.map((p) => byId.get(p.id) ?? p) };
  }

  // Миграция старого статуса 'wanted' → 'not_found'
  const wantedEntries = Object.values(loaded.collection).filter((e) => e.status === ('wanted' as string));
  if (wantedEntries.length > 0) {
    const fixed = wantedEntries.map((e) => ({ ...e, id: e.petId, status: 'not_found' as CollectionStatus }));
    await idb.batch(fixed.map((value) => ({ store: 'collection' as const, value })));
    const byId = new Map(fixed.map((e) => [e.petId, e]));
    loaded = {
      ...loaded,
      collection: Object.fromEntries(Object.values(loaded.collection).map((e) => [e.petId, byId.get(e.petId) ?? e])),
    };
  }

  // Миграция текстов: убираем «демо» из описаний и источников
  const textFixed = loaded.pets
    .filter((p) => p.description.includes('демо-лес') || (p.catalogOrigin ?? '').includes('Демо'))
    .map((p) => ({
      ...p,
      description: p.description.replace('демо-лес', 'густом лесу'),
      catalogOrigin: p.catalogOrigin === 'Демо-каталог (вымышленные существа)' ? 'Каталог Мира Сонечки' : p.catalogOrigin,
    }));
  if (textFixed.length > 0) {
    await idb.batch(textFixed.map((value) => ({ store: 'pets' as const, value })));
    const byId = new Map(textFixed.map((p) => [p.id, p]));
    loaded = { ...loaded, pets: loaded.pets.map((p) => byId.get(p.id) ?? p) };
  }

  // Миграция магазина: заменить старые награды на новый набор
  if (loaded.rewards.some((r) => r.id.startsWith('reward-demo-'))) {
    const nowIso = new Date().toISOString();
    const fresh = buildDemoRewards(nowIso);
    const keep = loaded.rewards.filter((r) => !r.id.startsWith('reward-demo-'));
    await idb.batch(
      fresh.map((value) => ({ store: 'rewards' as const, value })),
      loaded.rewards.filter((r) => r.id.startsWith('reward-demo-')).map((r) => ({ store: 'rewards' as const, id: r.id })),
    );
    loaded = { ...loaded, rewards: [...keep, ...fresh] };
  }

  // Сова дяди Ярика: у всех с самого начала
  if (!loaded.pets.some((p) => p.id === OWL_PET.id)) {
    const entry: CollectionEntry & { id: string } = {
      id: OWL_PET.id,
      petId: OWL_PET.id,
      status: 'owned',
      favorite: false,
      hatchAt: null,
      updatedAt: new Date().toISOString(),
    };
    await idb.batch([
      { store: 'pets', value: OWL_PET },
      { store: 'collection', value: entry },
    ]);
    loaded = {
      ...loaded,
      pets: [...loaded.pets, OWL_PET],
      collection: { ...loaded.collection, [OWL_PET.id]: entry },
    };
  }

  // Одноразовые задания: пометить старые и подхватить новые
  const nowIso = new Date().toISOString();
  const oneTimeWrites: Array<{ store: 'quests'; value: Quest }> = [];
  const questsPatched = loaded.quests.map((q) => {
    if (q.id.startsWith('quest-demo-') && !q.oneTime) {
      const patched = { ...q, oneTime: true };
      oneTimeWrites.push({ store: 'quests', value: patched });
      return patched;
    }
    return q;
  });
  for (const q of buildOneTimeQuests(nowIso)) {
    if (!loaded.quests.some((x) => x.id === q.id)) {
      oneTimeWrites.push({ store: 'quests', value: q });
      questsPatched.push(q);
    }
  }
  if (oneTimeWrites.length > 0) {
    await idb.batch(oneTimeWrites);
    loaded = { ...loaded, quests: questsPatched };
  }

  // Подхват заданий Сони на уже установленных устройствах
  const now = new Date().toISOString();
  const missing = buildSonyaQuests(now).filter((q) => !loaded.quests.some((x) => x.id === q.id));
  if (missing.length > 0) {
    await idb.batch(missing.map((value) => ({ store: 'quests' as const, value })));
    loaded = { ...loaded, quests: [...loaded.quests, ...missing] };
  }

  setState(loaded);
}

async function seedDemoData(): Promise<void> {
  const now = new Date().toISOString();
  const { pets, ownedIds, wantedIds } = buildDemoPets(now);
  const quests = buildDemoQuests(now);
  const rewards = buildDemoRewards(now);
  const meta = { id: META_ID, ...buildInitialMeta() };
  const profile = { id: PROFILE_ID, ...buildInitialProfile() };
  const writes: Array<{ store: Parameters<typeof idb.batch>[0][number]['store']; value: { id: string } }> = [
    { store: 'meta', value: meta },
    { store: 'profile', value: profile },
    ...pets.map((p) => ({ store: 'pets' as const, value: p })),
    ...ownedIds.map((id) => ({
      store: 'collection' as const,
      value: { id, petId: id, status: 'owned' as CollectionStatus, favorite: false, updatedAt: now },
    })),
    ...wantedIds.map((id) => ({
      store: 'collection' as const,
      value: { id, petId: id, status: 'not_found' as CollectionStatus, favorite: false, updatedAt: now },
    })),
    { store: 'pets' as const, value: OWL_PET },
    {
      store: 'collection' as const,
      value: { id: OWL_PET.id, petId: OWL_PET.id, status: 'owned' as CollectionStatus, favorite: false, updatedAt: now },
    },
    ...quests.map((q) => ({ store: 'quests' as const, value: q })),
    ...rewards.map((r) => ({ store: 'rewards' as const, value: r })),
  ];
  await idb.batch(writes);
}

export async function resetDemoData(): Promise<void> {
  for (const s of ['pets', 'collection', 'quests', 'submissions', 'rewards', 'rewardRequests', 'transactions', 'achievements', 'profile', 'meta'] as const) {
    await idb.clear(s);
  }
  await seedDemoData();
  setState(await loadAll());
}

// ─── Коллекция ─────────────────────────────────────────────────────────────

export async function setPetStatus(petId: string, status: CollectionStatus): Promise<void> {
  const now = new Date().toISOString();
  const prev = state.collection[petId];
  const entry: CollectionEntry & { id: string } = {
    id: petId,
    petId,
    status,
    favorite: prev?.favorite ?? false,
    updatedAt: now,
  };
  await idb.put('collection', entry);
  setState({ collection: { ...state.collection, [petId]: entry } });
  await evaluateAchievements();
}

export async function toggleFavorite(petId: string): Promise<void> {
  const now = new Date().toISOString();
  const prev = state.collection[petId];
  const entry: CollectionEntry & { id: string } = {
    id: petId,
    petId,
    status: prev?.status ?? 'not_found',
    favorite: !prev?.favorite,
    updatedAt: now,
  };
  await idb.put('collection', entry);
  setState({ collection: { ...state.collection, [petId]: entry } });
}

export async function addCustomPet(
  data: Omit<CustomPet, 'id' | 'createdAt' | 'source' | 'isDemo' | 'catalogOrigin' | 'sourceVerified' | 'category' | 'note'>,
): Promise<Pet> {
  const pet: CustomPet = {
    category: 'Есть у меня',
    note: '',
    ...data,
    id: uid(),
    source: 'custom',
    isDemo: false,
    catalogOrigin: null,
    sourceVerified: true,
    createdAt: new Date().toISOString(),
  };
  await idb.put('pets', pet);
  const collectionEntry: CollectionEntry & { id: string } = {
    id: pet.id,
    petId: pet.id,
    status: 'owned',
    favorite: false,
    updatedAt: pet.createdAt,
  };
  await idb.put('collection', collectionEntry);
  setState({
    pets: [...state.pets, pet],
    collection: { ...state.collection, [pet.id]: collectionEntry },
  });
  await evaluateAchievements();
  return pet;
}

export async function deleteCustomPet(petId: string): Promise<void> {
  const pet = state.pets.find((p) => p.id === petId);
  if (!pet || pet.source !== 'custom') throw new BizError('Удалять можно только собственных питомцев');
  await idb.batch([], [{ store: 'pets', id: petId }, { store: 'collection', id: petId }]);
  const collection = { ...state.collection };
  delete collection[petId];
  setState({ pets: state.pets.filter((p) => p.id !== petId), collection });
  await evaluateAchievements();
}

// ─── Механика яиц: покупка → рост → вылупление ────────────────────────────

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Время роста яйца по редкости: от 5 минут до 7 дней */
export const EGG_GROW_MS: Record<Rarity, number> = {
  'Обычная': 5 * MIN,
  'Необычная': 15 * MIN,
  'Редкая': 30 * MIN,
  'Эпическая': 1 * HOUR,
  'Легендарная': 4 * HOUR,
  'Мифическая': 12 * HOUR,
  'Космическая': 1 * DAY,
  'Секретная': 2 * DAY,
  'Вечная': 4 * DAY,
  'Божественная': 7 * DAY,
};

/** Цена яйца в монетах по редкости */
export const EGG_PRICE: Record<Rarity, number> = {
  'Обычная': 10,
  'Необычная': 15,
  'Редкая': 20,
  'Эпическая': 30,
  'Легендарная': 50,
  'Мифическая': 80,
  'Космическая': 120,
  'Секретная': 200,
  'Вечная': 320,
  'Божественная': 400,
};

/** Фактическое время роста яйца: в режиме разработчика — 1 секунда */
export function eggGrowMs(rarity: Rarity): number {
  return state.profile.devMode ? 1000 : EGG_GROW_MS[rarity];
}

/** Опыт за вылупившееся яйцо по редкости */
export const EGG_XP: Record<Rarity, number> = {
  'Обычная': 5,
  'Необычная': 10,
  'Редкая': 20,
  'Эпическая': 40,
  'Легендарная': 60,
  'Мифическая': 90,
  'Космическая': 130,
  'Секретная': 180,
  'Вечная': 240,
  'Божественная': 320,
};

export type PetPhase = 'unknown' | 'egg' | 'growing' | 'owned';

/** Текущая фаза существа: загадка (нет яйца) → яйцо → растёт → появился */
export function petPhase(pet: Pet, entry?: CollectionEntry): PetPhase {
  if (pet.source === 'custom') return 'owned';
  if (entry?.status === 'owned') return 'owned';
  if (entry?.status === 'growing') return 'growing';
  if (entry?.status === 'egg') return 'egg';
  return 'unknown';
}

/** Покупка сюрприз-яйца по редкости: списание сразу, без подтверждения родителя.
 *  При покупке случайно выбирается существо этой редкости; если оно уже есть
 *  в коллекции — рождается редкая вариация с новым именем и визуалом. */
/** Счастливые яйца: внутри случайное существо из всего каталога */
const LUCKY_EGG_RARITIES: Rarity[] = ['Секретная', 'Вечная'];

export async function buyEgg(rarity: Rarity): Promise<Pet> {
  const pool = LUCKY_EGG_RARITIES.includes(rarity)
    ? state.pets.filter((p) => p.source === 'catalog' && !p.variantOf)
    : state.pets.filter((p) => p.source === 'catalog' && !p.variantOf && p.rarity === rarity);
  if (pool.length === 0) throw new BizError('Существ этой редкости пока нет в игре');

  // Пока есть ненайденные существа этой редкости — выпадает всегда новое.
  // Вариация рождается, только когда все существа редкости уже в коллекции.
  const unknownPool = pool.filter((p) => petPhase(p, state.collection[p.id]) === 'unknown');
  const newPets: Pet[] = [];
  let target: Pet;
  const ownedPool = pool.filter((p) => petPhase(p, state.collection[p.id]) === 'owned');
  if (unknownPool.length > 0) {
    target = unknownPool[Math.floor(Math.random() * unknownPool.length)];
  } else if (ownedPool.length === 0) {
    throw new BizError('Существа этой редкости скоро вылупятся — загляни чуть позже!');
  } else {
    const base = ownedPool[Math.floor(Math.random() * ownedPool.length)];
    const usedHues = [0, ...state.pets.filter((p) => p.variantOf === base.id).map((p) => p.hueShift ?? 0)];
    const variant = makeVariant(base, {
      existingNames: new Set(state.pets.map((p) => p.name.toLowerCase())),
      usedHues,
    });
    newPets.push(variant);
    target = variant;
  }

  const cost = EGG_PRICE[rarity];
  if (state.profile.coins < cost) throw new BizError(`Не хватает монет: нужно ${cost}, а у Сони ${state.profile.coins}`);

  const now = new Date().toISOString();
  const txRecord: Transaction = {
    id: uid(),
    amount: -cost,
    type: 'egg_purchase',
    description: newPets.length ? `Яйцо · вариация «${target.name}»` : `Яйцо «${target.name}»`,
    referenceId: `egg-purchase:${uid()}`,
    actor: 'child',
    createdAt: now,
  };
  const profile: Profile = { ...state.profile, coins: state.profile.coins - cost };
  const entry: CollectionEntry & { id: string } = {
    id: target.id,
    petId: target.id,
    status: 'egg',
    favorite: false,
    hatchAt: null,
    updatedAt: now,
  };

  await idb.batch([
    ...newPets.map((value) => ({ store: 'pets' as const, value })),
    { store: 'transactions', value: txRecord },
    { store: 'profile', value: { id: PROFILE_ID, ...profile } },
    { store: 'collection', value: entry },
  ]);
  setState({
    pets: newPets.length ? [...state.pets, ...newPets] : state.pets,
    transactions: [txRecord, ...state.transactions],
    profile,
    collection: { ...state.collection, [target.id]: entry },
  });
  playSound('coins');
  await evaluateAchievements();
  return target;
}

/** Запуск роста яйца */
export async function startGrowing(petId: string): Promise<void> {
  const pet = state.pets.find((p) => p.id === petId);
  if (!pet) throw new BizError('Питомец не найден');
  const entry = state.collection[petId];
  if (petPhase(pet, entry) !== 'egg') throw new BizError('Яйцо уже растёт или вылупилось');

  const updated: CollectionEntry & { id: string } = {
    ...entry!,
    id: petId,
    petId,
    status: 'growing',
    hatchAt: new Date(Date.now() + eggGrowMs(pet.rarity)).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await idb.put('collection', updated);
  setState({ collection: { ...state.collection, [petId]: updated } });
}

/** Вылупление всех созревших яиц. Вызывается при старте и по таймеру. */
export async function evaluateHatching(): Promise<Pet[]> {
  const now = Date.now();
  const due = state.pets.filter((p) => {
    const e = state.collection[p.id];
    return e?.status === 'growing' && e.hatchAt && Date.parse(e.hatchAt) <= now;
  });
  if (due.length === 0) return [];

  const writes: Array<{ store: 'collection' | 'profile'; value: { id: string } }> = [];
  const collection = { ...state.collection };
  const gainedXp = due.reduce((sum, pet) => sum + EGG_XP[pet.rarity], 0);
  for (const pet of due) {
    const prev = collection[pet.id]!;
    const updated: CollectionEntry & { id: string } = {
      ...prev,
      id: pet.id,
      status: 'owned',
      hatchAt: null,
      updatedAt: new Date().toISOString(),
    };
    writes.push({ store: 'collection', value: updated });
    collection[pet.id] = updated;
  }
  const profile: Profile = { ...state.profile, xp: state.profile.xp + gainedXp, level: levelForXp(state.profile.xp + gainedXp) };
  writes.push({ store: 'profile', value: { id: PROFILE_ID, ...profile } });
  await idb.batch(writes);
  setState({ collection, profile });
  playSound('hatch');
  await evaluateAchievements();
  return due;
}

/** Отпустить питомца на волю: свои и вариации исчезают совсем,
 *  базовые существа возвращаются в пул — снова могут выпасть из яйца. */
export async function releasePet(petId: string): Promise<void> {
  const pet = state.pets.find((p) => p.id === petId);
  if (!pet) throw new BizError('Питомец не найден');
  const entry = state.collection[petId];
  if (!entry || entry.status !== 'owned') throw new BizError('Отпустить можно только найденного питомца');
  if (pet.special) throw new BizError('Этого питомца нельзя отпустить — он особенный!');

  const removePet = pet.source === 'custom' || Boolean(pet.variantOf);
  await idb.batch(
    [],
    removePet
      ? [
          { store: 'pets', id: petId },
          { store: 'collection', id: petId },
        ]
      : [{ store: 'collection', id: petId }],
  );
  const pets = removePet ? state.pets.filter((p) => p.id !== petId) : state.pets;
  const collection = { ...state.collection };
  delete collection[petId];
  setState({ pets, collection });
  await evaluateAchievements();
}

// ─── Импорт каталога ───────────────────────────────────────────────────────

export async function importCatalog(items: CatalogImportItem[]): Promise<ImportResult> {
  const result: ImportResult = { added: 0, skippedDuplicates: 0, errors: [] };
  const existingIds = new Set(state.pets.map((p) => p.id));
  const names = new Set(state.pets.map((p) => p.name.toLowerCase()));
  const writes: Array<{ store: 'pets'; value: Pet }> = [];

  for (const [i, item] of items.entries()) {
    if (!item.id || !item.name) {
      result.errors.push(`Запись ${i + 1}: нет id или названия`);
      continue;
    }
    if (!item.rarity) {
      result.errors.push(`Запись ${i + 1} (${item.name}): не указана редкость`);
      continue;
    }
    if (existingIds.has(item.id)) {
      result.skippedDuplicates += 1;
      continue;
    }
    if (names.has(item.name.toLowerCase())) {
      result.skippedDuplicates += 1;
      continue;
    }
    const pet: Pet = {
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      category: item.category || 'Без категории',
      description: item.description || '',
      imageUrl: item.imageUrl ?? null,
      artSeed: hashSeed(item.id),
      source: 'catalog',
      isDemo: false,
      catalogOrigin: item.source || 'Steal an Egg',
      sourceVerified: Boolean(item.sourceVerified),
      createdAt: new Date().toISOString(),
    };
    writes.push({ store: 'pets', value: pet });
    existingIds.add(item.id);
    names.add(item.name.toLowerCase());
    result.added += 1;
  }
  if (writes.length) await idb.batch(writes);
  if (result.added > 0) setState({ pets: [...state.pets, ...writes.map((w) => w.value)] });
  return result;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 997;
}

// ─── Квесты (родитель) ─────────────────────────────────────────────────────

export async function saveQuest(quest: Quest): Promise<void> {
  const isNew = !state.quests.some((q) => q.id === quest.id);
  await idb.put('quests', quest);
  setState({ quests: isNew ? [...state.quests, quest] : state.quests.map((q) => (q.id === quest.id ? quest : q)) });
}

export async function deleteQuest(questId: string): Promise<void> {
  await idb.delete('quests', questId);
  setState({ quests: state.quests.filter((q) => q.id !== questId) });
}

// ─── Квесты (ребёнок): отправка на проверку ────────────────────────────────

export async function submitQuest(questId: string, comment: string, photo: string | null): Promise<QuestSubmission> {
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest || !quest.enabled) throw new BizError('Это задание сейчас недоступно');
  const alreadyPending = state.submissions.some((s) => s.questId === questId && s.status === 'pending');
  if (alreadyPending) throw new BizError('Это задание уже ждёт проверки у мамы');

  const submission: QuestSubmission = {
    id: uid(),
    questId,
    questTitle: quest.title,
    status: 'pending',
    comment,
    photo,
    parentComment: null,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };
  await idb.put('submissions', submission);
  setState({ submissions: [submission, ...state.submissions] });
  return submission;
}

// ─── Подтверждение/отклонение задания (родитель) ───────────────────────────
// Начисление монет происходит ТОЛЬКО здесь, атомарно и с идемпотентностью.

export async function reviewSubmission(submissionId: string, approve: boolean, parentComment?: string): Promise<void> {
  const sub = state.submissions.find((s) => s.id === submissionId);
  if (!sub) throw new BizError('Заявка не найдена');
  if (sub.status !== 'pending') throw new BizError('Заявка уже проверена — повторная проверка невозможна');

  const quest = state.quests.find((q) => q.id === sub.questId);
  const now = new Date().toISOString();
  const reviewed: QuestSubmission = {
    ...sub,
    status: approve ? 'approved' : 'rejected',
    parentComment: parentComment ?? null,
    reviewedAt: now,
  };

  const writes: Array<{ store: 'submissions' | 'transactions' | 'quests' | 'achievements' | 'profile'; value: { id: string } }> = [
    { store: 'submissions', value: reviewed },
  ];
  const newState: Partial<AppState> = {
    submissions: state.submissions.map((s) => (s.id === submissionId ? reviewed : s)),
  };

  if (approve && quest) {
    // Идемпотентность: одна заявка = одно начисление
    const refId = `quest-submission:${sub.id}`;
    if (state.transactions.some((t) => t.referenceId === refId)) {
      throw new BizError('Награда за эту заявку уже начислена');
    }
    const txRecord: Transaction = {
      id: uid(),
      amount: quest.rewardCoins,
      type: 'quest_reward',
      description: `Квест «${quest.title}»`,
      referenceId: refId,
      actor: 'parent',
      createdAt: now,
    };
    const profile: Profile = {
      ...state.profile,
      coins: state.profile.coins + quest.rewardCoins,
      xp: state.profile.xp + quest.rewardXp,
      level: levelForXp(state.profile.xp + quest.rewardXp),
    };
    const questUpdated: Quest = { ...quest, lastCompletedOn: todayKey() };
    writes.push(
      { store: 'transactions', value: txRecord },
      { store: 'profile', value: { id: PROFILE_ID, ...profile } },
    );
    newState.transactions = [txRecord, ...state.transactions];
    newState.profile = profile;
    writes.push({ store: 'quests', value: questUpdated });
    if (quest.oneTime) {
      // одноразовое задание исчезает после подтверждения
      newState.quests = state.quests.filter((q) => q.id !== quest.id);
    } else {
      newState.quests = state.quests.map((q) => (q.id === quest.id ? questUpdated : q));
    }
  }

  await idb.batch(writes);
  setState(newState);
  if (approve) playSound('coins');
  await evaluateAchievements();
}

// ─── Награды и заявки ──────────────────────────────────────────────────────

export async function saveReward(reward: Reward): Promise<void> {
  const isNew = !state.rewards.some((r) => r.id === reward.id);
  await idb.put('rewards', reward);
  setState({ rewards: isNew ? [...state.rewards, reward] : state.rewards.map((r) => (r.id === reward.id ? reward : r)) });
}

export async function deleteReward(rewardId: string): Promise<void> {
  await idb.delete('rewards', rewardId);
  setState({ rewards: state.rewards.filter((r) => r.id !== rewardId) });
}

export async function requestReward(rewardId: string): Promise<RewardRequest> {
  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward || !reward.enabled) throw new BizError('Эта награда сейчас недоступна');
  const alreadyPending = state.rewardRequests.some((r) => r.rewardId === rewardId && r.status === 'pending');
  if (alreadyPending) throw new BizError('Заявка на эту награду уже ждёт проверки');

  const request: RewardRequest = {
    id: uid(),
    rewardId,
    rewardTitle: reward.title,
    cost: reward.cost,
    status: 'pending',
    parentComment: null,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    issuedAt: null,
  };
  await idb.put('rewardRequests', request);
  setState({ rewardRequests: [request, ...state.rewardRequests] });
  return request;
}

export async function reviewRewardRequest(requestId: string, approve: boolean, parentComment?: string): Promise<void> {
  const req = state.rewardRequests.find((r) => r.id === requestId);
  if (!req) throw new BizError('Заявка не найдена');
  if (req.status !== 'pending') throw new BizError('Заявка уже проверена');

  const now = new Date().toISOString();
  const reviewed: RewardRequest = { ...req, status: approve ? 'approved' : 'rejected', parentComment: parentComment ?? null, reviewedAt: now };
  const writes: Array<{ store: 'rewardRequests' | 'transactions' | 'profile'; value: { id: string } }> = [
    { store: 'rewardRequests', value: reviewed },
  ];
  const newState: Partial<AppState> = {
    rewardRequests: state.rewardRequests.map((r) => (r.id === requestId ? reviewed : r)),
  };

  if (approve) {
    // Списание при одобрении — атомарно, с проверкой баланса и идемпотентностью
    const refId = `reward-request:${req.id}`;
    if (state.transactions.some((t) => t.referenceId === refId)) {
      throw new BizError('Монеты за эту заявку уже списаны');
    }
    if (state.profile.coins < req.cost) {
      throw new BizError(`Недостаточно монет: у Сони ${state.profile.coins}, нужно ${req.cost}`);
    }
    const txRecord: Transaction = {
      id: uid(),
      amount: -req.cost,
      type: 'reward_purchase',
      description: `Награда «${req.rewardTitle}»`,
      referenceId: refId,
      actor: 'parent',
      createdAt: now,
    };
    const profile: Profile = { ...state.profile, coins: state.profile.coins - req.cost };
    writes.push(
      { store: 'transactions', value: txRecord },
      { store: 'profile', value: { id: PROFILE_ID, ...profile } },
    );
    newState.transactions = [txRecord, ...state.transactions];
    newState.profile = profile;
  }

  await idb.batch(writes);
  setState(newState);
}

export async function markRewardIssued(requestId: string): Promise<void> {
  const req = state.rewardRequests.find((r) => r.id === requestId);
  if (!req) throw new BizError('Заявка не найдена');
  if (req.status !== 'approved') throw new BizError('Сначала одобрите заявку');
  const updated: RewardRequest = { ...req, status: 'issued', issuedAt: new Date().toISOString() };
  await idb.put('rewardRequests', updated);
  setState({ rewardRequests: state.rewardRequests.map((r) => (r.id === requestId ? updated : r)) });
}

// ─── Финансы: ручная корректировка (только родитель) ───────────────────────

export async function adjustBalance(amount: number, reason: string): Promise<void> {
  if (!Number.isFinite(amount) || amount === 0) throw new BizError('Укажите сумму (не ноль)');
  if (!reason.trim()) throw new BizError('Обязательно укажите причину корректировки');
  const newBalance = state.profile.coins + amount;
  if (newBalance < 0) throw new BizError(`Нельзя увести баланс в минус (сейчас ${state.profile.coins} монет)`);

  const txRecord: Transaction = {
    id: uid(),
    amount,
    type: 'manual_adjust',
    description: reason.trim(),
    referenceId: `manual:${uid()}`,
    actor: 'parent',
    createdAt: new Date().toISOString(),
  };
  const profile: Profile = { ...state.profile, coins: newBalance };
  await idb.batch([
    { store: 'transactions', value: txRecord },
    { store: 'profile', value: { id: PROFILE_ID, ...profile } },
  ]);
  setState({ transactions: [txRecord, ...state.transactions], profile });
}

// ─── Профиль ───────────────────────────────────────────────────────────────

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const profile = { ...state.profile, ...patch };
  await persistProfile(profile);
  setState({ profile });
}

export async function saveTelegramSettings(botToken: string, chatId: string): Promise<void> {
  const meta = { ...state.meta, telegramBotToken: botToken.trim(), telegramChatId: chatId.trim() };
  await persistMeta(meta);
  setState({ meta });
}

/** Отправка письма дяде Ярику через Telegram-бота мамы */
export async function sendLetterToYarik(message: string): Promise<void> {
  const text = message.trim();
  if (!text) throw new BizError('Напиши хоть пару слов!');
  const token = state.meta.telegramBotToken;
  const chatId = state.meta.telegramChatId;
  if (!token || !chatId) {
    throw new BizError('Мама ещё не настроила отправку писем: Родительская панель → Настройки → Telegram-бот');
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: `✉️ Письмо от Сони (Мир Сонечки):\n\n${text}` }),
  });
  if (!res.ok) throw new BizError('Не получилось отправить письмо. Попробуй позже.');

  // счётчик писем для достижений
  const meta = { ...state.meta, lettersSent: (state.meta.lettersSent ?? 0) + 1 };
  await persistMeta(meta);
  setState({ meta });
  playSound('success');
  await evaluateAchievements();
}

export async function verifyPin(pin: string): Promise<boolean> {
  return pin === state.meta.parentPin;
}

export async function changePin(newPin: string): Promise<void> {
  if (!/^\d{4}$/.test(newPin)) throw new BizError('PIN должен состоять из 4 цифр');
  const meta = { ...state.meta, parentPin: newPin };
  await persistMeta(meta);
  setState({ meta });
}

// ─── Достижения ────────────────────────────────────────────────────────────

export async function evaluateAchievements(): Promise<string[]> {
  const unlockedIds = new Set(state.achievements.map((a) => a.achievementId));
  const newly = checkAchievements(state).filter((id) => !unlockedIds.has(id));
  if (newly.length === 0) return [];

  const now = new Date().toISOString();
  const rows = newly.map((achievementId) => ({ id: achievementId, achievementId, unlockedAt: now }));
  await idb.batch(rows.map((value) => ({ store: 'achievements' as const, value })));
  setState({ achievements: [...state.achievements, ...rows.map(({ id, ...rest }) => rest)] });
  playSound('achievement');
  return newly;
}

export { ACHIEVEMENTS };

/** Опыт для перехода с уровня n на n+1: 100, 125, 150, 175, ... */
export function xpNeedForLevel(level: number): number {
  return 100 + (level - 1) * 25;
}

/** Уровень по суммарному опыту (растёт бесконечно) */
export function levelForXp(xp: number): number {
  let level = 1;
  let rest = xp;
  let need = xpNeedForLevel(1);
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = xpNeedForLevel(level);
  }
  return level;
}

export function xpProgress(profile: Profile): { intoLevel: number; needed: number } {
  let level = 1;
  let rest = profile.xp;
  let need = xpNeedForLevel(1);
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = xpNeedForLevel(level);
  }
  return { intoLevel: rest, needed: need };
}

export type { TransactionActor };
