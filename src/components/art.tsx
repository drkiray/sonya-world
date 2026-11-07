// ─── Генеративная система SVG-иллюстраций ──────────────────────────────────
// Все персонажи рисуются процедурно из seed + редкости: без внешних URL,
// заменяемы на настоящие ассеты через поле imageUrl/photo у питомца.

import type { Rarity } from '../types';

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
  ['#7655D9', '#5EC8ED'],
  ['#F38BBF', '#FFD45C'],
  ['#5EC8ED', '#F38BBF'],
  ['#FFD45C', '#7655D9'],
  ['#8BE0C3', '#5EC8ED'],
  ['#F3A38B', '#FFD45C'],
  ['#A78BFA', '#F38BBF'],
];

interface PetFace {
  body: string;
  accent: string;
  earType: number; // 0 нет, 1 круглые, 2 острые, 3 антенны
  hasWings: boolean;
  hasHorn: boolean;
  hasTail: boolean;
  cheekColor: string;
  eyeStyle: number; // 0 круглые, 1 счастливые ^^, 2 звёздочки
  belly: boolean;
}

function faceFor(seed: number, rarity: Rarity): PetFace {
  const rnd = mulberry32(seed * 2654435761);
  const palette = BODY_PALETTES[Math.floor(rnd() * BODY_PALETTES.length)];
  return {
    body: palette[0],
    accent: palette[1],
    earType: Math.floor(rnd() * 4),
    hasWings: rarity === 'Epic' || rarity === 'Mythic' || rnd() > 0.75,
    hasHorn: rarity === 'Legendary' || rarity === 'Mythic' || rarity === 'Secret' || rnd() > 0.85,
    hasTail: rnd() > 0.4,
    cheekColor: '#F38BBF',
    eyeStyle: rarity === 'Secret' || rarity === 'Mythic' ? 2 : Math.floor(rnd() * 2),
    belly: rnd() > 0.5,
  };
}

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
  const body = silhouette ? '#3A3157' : f.body;
  const accent = silhouette ? '#2E2647' : f.accent;
  const dark = silhouette ? '#241D3E' : '#21183D';
  const wing = silhouette ? '#453A6B' : '#CFF3FC';

  const id = `pet-${seed}-${silhouette ? 's' : 'c'}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="Питомец">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={silhouette ? '#3A3157' : RARITY_COLORS[rarity].soft} />
          <stop offset="100%" stopColor={silhouette ? '#2A2148' : '#FFFFFF'} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-bg)`} />
      {/* крылья */}
      {f.hasWings && !silhouette && (
        <>
          <ellipse cx="24" cy="48" rx="13" ry="8" fill={wing} stroke="#9BDDF0" strokeWidth="1.5" transform="rotate(-25 24 48)" />
          <ellipse cx="76" cy="48" rx="13" ry="8" fill={wing} stroke="#9BDDF0" strokeWidth="1.5" transform="rotate(25 76 48)" />
        </>
      )}
      {/* уши */}
      {f.earType === 1 && (
        <>
          <circle cx="34" cy="26" r="9" fill={body} />
          <circle cx="66" cy="26" r="9" fill={body} />
        </>
      )}
      {f.earType === 2 && (
        <>
          <path d="M30 32 L26 12 L44 24 Z" fill={body} />
          <path d="M70 32 L74 12 L56 24 Z" fill={body} />
        </>
      )}
      {f.earType === 3 && (
        <>
          <path d="M38 28 Q36 12 30 10" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="29" cy="9" r="4" fill={accent} />
          <path d="M62 28 Q64 12 70 10" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="71" cy="9" r="4" fill={accent} />
        </>
      )}
      {/* рог */}
      {f.hasHorn && <path d="M50 18 L44 4 L56 4 Z" fill={accent} stroke={dark} strokeWidth="1" />}
      {/* хвост */}
      {f.hasTail && <path d="M78 62 Q92 60 90 46" stroke={body} strokeWidth="6" fill="none" strokeLinecap="round" />}
      {/* тело */}
      <ellipse cx="50" cy="56" rx="26" ry="24" fill={body} stroke={dark} strokeWidth="2.5" />
      {f.belly && <ellipse cx="50" cy="64" rx="14" ry="11" fill={accent} opacity="0.85" />}
      {/* лицо */}
      {f.eyeStyle === 0 && (
        <>
          <circle cx="41" cy="52" r="4.5" fill={dark} />
          <circle cx="59" cy="52" r="4.5" fill={dark} />
          <circle cx="42.5" cy="50.5" r="1.5" fill="#fff" />
          <circle cx="60.5" cy="50.5" r="1.5" fill="#fff" />
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
      {!silhouette && (
        <>
          <circle cx="34" cy="59" r="4" fill={f.cheekColor} opacity="0.55" />
          <circle cx="66" cy="59" r="4" fill={f.cheekColor} opacity="0.55" />
        </>
      )}
      <path d="M45 61 Q50 66 55 61" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function EggArt({ seed, size = 64, cracked = false }: { seed: number; size?: number; cracked?: boolean }) {
  const rnd = mulberry32(seed * 97);
  const c1 = BODY_PALETTES[Math.floor(rnd() * BODY_PALETTES.length)];
  const spot = rnd() > 0.5;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Яйцо">
      <defs>
        <linearGradient id={`egg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1[1]} />
          <stop offset="100%" stopColor={c1[0]} />
        </linearGradient>
      </defs>
      <path
        d="M50 14C33 14 22 38 22 58c0 20 12 32 28 32s28-12 28-32C78 38 67 14 50 14Z"
        fill={`url(#egg-${seed})`}
        stroke="#21183D"
        strokeWidth="3"
      />
      {spot && <circle cx="42" cy="50" r="7" fill="#fff" opacity="0.5" />}
      {!spot && <path d="M36 44 q8 -8 16 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.5" strokeLinecap="round" />}
      {cracked && (
        <path
          d="M30 62 l8 -7 6 8 8 -9 7 9 8 -7 6 8"
          stroke="#21183D"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <ellipse cx="38" cy="30" rx="6" ry="10" fill="#fff" opacity="0.45" transform="rotate(-15 38 30)" />
    </svg>
  );
}

export function RewardArt({ seed, size = 72 }: { seed: number; size?: number }) {
  const rnd = mulberry32(seed * 31);
  const palette = BODY_PALETTES[Math.floor(rnd() * BODY_PALETTES.length)];
  const kind = Math.floor(rnd() * 3); // 0 сундук, 1 подарок, 2 звезда-сюрприз
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Награда">
      {kind === 0 && (
        <g>
          <rect x="20" y="40" width="60" height="42" rx="8" fill={palette[0]} stroke="#21183D" strokeWidth="3" />
          <path d="M20 52 h60" stroke="#21183D" strokeWidth="3" />
          <rect x="44" y="40" width="12" height="42" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <path d="M50 40 v-8 a8 8 0 0 1 8 8" fill="none" stroke="#21183D" strokeWidth="3" />
          <circle cx="50" cy="56" r="5" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
        </g>
      )}
      {kind === 1 && (
        <g>
          <rect x="24" y="42" width="52" height="40" rx="6" fill={palette[1]} stroke="#21183D" strokeWidth="3" />
          <rect x="18" y="32" width="64" height="14" rx="5" fill={palette[0]} stroke="#21183D" strokeWidth="3" />
          <rect x="45" y="32" width="10" height="50" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
          <path d="M50 32 q-10 -14 -18 -6 q-6 7 8 8 M50 32 q10 -14 18 -6 q6 7 -8 8" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
        </g>
      )}
      {kind === 2 && (
        <g>
          <path
            d="M50 16 L58 40 L84 40 L63 55 L71 80 L50 64 L29 80 L37 55 L16 40 L42 40 Z"
            fill="#FFD45C"
            stroke="#21183D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="48" r="5" fill={palette[0]} />
        </g>
      )}
    </svg>
  );
}

export function QuestArt({ seed, size = 72 }: { seed: number; size?: number }) {
  const rnd = mulberry32(seed * 13);
  const kind = Math.floor(rnd() * 3); // свиток, компас, кисть
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Квест">
      {kind === 0 && (
        <g>
          <rect x="24" y="18" width="52" height="64" rx="8" fill="#F4F1FF" stroke="#21183D" strokeWidth="3" />
          <path d="M34 34 h32 M34 46 h32 M34 58 h20" stroke="#7655D9" strokeWidth="4" strokeLinecap="round" />
          <circle cx="66" cy="66" r="9" fill="#FFD45C" stroke="#21183D" strokeWidth="2.5" />
        </g>
      )}
      {kind === 1 && (
        <g>
          <circle cx="50" cy="50" r="32" fill="#5EC8ED" stroke="#21183D" strokeWidth="3" />
          <circle cx="50" cy="50" r="22" fill="#E6F7FD" stroke="#21183D" strokeWidth="2" />
          <path d="M50 32 L56 52 L50 47 L44 52 Z" fill="#F38BBF" stroke="#21183D" strokeWidth="2" />
          <circle cx="50" cy="50" r="3.5" fill="#21183D" />
        </g>
      )}
      {kind === 2 && (
        <g>
          <path d="M30 74 Q26 46 44 30 Q58 18 72 26 Q60 34 52 48 Q44 62 30 74Z" fill="#7655D9" stroke="#21183D" strokeWidth="3" />
          <path d="M66 30 Q74 44 64 56" stroke="#FFD45C" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="38" cy="66" r="6" fill="#F38BBF" stroke="#21183D" strokeWidth="2.5" />
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
          <stop offset="100%" stopColor="#BDEAF8" />
        </linearGradient>
        <linearGradient id="isle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8BE0C3" />
          <stop offset="100%" stopColor="#7655D9" />
        </linearGradient>
      </defs>
      <rect width="340" height="210" rx="24" fill="url(#sky)" />
      <circle cx="286" cy="42" r="20" fill="#FFD45C" />
      <circle cx="286" cy="42" r="28" fill="#FFD45C" opacity="0.3" />
      <g className="animate-floaty">
        <ellipse cx="70" cy="48" rx="26" ry="11" fill="#fff" opacity="0.9" />
        <ellipse cx="88" cy="42" rx="16" ry="9" fill="#fff" opacity="0.9" />
      </g>
      <g className="animate-floaty" style={{ animationDelay: '1.2s' }}>
        <ellipse cx="190" cy="30" rx="20" ry="8" fill="#fff" opacity="0.75" />
      </g>
      {/* остров */}
      <path d="M60 118 Q170 62 280 118 Q270 168 170 172 Q70 168 60 118Z" fill="url(#isle)" stroke="#21183D" strokeWidth="3" />
      <path d="M84 122 Q170 84 256 122 Q230 142 170 144 Q110 142 84 122Z" fill="#F4F1FF" opacity="0.35" />
      {/* домик-портал */}
      <g>
        <path d="M150 96 L170 70 L190 96 Z" fill="#F38BBF" stroke="#21183D" strokeWidth="3" strokeLinejoin="round" />
        <rect x="155" y="96" width="30" height="26" rx="6" fill="#7655D9" stroke="#21183D" strokeWidth="3" />
        <ellipse cx="170" cy="112" rx="8" ry="11" fill="#5EC8ED" stroke="#21183D" strokeWidth="2.5" />
      </g>
      {/* дерево */}
      <g>
        <rect x="104" y="100" width="8" height="24" rx="3" fill="#8A5A3B" stroke="#21183D" strokeWidth="2" />
        <circle cx="108" cy="92" r="16" fill="#4ADE80" stroke="#21183D" strokeWidth="2.5" />
        <circle cx="100" cy="84" r="5" fill="#FFD45C" />
        <circle cx="116" cy="90" r="4" fill="#FFD45C" />
      </g>
      {/* кристалл */}
      <g className="animate-wiggle" style={{ transformOrigin: '245px 105px' }}>
        <path d="M238 118 L245 92 L252 118 Z" fill="#5EC8ED" stroke="#21183D" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M245 92 L245 118" stroke="#fff" strokeWidth="2" opacity="0.7" />
      </g>
      {/* блёстки */}
      <path d="M60 66 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFD45C" />
      <path d="M300 96 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" fill="#F38BBF" />
      <path d="M130 40 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#fff" />
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
      <circle cx="42" cy="58" r="3" fill="#21183D" />
      <circle cx="58" cy="58" r="3" fill="#21183D" />
      <circle cx="36" cy="64" r="3.5" fill="#F38BBF" opacity="0.6" />
      <circle cx="64" cy="64" r="3.5" fill="#F38BBF" opacity="0.6" />
      <path d="M45 67 Q50 71 55 67" stroke="#21183D" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 34 l4 -8 4 6" stroke="#FFD45C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
