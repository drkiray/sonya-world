import type {
  CustomPet,
  Pet,
  Profile,
  Quest,
  Reward,
  AppMeta,
} from '../types';
import { todayKey } from './db';

// Демонстрационные существа. Это ВЫМЫШЛЕННЫЕ существа для демонстрации,
// они не являются реальными питомцами игры «Steal an Egg» (Укради яйцо)
// и заменяются настоящим каталогом через импорт JSON.

interface DemoPetDef {
  id: string;
  name: string;
  rarity: Pet['rarity'];
  category: string;
  description: string;
  seed: number;
}

const DEMO_PETS: DemoPetDef[] = [
  { id: 'demo-01', name: 'Пушистик-хранитель', rarity: 'Обычная', category: 'Лесные', seed: 11, description: 'Пушистик-хранитель обитает в демо-лесу Мира Сонечки. Любит ягоды и дневной сон.' },
  { id: 'demo-02', name: 'Росистый ежик', rarity: 'Обычная', category: 'Лесные', seed: 22, description: 'Ежик с иголками, похожими на капли росы. Собирает блестящие камешки.' },
  { id: 'demo-03', name: 'Хмурый камнеед', rarity: 'Необычная', category: 'Горные', seed: 33, description: 'Грызёт камни и пугает туристов-муравьёв. На самом деле очень добрый.' },
  { id: 'demo-04', name: 'Светлячок-певец', rarity: 'Необычная', category: 'Ночные', seed: 44, description: 'Светится в темноте и напевает колыбельные остальным питомцам.' },
  { id: 'demo-05', name: 'Облачный зайка', rarity: 'Редкая', category: 'Небесные', seed: 55, description: 'Прыгает по облакам и оставляет на них следы в виде звёздочек.' },
  { id: 'demo-06', name: 'Лисёнок-звездочёт', rarity: 'Редкая', category: 'Ночные', seed: 66, description: 'Записывает имена всех звёзд в маленькую тетрадку с золотым обрезом.' },
  { id: 'demo-07', name: 'Кристальный медвежонок', rarity: 'Эпическая', category: 'Горные', seed: 77, description: 'Его шерсть переливается, как грани кристалла. Спит в пещере изо льда.' },
  { id: 'demo-08', name: 'Портальный кот', rarity: 'Эпическая', category: 'Магические', seed: 88, description: 'Прыгает через маленькие порталы и иногда теряет свои носки в других мирах.' },
  { id: 'demo-09', name: 'Дракончик-сюрприз', rarity: 'Легендарная', category: 'Драконы', seed: 99, description: 'Вместо огня чихает конфетти. Очень старается выглядеть грозным.' },
  { id: 'demo-10', name: 'Лунная единорожка', rarity: 'Мифическая', category: 'Магические', seed: 110, description: 'Рог светится в полнолуние. Живёт на самом высоком холме острова.' },
  { id: 'demo-11', name: 'Хранитель радуги', rarity: 'Космическая', category: 'Небесные', seed: 121, description: 'Следит за тем, чтобы радуга всегда заканчивалась в сундуке с наградами.' },
  { id: 'demo-12', name: 'Тень-невидимка', rarity: 'Божественная', category: 'Магические', seed: 132, description: 'Его никто не видел, но все чувствуют, когда он доволен: пахнет печеньем.' },
];

export function buildDemoPets(now: string): { pets: Pet[]; ownedIds: string[]; wantedIds: string[] } {
  const pets: Pet[] = DEMO_PETS.map((d) => ({
    id: d.id,
    name: d.name,
    rarity: d.rarity,
    category: d.category,
    description: d.description,
    imageUrl: null,
    artSeed: d.seed,
    source: 'catalog',
    isDemo: true,
    catalogOrigin: 'Демо-каталог (вымышленные существа)',
    sourceVerified: false,
    createdAt: now,
  }));
  return { pets, ownedIds: [], wantedIds: ['demo-10', 'demo-12'] };
}

export const DEMO_USER_PETS: CustomPet[] = [
  {
    id: 'custom-demo-01',
    name: 'Мишка из пластилина',
    rarity: 'Обычная',
    category: 'Есть у меня',
    description: 'Соня слепила его сама из голубого пластилина.',
    imageUrl: null,
    artSeed: 7,
    source: 'custom',
    isDemo: true,
    catalogOrigin: null,
    sourceVerified: true,
    note: 'Первый питомец, слепленный Соней!',
    photo: null,
    createdAt: new Date().toISOString(),
  },
];

