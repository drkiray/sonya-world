// ─── Генеративная система SVG-иллюстраций v2 ───────────────────────────────
// Многослойные персонажи с idle-анимациями (дыхание, моргание, покачивание),
// паттернами и аксессуарами. Если у питомца есть настоящая иллюстрация
// (imageUrl / фото / файл в public/assets — см. services/assets.ts),
// она подменяет процедурный арт автоматически (компонент PetImage).

import { useEffect, useState } from 'react';
import type { Pet, Rarity } from '../types';
import { RARITIES } from '../types';
import { getAssetUrl } from '../services/assets';
import { PREMIUM_PETS } from './PremiumArt';
import { PREMIUM_EGGS } from './premium/eggs';
import { PREMIUM_ITEMS, IslandScene, premiumRewardKind } from './premium/items';

export const RARITY_COLORS: Record<Rarity, { main: string; soft: string; text: string; ring: string }> = {
  'Обычная': { main: '#9AA3B2', soft: '#EDF0F4', text: '#5B6472', ring: '#C9CFD9' },
  'Необычная': { main: '#4ADE80', soft: '#E7FBEF', text: '#1E7A44', ring: '#A9EFC4' },
  'Редкая': { main: '#5EC8ED', soft: '#E6F7FD', text: '#1A6E8C', ring: '#B3E4F4' },
  'Эпическая': { main: '#7655D9', soft: '#EFEAFB', text: '#4A2FA0', ring: '#C7B6F1' },
  'Легендарная': { main: '#F59E0B', soft: '#FEF3C7', text: '#92400E', ring: '#FCD34D' },
  'Мифическая': { main: '#F38BBF', soft: '#FDEAF4', text: '#A12E68', ring: '#F7C2DC' },
  'Космическая': { main: '#4F46E5', soft: '#EEF0FE', text: '#312C8E', ring: '#C3C6F7' },
  'Секретная': { main: '#FF6B6B', soft: '#FFE9E9', text: '#8F1D1D', ring: '#FFB3B3' },
  'Вечная': { main: '#22D3EE', soft: '#ECFEFF', text: '#0E7490', ring: '#BAF2FA' },
  'Божественная': { main: '#FDE047', soft: '#FEFCE8', text: '#A16207', ring: '#FEF08A' },
};

export const RARITY_LABELS: Record<Rarity, string> = {
  'Обычная': 'Обычная',
  'Необычная': 'Необычная',
  'Редкая': 'Редкая',
  'Эпическая': 'Эпическая',
  'Легендарная': 'Легендарная',
  'Мифическая': 'Мифическая',
  'Космическая': 'Космическая',
  'Секретная': 'Секретная',
  'Вечная': 'Вечная',
  'Божественная': 'Божественная',
};

