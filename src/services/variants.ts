// ─── Генератор вариаций существ ────────────────────────────────────────────
// Если все существа редкости уже найдены, из яйца рождается вариация:
// новое имя, оттенок, гарантированно отличающийся от базы и других вариаций,
// а у части вариаций — ещё и украшение. Характеристики, описание и привычки
// генерируются от нового сида и тоже уникальны.

import type { Pet } from '../types';
import { uid } from './db';

const ADJECTIVES: Array<{ m: string; f: string }> = [
  { m: 'Яблочный', f: 'Яблочная' },
  { m: 'Малиновый', f: 'Малиновая' },
  { m: 'Звёздный', f: 'Звёздная' },
  { m: 'Лунный', f: 'Лунная' },
  { m: 'Солнечный', f: 'Солнечная' },
  { m: 'Туманный', f: 'Туманная' },
  { m: 'Кристальный', f: 'Кристальная' },
  { m: 'Радужный', f: 'Радужная' },
  { m: 'Песочный', f: 'Песочная' },
  { m: 'Мятный', f: 'Мятная' },
  { m: 'Ягодный', f: 'Ягодная' },
  { m: 'Цветочный', f: 'Цветочная' },
  { m: 'Медовый', f: 'Медовая' },
  { m: 'Снежный', f: 'Снежная' },
  { m: 'Изумрудный', f: 'Изумрудная' },
  { m: 'Рубиновый', f: 'Рубиновая' },
  { m: 'Сапфировый', f: 'Сапфировая' },
  { m: 'Аметистовый', f: 'Аметистовая' },
  { m: 'Пепельный', f: 'Пепельная' },
  { m: 'Медный', f: 'Медная' },
  { m: 'Жемчужный', f: 'Жемчужная' },
  { m: 'Огненный', f: 'Огненная' },
  { m: 'Ледяной', f: 'Ледяная' },
  { m: 'Бархатный', f: 'Бархатная' },
  { m: 'Шёлковый', f: 'Шёлковая' },
  { m: 'Полосатый', f: 'Полосатая' },
  { m: 'Пятнистый', f: 'Пятнистая' },
  { m: 'Пушистый', f: 'Пушистая' },
  { m: 'Хмельной', f: 'Хмельная' },
  { m: 'Смородиновый', f: 'Смородиновая' },
];

const TITLES: Record<'m' | 'f', string[]> = {
  m: ['Капитан', 'Профессор', 'Мастер', 'Сэр', 'Доктор', 'Шеф', 'Агент', 'Маг', 'Король', 'Следопыт'],
  f: ['Капитан', 'Профессор', 'Мастер', 'Мадам', 'Доктор', 'Фея', 'Леди', 'Принцесса', 'Королева', 'Следопытка'],
};

/** Украшения вариаций — рисуются поверх портрета */
export const VARIANT_ACCESSORIES = ['bow', 'star', 'flower', 'crown', 'berry'] as const;

const FEMININE_NOUNS = new Set(['единорожка', 'невидимка', 'тень']);

const PLACES = [
  'дремучем лесу',
  'облачных горах',
  'сказочной долине',
  'ночном саду',
  'радужных холмах',
  'лунной поляне',
  'кристальных пещерах',
  'тёплых тропиках',
  'звёздном лугу',
  'берегу звенящего ручья',
  'вершине вишнёвой горы',
  'подводном лесу',
  'поле одуванчиков',
  'медовых лугах',
  'одиноком айсберге',
];

const HABITS = [
  'собирать росу в баночки',
  'спать в тёплом носочке',
  'считать звёзды по вечерам',
  'прямо есть ягоды с куста',
  'кататься по траве вниз головой',
  'подпевать птицам',
  'прятать сокровища в шкафу',
  'танцевать, когда идёт дождь',
  'ловить солнечных зайчиков',
  'плести венки из одуванчиков',
  'учить стрекоз иностранным словам',
  'устраивать парады для муравьёв',
  'грезить наяву в гамаке',
  'облизывать капли мёда с ложки',
];

function nounOf(baseName: string): string {
  const words = baseName.split(/[\s-]+/);
  return words[words.length - 1].toLowerCase();
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Угловое расстояние между оттенками (0–180) */
function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export interface VariantContext {
  existingNames: Set<string>;
  /** Оттенки, которые уже заняты базой (0) и её вариациями */
  usedHues: number[];
}

/** Придумывает вариацию базового существа: уникальное имя, отличный оттенок,
 *  иногда украшение, новые характеристики, описание и привычки */
export function makeVariant(base: Pet, ctx: VariantContext): Pet {
  const id = uid();
  const rnd = mulberry(hashStr(id));
  const noun = nounOf(base.name);
  const feminine = FEMININE_NOUNS.has(noun) || noun.endsWith('жка') || noun.endsWith('нька');
  const gender: 'm' | 'f' = feminine ? 'f' : 'm';

  // имя: прилагательное+существительное (чаще) или титул+существительное; без повторов
  let name = base.name;
  for (let attempt = 0; attempt < 40; attempt++) {
    const useTitle = rnd() < 0.3;
    const candidate = useTitle
      ? `${TITLES[gender][Math.floor(rnd() * TITLES[gender].length)]} ${noun}`
      : `${ADJECTIVES[Math.floor(rnd() * ADJECTIVES.length)][gender]} ${noun}`;
    if (!ctx.existingNames.has(candidate.toLowerCase())) {
      name = candidate;
      break;
    }
  }

  // оттенок: минимум 50° от базы и от каждой существующей вариации
  let hue = 40 + Math.floor(rnd() * 280);
  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = Math.floor(rnd() * 360);
    if (ctx.usedHues.every((h) => hueDist(candidate, h) >= 50)) {
      hue = candidate;
      break;
    }
  }

  const place = PLACES[Math.floor(rnd() * PLACES.length)];
  const habit = HABITS[Math.floor(rnd() * HABITS.length)];
  const templates = [
    `Вариация существа «${base.name}». Обитает в ${place} и обожает ${habit}.`,
    `Дальний родственник «${base.name}». Говорят, что он живёт в ${place}.`,
    `Редкая вариация «${base.name}». Любит ${habit} и прогулки по ${place}.`,
    `Потомок «${base.name}», в котором проснулся дух приключений. Любит ${habit}.`,
    `Особый вид «${base.name}». Местные жители замечают его в ${place}.`,
    `Редчайшая вариация «${base.name}». По легенде, он поселился в ${place}.`,
  ];
  const description = templates[Math.floor(rnd() * templates.length)];

  const accessory = rnd() < 0.45 ? VARIANT_ACCESSORIES[Math.floor(rnd() * VARIANT_ACCESSORIES.length)] : undefined;

  return {
    id,
    name,
    rarity: base.rarity,
    category: base.category,
    description,
    imageUrl: null,
    artSeed: Math.floor(rnd() * 100000),
    source: 'catalog',
    isDemo: base.isDemo,
    catalogOrigin: base.catalogOrigin,
    sourceVerified: false,
    variantOf: base.id,
    hueShift: hue,
    accessory,
    createdAt: new Date().toISOString(),
  };
}