export function buildDemoQuests(now: string): Quest[] {
  return [
    { id: 'quest-demo-01', title: 'Найди нового питомца', description: 'Открой альбом и найди питомца, которого ещё нет у Сони. Расскажи, что он умеет.', category: 'daily', difficulty: 'easy', rewardCoins: 5, rewardXp: 5, enabled: true, isDemo: true, lastCompletedOn: null, createdAt: now },
    { id: 'quest-demo-02', title: 'Добавь питомца в альбом', description: 'Слепи, нарисуй или придумай своего питомца и добавь его через форму «Мой питомец».', category: 'daily', difficulty: 'medium', rewardCoins: 10, rewardXp: 10, enabled: true, isDemo: true, lastCompletedOn: null, createdAt: now },
    { id: 'quest-demo-03', title: 'Найди питомца редкости «Эпическая» или выше', description: 'Посмотри в энциклопедии, каких редких питомцев можно отыскать, и напиши, кого хочешь поймать.', category: 'special', difficulty: 'hard', rewardCoins: 20, rewardXp: 20, enabled: true, isDemo: true, lastCompletedOn: null, createdAt: now },
    { id: 'quest-demo-04', title: 'Нарисуй собственное яйцо', description: 'Придумай и нарисуй яйцо будущего питомца. Сфотографируй рисунок и прикрепи к заданию.', category: 'creative', difficulty: 'medium', rewardCoins: 15, rewardXp: 15, enabled: true, isDemo: true, lastCompletedOn: null, createdAt: now },
    { id: 'quest-demo-05', title: 'Придумай историю питомца', description: 'Выбери любимого питомца и расскажи, откуда он прилетел и чем любит заниматься.', category: 'family', difficulty: 'easy', rewardCoins: 10, rewardXp: 10, enabled: true, isDemo: true, lastCompletedOn: null, createdAt: now },
  ];
}

export function buildDemoRewards(now: string): Reward[] {
  return [
    { id: 'reward-demo-01', title: '50 Robux', description: 'Пополнение игрового баланса Roblox от мамы (выдаётся мамой вручную).', category: 'robux', cost: 50, imageSeed: 201, imageUrl: null, enabled: true, isDemo: true, createdAt: now },
    { id: 'reward-demo-02', title: 'Сюрприз-яйцо', description: 'Настоящее шоколадное яйцо с сюрпризом из магазина.', category: 'surprise', cost: 30, imageSeed: 202, imageUrl: null, enabled: true, isDemo: true, createdAt: now },
    { id: 'reward-demo-03', title: 'Стикерпак с питомцами', description: 'Наклейки с питомцами Мира Сонечки для тетрадок и телефона.', category: 'gift', cost: 15, imageSeed: 203, imageUrl: null, enabled: true, isDemo: true, createdAt: now },
    { id: 'reward-demo-04', title: 'Кино-вечер с мамой', description: 'Совместный просмотр мультфильма и попкорн в выходной.', category: 'virtual', cost: 40, imageSeed: 204, imageUrl: null, enabled: true, isDemo: true, createdAt: now },
  ];
}

export function buildSonyaQuests(now: string): Quest[] {
  return [
    { id: 'sonya-01', title: 'Убрать стол', description: 'Наведи порядок на своём столе: убери лишние вещи и вытри пыль.', category: 'daily', difficulty: 'easy', rewardCoins: 5, rewardXp: 5, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
    { id: 'sonya-02', title: 'Убрать игрушки', description: 'Собери все игрушки и расставь их по местам.', category: 'daily', difficulty: 'easy', rewardCoins: 5, rewardXp: 5, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
    { id: 'sonya-03', title: 'Почистить зубы', description: 'Почисти зубы утром и вечером — мама проверит.', category: 'daily', difficulty: 'easy', rewardCoins: 5, rewardXp: 5, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
    { id: 'sonya-04', title: 'Сделать уроки', description: 'Выполни все домашние задания на сегодня.', category: 'daily', difficulty: 'medium', rewardCoins: 10, rewardXp: 10, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
    { id: 'sonya-05', title: 'Сделать доп английский', description: 'Позанимайся английским по своей дополнительной программе.', category: 'daily', difficulty: 'medium', rewardCoins: 10, rewardXp: 10, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
    { id: 'sonya-06', title: 'Убрать в шкафу одежду', description: 'Сложи одежду аккуратно: всё на свои места в шкафу.', category: 'weekly', difficulty: 'medium', rewardCoins: 15, rewardXp: 15, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
    { id: 'sonya-07', title: 'Убрать шкаф с бумагой и пластилином', description: 'Разбери шкаф: бумагу и пластилин — по коробкам и полочкам.', category: 'weekly', difficulty: 'hard', rewardCoins: 20, rewardXp: 20, enabled: true, isDemo: false, lastCompletedOn: null, createdAt: now },
  ];
}

export function buildInitialProfile(): Profile {
  return {
    childName: 'Соня',
    avatarSeed: 42,
    level: 1,
    xp: 0,
    coins: 100,
    createdAt: new Date().toISOString(),
    streakDays: 1,
    lastLoginDay: todayKey(),
    soundEnabled: true,
    avatarPhoto: null,
  };
}

export function buildInitialMeta(): AppMeta {
  return {
    seededAt: new Date().toISOString(),
    parentPin: '1234',
    schemaVersion: 1,
  };
}