/** Детерминированный ГПСЧ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BODY_PALETTES: string[][] = [
  ['#8B6FE8', '#5EC8ED'],
  ['#F38BBF', '#FFD45C'],
  ['#5EC8ED', '#F38BBF'],
  ['#FFC94D', '#8B6FE8'],
  ['#6FE0B8', '#5EC8ED'],
  ['#F3A38B', '#FFD45C'],
  ['#A78BFA', '#F38BBF'],
  ['#7DD3FC', '#A78BFA'],
];

const PATTERN_COUNT = 3; // 0 пятна, 1 полоски, 2 звёзды

interface PetFace {
  body: string;
  accent: string;
  earType: number;
  hasWings: boolean;
  hasHorn: boolean;
  hasTail: boolean;
  cheekColor: string;
  eyeStyle: number;
  belly: boolean;
  pattern: number;
  patternAlpha: number;
  accessory: number; // 0 нет, 1 бант, 2 звёздная брошь, 3 шарфик
  mood: number; // 0 радость, 1 умиление, 2 задумчивость
}

function faceFor(seed: number, rarity: Rarity): PetFace {
  const rnd = mulberry32(seed * 2654435761 + 7);
  const palette = BODY_PALETTES[Math.floor(rnd() * BODY_PALETTES.length)];
  const rareIdx = RARITIES.indexOf(rarity);
  return {
    body: palette[0],
    accent: palette[1],
    earType: Math.floor(rnd() * 4),
    hasWings: rareIdx >= 3 || rnd() > 0.78,
    hasHorn: rareIdx >= 4 || rnd() > 0.86,
    hasTail: rnd() > 0.35,
    cheekColor: '#F38BBF',
    eyeStyle: rareIdx >= 5 ? 2 : Math.floor(rnd() * 2),
    belly: rnd() > 0.45,
    pattern: Math.floor(rnd() * PATTERN_COUNT),
    patternAlpha: 0.35 + rnd() * 0.25,
    accessory: rnd() > 0.6 ? Math.floor(rnd() * 3) + 1 : 0,
    mood: Math.floor(rnd() * 3),
  };
}

/** Основной компонент питомца: многослойный SVG с idle-анимациями */
export function PetAvatar({
  seed,
  rarity,
  size = 96,
  silhouette = false,
  className,
}: {
  seed: number;
  rarity: Rarity;
  size?: number;
  silhouette?: boolean;
  className?: string;
}) {
  const f = faceFor(seed, rarity);
  const rareIdx = RARITIES.indexOf(rarity);
  const uid = `pet${seed}${silhouette ? 's' : ''}`;
  const body = silhouette ? '#3A3157' : f.body;
  const accent = silhouette ? '#2E2647' : f.accent;
  const dark = silhouette ? '#241D3E' : '#21183D';
  const wing = silhouette ? '#453A6B' : '#DFF6FD';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`pet-svg ${className ?? ''}`}
      role="img"
      aria-label="Питомец"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="32%" r="80%">
          <stop offset="0%" stopColor={silhouette ? '#3A3157' : RARITY_COLORS[rarity].soft} />
          <stop offset="100%" stopColor={silhouette ? '#2A2148' : '#FFFFFF'} />
        </radialGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={silhouette ? body : lighten(f.body)} />
          <stop offset="100%" stopColor={body} />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill={`url(#${uid}-bg)`} />

      {/* ф aura для высоких редкостей */}
      {!silhouette && rareIdx >= RARITIES.indexOf('Легендарная') && (
        <circle cx="50" cy="52" r="38" fill={RARITY_COLORS[rarity].main} opacity="0.14" className="pet-aura" />
      )}

      <g className="pet-idle">
        {/* крылья */}
        {f.hasWings && (
          <>
            <g className="pet-wing-l">
              <ellipse cx="22" cy="50" rx="14" ry="9" fill={wing} stroke={silhouette ? dark : '#9BDDF0'} strokeWidth="1.5" transform="rotate(-25 22 50)" />
            </g>
            <g className="pet-wing-r">
              <ellipse cx="78" cy="50" rx="14" ry="9" fill={wing} stroke={silhouette ? dark : '#9BDDF0'} strokeWidth="1.5" transform="rotate(25 78 50)" />
            </g>
          </>
        )}
        {/* уши */}
        {f.earType === 1 && (
          <>
            <circle cx="34" cy="26" r="9" fill={body} />
            <circle cx="66" cy="26" r="9" fill={body} />
            {!silhouette && (
              <>
                <circle cx="34" cy="26" r="4.5" fill={accent} opacity="0.7" />
                <circle cx="66" cy="26" r="4.5" fill={accent} opacity="0.7" />
              </>
            )}
          </>
        )}
        {f.earType === 2 && (
          <>
            <path d="M30 32 L26 12 L44 24 Z" fill={body} />
            <path d="M70 32 L74 12 L56 24 Z" fill={body} />
            {!silhouette && (
              <>
                <path d="M31 28 L29 17 L39 24 Z" fill={accent} opacity="0.8" />
                <path d="M69 28 L71 17 L61 24 Z" fill={accent} opacity="0.8" />
              </>
            )}
          </>
        )}
        {f.earType === 3 && (
          <>
            <g className="pet-antenna">
              <path d="M38 28 Q36 12 30 10" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="29" cy="9" r="4.5" fill={accent} />
            </g>
            <g className="pet-antenna" style={{ animationDelay: '0.4s' }}>
              <path d="M62 28 Q64 12 70 10" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="71" cy="9" r="4.5" fill={accent} />
            </g>
          </>
        )}
        {/* рог */}
        {f.hasHorn && (
          <>
            <path d="M50 18 L44 3 L56 3 Z" fill={accent} stroke={dark} strokeWidth="1" />
            {!silhouette && <path d="M50 15 L47 5 L53 5 Z" fill="#fff" opacity="0.55" />}
          </>
        )}
        {/* хвост */}
        {f.hasTail && <path d="M78 62 Q93 60 91 45" stroke={body} strokeWidth="6" fill="none" strokeLinecap="round" />}
        {/* тело */}
        <ellipse cx="50" cy="56" rx="26" ry="24" fill={`url(#${uid}-body)`} stroke={dark} strokeWidth="2.5" />
        {/* паттерн, обрезанный телом */}
        {!silhouette && (
          <clipPath id={`${uid}-clip`}>
            <ellipse cx="50" cy="56" rx="25" ry="23" />
          </clipPath>
        )}
        {!silhouette && f.pattern === 0 && (
          <g clipPath={`url(#${uid}-clip)`}>
            <circle cx="38" cy="46" r="5" fill={accent} opacity={f.patternAlpha} />
            <circle cx="62" cy="42" r="4" fill={accent} opacity={f.patternAlpha} />
            <circle cx="58" cy="66" r="5.5" fill={accent} opacity={f.patternAlpha} />
          </g>
        )}
        {!silhouette && f.pattern === 1 && (
          <g clipPath={`url(#${uid}-clip)`} stroke={accent} strokeWidth="3.5" opacity={f.patternAlpha} fill="none">
            <path d="M26 48 Q50 42 74 48" />
            <path d="M26 58 Q50 52 74 58" />
            <path d="M28 68 Q50 62 72 68" />
          </g>
        )}
        {!silhouette && f.pattern === 2 && (
          <g clipPath={`url(#${uid}-clip)`} fill={accent} opacity={f.patternAlpha}>
            <path d="M38 44 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6 -3.6 -3.6 -1.6 3.6 -1.6z" />
            <path d="M62 62 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4z" />
          </g>
        )}
        {/* животик */}
        {f.belly && <ellipse cx="50" cy="64" rx="14" ry="11" fill={accent} opacity="0.85" />}
        {/* аксессуары */}
        {!silhouette && f.accessory === 1 && (
          <g transform="translate(66 30)">
            <path d="M0 0 L-9 -6 L-9 6 Z" fill="#F38BBF" stroke={dark} strokeWidth="1.5" />
            <path d="M0 0 L9 -6 L9 6 Z" fill="#F38BBF" stroke={dark} strokeWidth="1.5" />
            <circle r="3" fill="#FFD45C" stroke={dark} strokeWidth="1.5" />
          </g>
        )}
        {!silhouette && f.accessory === 2 && (
          <path d="M36 66 l1.7 3.8 3.8 1.7 -3.8 1.7 -1.7 3.8 -1.7 -3.8 -3.8 -1.7 3.8 -1.7z" fill="#FFD45C" stroke={dark} strokeWidth="1" />
        )}
        {!silhouette && f.accessory === 3 && (
          <path d="M34 70 Q50 78 66 70 L66 76 Q50 84 34 76 Z" fill="#5EC8ED" stroke={dark} strokeWidth="1.5" />
        )}
        {/* лицо */}
        <g className="pet-eyes">
          {f.eyeStyle === 0 && (
            <>
              <circle cx="41" cy="52" r="4.5" fill={dark} />
              <circle cx="59" cy="52" r="4.5" fill={dark} />
              <circle cx="42.5" cy="50.5" r="1.6" fill="#fff" />
              <circle cx="60.5" cy="50.5" r="1.6" fill="#fff" />
            </>
          )}
          {f.eyeStyle === 1 && (
            <>
              <path d="M36 53 Q41 47 46 53" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M54 53 Q59 47 64 53" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          )}
          {f.eyeStyle === 2 && (
            <>
              <path d="M41 46 L42.5 50 L47 51 L42.5 52 L41 56 L39.5 52 L35 51 L39.5 50 Z" fill={dark} />
              <path d="M59 46 L60.5 50 L65 51 L60.5 52 L59 56 L57.5 52 L53 51 L57.5 50 Z" fill={dark} />
            </>
          )}
        </g>
        {!silhouette && (
          <>
            <circle cx="33" cy="59" r="4" fill={f.cheekColor} opacity="0.5" />
            <circle cx="67" cy="59" r="4" fill={f.cheekColor} opacity="0.5" />
          </>
        )}
        {f.mood === 2 && !silhouette && (
          <>
            <path d="M36 45 q4 -3 8 -1" stroke={dark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M56 44 q4 -2 8 1" stroke={dark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </>
        )}
        <path d={f.mood === 1 ? 'M44 60 Q50 68 56 60' : 'M45 61 Q50 66 55 61'} stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function lighten(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 40);
  const g = Math.min(255, ((n >> 8) & 255) + 40);
  const b = Math.min(255, (n & 255) + 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const STAT_LABELS = ['Сила', 'Скорость', 'Удача', 'Харизма'];
const HABITS_POOL = [
  'Обожает солнечные ванны',
  'Коллекционирует блестящие камешки',
  'Вздремнуть после обеда',
  'Смотреть на облака',
  'Танцевать под дождём',
  'Прятаться в листве',
  'Играть с мыльными пузырями',
  'Греться у окошка',
  'Собирать цветочки',
  'Слушать, как поёт Соня',
  'Кататься с горки',
  'Облизываться на сладкое',
];

/** Характеристики питомца (детерминированы от сида) */
export function petStats(seed: number): Array<{ label: string; value: number }> {
  const rnd = mulberry32(seed * 104729 + 13);
  return STAT_LABELS.map((label) => ({ label, value: 20 + Math.floor(rnd() * 81) }));
}

/** Любимые привычки питомца (2–3 из пула) */
export function petHabits(seed: number): string[] {
  const rnd = mulberry32(seed * 15485863 + 7);
  const pool = [...HABITS_POOL];
  const count = 2 + Math.floor(rnd() * 2);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  return out;
}

/** Картинка питомца: ручная премиальная иллюстрация → настоящий ассет → процедурный арт */
export function PetImage({ pet, size, silhouette, className }: { pet: Pet; size: number; silhouette?: boolean; className?: string }) {
  const Premium = PREMIUM_PETS[pet.id];
  if (Premium) return <Premium size={size} silhouette={silhouette} className={className} />;

  const asset = useAssetManifest();
  const photo = pet.source === 'custom' ? (pet as { photo?: string }).photo : null;
  const url = pet.imageUrl ?? photo ?? asset(pet.id);

  if (url) {
    return (
      <img
        src={url}
        alt={pet.name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className ?? ''}`}
        style={silhouette ? { filter: 'brightness(0.25) saturate(0.4)' } : undefined}
        loading="lazy"
      />
    );
  }
  return <PetAvatar seed={pet.artSeed} rarity={pet.rarity} size={size} silhouette={silhouette} className={className} />;
}

/** Манифест ассетов: public/assets/manifest.json → { id питомца: "путь к файлу" } */
function useAssetManifest(): (petId: string) => string | null {
  const [map, setMap] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('assets/manifest.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((j) => alive && setMap(j))
      .catch(() => alive && setMap({}));
    return () => {
      alive = false;
    };
  }, []);
  return (petId) => (map && map[petId] ? getAssetUrl(map[petId]) : null);
}

export function EggArt({ seed, size = 64, cracked = false, rarity }: { seed: number; size?: number; cracked?: boolean; rarity?: Rarity }) {
  if (rarity) {
    const PremiumEgg = PREMIUM_EGGS[rarity];
    if (PremiumEgg) return <PremiumEgg size={size} cracked={cracked} />;
  }
  const rnd = mulberry32(seed * 97);
  const c1 = BODY_PALETTES[Math.floor(rnd() * BODY_PALETTES.length)];
  const spot = rnd() > 0.5;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Яйцо" className={cracked ? 'egg-wobble' : undefined}>
      <defs>
        <linearGradient id={`egg${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(c1[1])} />
          <stop offset="100%" stopColor={c1[0]} />
        </linearGradient>
        <clipPath id={`eggclip${seed}`}>
          <path d="M50 14C33 14 22 38 22 58c0 20 12 32 28 32s28-12 28-32C78 38 67 14 50 14Z" />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="92" rx="24" ry="5" fill="#21183D" opacity="0.08" />
      <path
        d="M50 14C33 14 22 38 22 58c0 20 12 32 28 32s28-12 28-32C78 38 67 14 50 14Z"
        fill={`url(#egg${seed})`}
        stroke="#21183D"
        strokeWidth="3"
      />
      <g clipPath={`url(#eggclip${seed})`}>
        {spot ? (
          <>
            <circle cx="40" cy="52" r="7" fill="#fff" opacity="0.45" />
            <circle cx="60" cy="66" r="5" fill="#fff" opacity="0.45" />
          </>
        ) : (
          <path d="M34 46 q8 -8 16 0 M52 70 q8 -8 16 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
        )}
        {/* бегущий блик */}
        <rect className="egg-shine" x="-40" y="0" width="26" height="110" fill="#fff" opacity="0.35" transform="skewX(-18)" />
      </g>
      {cracked && (
        <>
          <path d="M30 60 l8 -7 6 8 8 -9 7 9 8 -7 6 8" stroke="#21183D" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M66 40 l6 -12 M72 44 l10 -8" stroke="#FFD45C" strokeWidth="3" strokeLinecap="round" className="egg-rays" />
        </>
      )}
      <ellipse cx="38" cy="30" rx="6" ry="10" fill="#fff" opacity="0.5" transform="rotate(-15 38 30)" />
    </svg>
  );
}

export function RewardArt({ seed, size = 72 }: { seed: number; size?: number }) {
  const PremiumItem = PREMIUM_ITEMS[premiumRewardKind(seed)];
  if (PremiumItem) return <PremiumItem size={size} />;
  const rnd = mulberry32(seed * 31);
  const palette = BODY_PALETTES[Math.floor(rnd() * BODY_PALETTES.length)];
  const kind = Math.floor(rnd() * 3);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Награда" className="reward-float">
      <defs>
        <linearGradient id={`rw${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(palette[0])} />
          <stop offset="100%" stopColor={palette[0]} />
        </linearGradient>
      </defs>
      {kind === 0 && (
        <g>
          <ellipse cx="50" cy="86" rx="28" ry="5" fill="#21183D" opacity="0.08" />
          <rect x="20" y="40" width="60" height="42" rx="8" fill={`url(#rw${seed})`} stroke="#21183D" strokeWidth="3" />
          <path d="M20 52 h60" stroke="#21183D" strokeWidth="3" />
          <rect x="44" y="40" width="12" height="42" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <path d="M50 40 v-8 a8 8 0 0 1 8 8" fill="none" stroke="#21183D" strokeWidth="3" />
          <circle cx="50" cy="57" r="5" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <rect x="24" y="42" width="50" height="10" fill="#fff" opacity="0.18" />
        </g>
      )}
      {kind === 1 && (
        <g>
          <ellipse cx="50" cy="86" rx="26" ry="5" fill="#21183D" opacity="0.08" />
          <rect x="24" y="42" width="52" height="40" rx="6" fill={palette[1]} stroke="#21183D" strokeWidth="3" />
          <rect x="18" y="32" width="64" height="14" rx="5" fill={palette[0]} stroke="#21183D" strokeWidth="3" />
          <rect x="45" y="32" width="10" height="50" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <path d="M50 32 q-10 -14 -18 -6 q-6 7 8 8 M50 32 q10 -14 18 -6 q6 7 -8 8" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <rect x="27" y="45" width="18" height="6" rx="3" fill="#fff" opacity="0.3" />
        </g>
      )}
      {kind === 2 && (
        <g>
          <ellipse cx="50" cy="86" rx="24" ry="5" fill="#21183D" opacity="0.08" />
          <path
            d="M50 16 L58 40 L84 40 L63 55 L71 80 L50 64 L29 80 L37 55 L16 40 L42 40 Z"
            fill="#FFD45C"
            stroke="#21183D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="48" r="5" fill={palette[0]} />
          <path d="M42 34 L46 42" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

export function QuestArt({ seed, size = 72 }: { seed: number; size?: number }) {
  const rnd = mulberry32(seed * 13);
  const kind = Math.floor(rnd() * 3);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Квест" className="reward-float">
      {kind === 0 && (
        <g>
          <rect x="24" y="18" width="52" height="64" rx="8" fill="#F4F1FF" stroke="#21183D" strokeWidth="3" />
          <path d="M34 34 h32 M34 46 h32 M34 58 h20" stroke="#7655D9" strokeWidth="4" strokeLinecap="round" />
          <circle cx="66" cy="66" r="9" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <circle cx="66" cy="66" r="3" fill="#21183D" />
        </g>
      )}
      {kind === 1 && (
        <g>
          <circle cx="50" cy="50" r="32" fill="#5EC8ED" stroke="#21183D" strokeWidth="3" />
          <circle cx="50" cy="50" r="22" fill="#E6F7FD" stroke="#21183D" strokeWidth="2" />
          <path d="M50 32 L56 52 L50 47 L44 52 Z" fill="#F38BBF" stroke="#21183D" strokeWidth="2" />
          <circle cx="50" cy="50" r="3.5" fill="#21183D" />
          <circle cx="50" cy="28" r="2.5" fill="#FFD45C" />
          <circle cx="72" cy="50" r="2.5" fill="#FFD45C" />
        </g>
      )}
      {kind === 2 && (
        <g>
          <path d="M30 74 Q26 46 44 30 Q58 18 72 26 Q60 34 52 48 Q44 62 30 74Z" fill="#7655D9" stroke="#21183D" strokeWidth="3" />
          <path d="M66 30 Q74 44 64 56" stroke="#FFD45C" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="38" cy="66" r="6" fill="#F38BBF" stroke="#21183D" strokeWidth="2.5" />
          <circle cx="38" cy="66" r="2" fill="#fff" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

export function IslandHero({ size = 340 }: { size?: number }) {
  return <IslandScene size={size} className="w-full h-auto" />;
}

export function AvatarArt({ seed, size = 56, className }: { seed: number; size?: number; className?: string }) {
  const rnd = mulberry32(seed * 7 + 3);
  const hair = ['#5A3E2B', '#2E2140', '#8A5A3B', '#4A3687', '#B9477E'][Math.floor(rnd() * 5)];
  const accessory = Math.floor(rnd() * 3); // 0 нет, 1 звёздочка, 2 бантик
  const bowColor = ['#FFD45C', '#F38BBF', '#5EC8ED'][Math.floor(rnd() * 3)];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Аватар Сони" className={className}>
      <circle cx="50" cy="50" r="48" fill="#FDEAF4" />
      <circle cx="50" cy="58" r="22" fill="#FFD9C4" stroke="#21183D" strokeWidth="2.5" />
      <path d="M26 56 Q24 22 50 20 Q76 22 74 56 Q70 40 50 40 Q30 40 26 56Z" fill={hair} stroke="#21183D" strokeWidth="2.5" />
      {/* чёлка */}
      <path d="M36 42 Q44 34 52 40 Q46 42 44 48 Q40 44 36 42Z" fill={hair} />
      <g className="pet-eyes">
        <circle cx="42" cy="58" r="3" fill="#21183D" />
        <circle cx="58" cy="58" r="3" fill="#21183D" />
        <circle cx="43.2" cy="56.8" r="1" fill="#fff" />
        <circle cx="59.2" cy="56.8" r="1" fill="#fff" />
      </g>
      <circle cx="36" cy="64" r="3.5" fill="#F38BBF" opacity="0.6" />
      <circle cx="64" cy="64" r="3.5" fill="#F38BBF" opacity="0.6" />
      <path d="M45 67 Q50 71 55 67" stroke="#21183D" strokeWidth="2" fill="none" strokeLinecap="round" />
      {accessory === 1 && (
        <path d="M64 32 l2 4.4 4.4 2 -4.4 2 -2 4.4 -2 -4.4 -4.4 -2 4.4 -2z" fill="#FFD45C" stroke="#21183D" strokeWidth="1.6" strokeLinejoin="round" />
      )}
      {accessory === 2 && (
        <g transform="translate(34 32)">
          <path d="M0 0 L-8 -5 L-8 5 Z" fill={bowColor} stroke="#21183D" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M0 0 L8 -5 L8 5 Z" fill={bowColor} stroke="#21183D" strokeWidth="1.6" strokeLinejoin="round" />
          <circle r="2.6" fill="#fff" stroke="#21183D" strokeWidth="1.4" />
        </g>
      )}
    </svg>
  );
}

/** Аватар ребёнка: собственное фото либо выбранный персонаж из набора */
export function ChildAvatar({ photo, seed, size = 56, className }: { photo?: string | null; seed: number; size?: number; className?: string }) {
  if (photo) {
    return <img src={photo} alt="Аватар" width={size} height={size} className={`rounded-full object-cover ${className ?? ''}`} />;
  }
  return <AvatarArt seed={seed} size={size} className={className} />;
}
