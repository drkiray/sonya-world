// ─── Генеративная система SVG-иллюстраций v2 ───────────────────────────────
// Многослойные персонажи с idle-анимациями (дыхание, моргание, покачивание),
// паттернами и аксессуарами. Если у питомца есть настоящая иллюстрация
// (imageUrl / фото / файл в public/assets — см. services/assets.ts),
// она подменяет процедурный арт автоматически (компонент PetImage).

import { useEffect, useState } from 'react';
import type { Pet, Rarity } from '../types';
import { getAssetUrl } from '../services/assets';

export const RARITY_COLORS: Record<Rarity, { main: string; soft: string; text: string; ring: string }> = {
  Common: { main: '#9AA3B2', soft: '#EDF0F4', text: '#5B6472', ring: '#C9CFD9' },
  Uncommon: { main: '#4ADE80', soft: '#E7FBEF', text: '#1E7A44', ring: '#A9EFC4' },
  Rare: { main: '#5EC8ED', soft: '#E6F7FD', text: '#1A6E8C', ring: '#B3E4F4' },
  Epic: { main: '#7655D9', soft: '#EFEAFB', text: '#4A2FA0', ring: '#C7B6F1' },
  Legendary: { main: '#F5B917', soft: '#FFF6DB', text: '#8A6100', ring: '#FBE28C' },
  Mythic: { main: '#F38BBF', soft: '#FDEAF4', text: '#A12E68', ring: '#F7C2DC' },
  Secret: { main: '#FF6B6B', soft: '#FFE9E9', text: '#8F1D1D', ring: '#FFB3B3' },
};

export const RARITY_LABELS: Record<Rarity, string> = {
  Common: 'Обычный',
  Uncommon: 'Необычный',
  Rare: 'Редкий',
  Epic: 'Эпический',
  Legendary: 'Легендарный',
  Mythic: 'Мифический',
  Secret: 'Секретный',
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
  const rareIdx = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret'].indexOf(rarity);
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
      {!silhouette && (rarity === 'Legendary' || rarity === 'Mythic' || rarity === 'Secret') && (
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

/** Картинка питомца: настоящий ассет, если есть, иначе процедурный арт */
export function PetImage({ pet, size, silhouette, className }: { pet: Pet; size: number; silhouette?: boolean; className?: string }) {
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

export function EggArt({ seed, size = 64, cracked = false }: { seed: number; size?: number; cracked?: boolean }) {
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
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 340 210" role="img" aria-label="Остров Сонечки" className="w-full h-auto">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EC8ED" />
          <stop offset="100%" stopColor="#C9EEF9" />
        </linearGradient>
        <linearGradient id="isle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8BE0C3" />
          <stop offset="100%" stopColor="#7655D9" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="100%" stopColor="#FFD45C" />
        </radialGradient>
      </defs>
      <rect width="340" height="210" rx="24" fill="url(#sky)" />

      {/* солнце с пульсирующим ореолом */}
      <circle cx="286" cy="42" r="30" fill="#FFD45C" opacity="0.25" className="sun-halo" />
      <circle cx="286" cy="42" r="19" fill="url(#sun)" />

      {/* мерцающие звёздочки */}
      <path d="M60 66 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFD45C" className="twinkle" />
      <path d="M300 96 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" fill="#F38BBF" className="twinkle" style={{ animationDelay: '0.8s' }} />
      <path d="M130 40 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#fff" className="twinkle" style={{ animationDelay: '1.6s' }} />

      {/* облака: два слоя с разной скоростью */}
      <g className="cloud-slow">
        <ellipse cx="70" cy="48" rx="26" ry="11" fill="#fff" opacity="0.9" />
        <ellipse cx="88" cy="42" rx="16" ry="9" fill="#fff" opacity="0.9" />
      </g>
      <g className="cloud-fast">
        <ellipse cx="190" cy="30" rx="20" ry="8" fill="#fff" opacity="0.75" />
      </g>
      <g className="cloud-slow" style={{ animationDelay: '2s' }}>
        <ellipse cx="250" cy="70" rx="16" ry="7" fill="#fff" opacity="0.6" />
      </g>

      {/* остров */}
      <path d="M60 118 Q170 62 280 118 Q270 168 170 172 Q70 168 60 118Z" fill="url(#isle)" stroke="#21183D" strokeWidth="3" />
      <path d="M84 122 Q170 84 256 122 Q230 142 170 144 Q110 142 84 122Z" fill="#F4F1FF" opacity="0.35" />

      {/* домик-портал со светящейся дверью */}
      <g>
        <path d="M150 96 L170 70 L190 96 Z" fill="#F38BBF" stroke="#21183D" strokeWidth="3" strokeLinejoin="round" />
        <rect x="155" y="96" width="30" height="26" rx="6" fill="#7655D9" stroke="#21183D" strokeWidth="3" />
        <ellipse cx="170" cy="112" rx="8" ry="11" fill="#5EC8ED" stroke="#21183D" strokeWidth="2.5" />
        <ellipse cx="170" cy="112" rx="8" ry="11" fill="#BDEAF8" className="door-glow" />
      </g>

      {/* деревья */}
      <g>
        <rect x="104" y="100" width="8" height="24" rx="3" fill="#8A5A3B" stroke="#21183D" strokeWidth="2" />
        <g className="pet-idle">
          <circle cx="108" cy="92" r="16" fill="#4ADE80" stroke="#21183D" strokeWidth="2.5" />
          <circle cx="100" cy="84" r="5" fill="#FFD45C" />
          <circle cx="116" cy="90" r="4" fill="#FFD45C" />
        </g>
      </g>
      <g>
        <rect x="228" y="106" width="6" height="18" rx="2" fill="#8A5A3B" stroke="#21183D" strokeWidth="1.5" />
        <circle cx="231" cy="100" r="11" fill="#6FE0B8" stroke="#21183D" strokeWidth="2" />
      </g>

      {/* кристалл */}
      <g className="animate-wiggle" style={{ transformOrigin: '245px 105px' }}>
        <path d="M238 118 L245 92 L252 118 Z" fill="#5EC8ED" stroke="#21183D" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M245 92 L245 118" stroke="#fff" strokeWidth="2" opacity="0.7" />
      </g>

      {/* трава */}
      <path d="M96 128 q3 -8 6 0 M110 132 q3 -8 6 0 M236 128 q3 -8 6 0" stroke="#3E9E6C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function AvatarArt({ seed, size = 56 }: { seed: number; size?: number }) {
  const rnd = mulberry32(seed * 7);
  const hair = ['#5A3E2B', '#2E2647', '#8A5A3B'][Math.floor(rnd() * 3)];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Аватар Сони">
      <circle cx="50" cy="50" r="48" fill="#FDEAF4" />
      <circle cx="50" cy="58" r="22" fill="#FFD9C4" stroke="#21183D" strokeWidth="2.5" />
      <path d="M26 56 Q24 22 50 20 Q76 22 74 56 Q70 40 50 40 Q30 40 26 56Z" fill={hair} stroke="#21183D" strokeWidth="2.5" />
      <g className="pet-eyes">
        <circle cx="42" cy="58" r="3" fill="#21183D" />
        <circle cx="58" cy="58" r="3" fill="#21183D" />
      </g>
      <circle cx="36" cy="64" r="3.5" fill="#F38BBF" opacity="0.6" />
      <circle cx="64" cy="64" r="3.5" fill="#F38BBF" opacity="0.6" />
      <path d="M45 67 Q50 71 55 67" stroke="#21183D" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 34 l4 -8 4 6" stroke="#FFD45C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
