// ─── Генератор вариаций существ ────────────────────────────────────────────
// Если из яйца выпало существо, которое уже есть в коллекции, рождается
// вариация: новое имя, перекрашенный визуал, другие характеристики,
// описание и любимые привычки.

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
];

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

/** Придумывает вариацию базового существа: имя, описание, новый сид и оттенок */
export function makeVariant(base: Pet, existingNames: Set<string>): Pet {
  const id = uid();
  const rnd = mulberry(hashStr(id));
  const noun = nounOf(base.name);
  const feminine = FEMININE_NOUNS.has(noun) || noun.endsWith('жка') || noun.endsWith('нька');

  // имя: прилагательное + существительное базы, гарантированно уникальное
  let name = base.name;
  for (let attempt = 0; attempt < 20; attempt++) {
    const adj = ADJECTIVES[Math.floor(rnd() * ADJECTIVES.length)];
    const candidate = `${feminine ? adj.f : adj.m} ${noun}`;
    if (!existingNames.has(candidate.toLowerCase())) {
      name = candidate;
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
  ];
  const description = templates[Math.floor(rnd() * templates.length)];

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
    hueShift: 40 + Math.floor(rnd() * 280),
    createdAt: new Date().toISOString(),
  };
}
