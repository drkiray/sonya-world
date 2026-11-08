// ─── Премиальные игровые предметы и сцена острова ──────────────────────────
import type { ReactElement } from 'react';
import { INK, lighten } from './shared';

type ItemProps = { size?: number; className?: string };

/** Сундук с золотыми обручами */
export function ChestArt({ size = 96, className }: ItemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Сундук" className={`reward-float ${className ?? ''}`}>
      <defs>
        <linearGradient id="ch-w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten('#B96A32', 25)} />
          <stop offset="100%" stopColor="#B96A32" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="88" rx="30" ry="5" fill={INK} opacity="0.12" />
      {/* крышка */}
      <path d="M22 48 Q22 30 50 30 Q78 30 78 48 L78 52 L22 52 Z" fill="url(#ch-w)" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      {/* низ */}
      <rect x="22" y="52" width="56" height="30" rx="5" fill="url(#ch-w)" stroke={INK} strokeWidth="2.8" />
      {/* обручи */}
      <rect x="33" y="32" width="9" height="50" fill="#FFD45C" stroke={INK} strokeWidth="2.2" />
      <rect x="58" y="32" width="9" height="50" fill="#FFD45C" stroke={INK} strokeWidth="2.2" />
      {/* замок */}
      <rect x="43" y="46" width="14" height="14" rx="3" fill="#FFD45C" stroke={INK} strokeWidth="2.2" />
      <circle cx="50" cy="52" r="2.6" fill={INK} />
      <path d="M50 54 v4" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      {/* блик */}
      <rect x="26" y="34" width="46" height="7" rx="3.5" fill="#fff" opacity="0.22" />
    </svg>
  );
}

/** Подарок с бантом и биркой */
export function GiftArt({ size = 96, className }: ItemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Подарок" className={`reward-float ${className ?? ''}`}>
      <ellipse cx="50" cy="88" rx="28" ry="5" fill={INK} opacity="0.12" />
      <rect x="26" y="46" width="48" height="36" rx="5" fill="#F38BBF" stroke={INK} strokeWidth="2.8" />
      <rect x="20" y="34" width="60" height="15" rx="5" fill="#C25BA0" stroke={INK} strokeWidth="2.8" />
      <rect x="45" y="34" width="10" height="48" fill="#FFD45C" stroke={INK} strokeWidth="2.2" />
      <path d="M50 34 Q38 16 28 24 Q21 31 36 33 M50 34 Q62 16 72 24 Q79 31 64 33" fill="#FFD45C" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="50" cy="32" r="4.4" fill="#FFD45C" stroke={INK} strokeWidth="2" />
      {/* бирка */}
      <g transform="rotate(-12 72 52)">
        <rect x="66" y="46" width="13" height="9" rx="2" fill="#fff" stroke={INK} strokeWidth="1.6" />
        <circle cx="68.5" cy="50.5" r="1.2" fill={INK} />
      </g>
      <rect x="30" y="50" width="16" height="6" rx="3" fill="#fff" opacity="0.3" />
    </svg>
  );
}

/** Звезда-талисман с мордочкой */
export function StarArt({ size = 96, className }: ItemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Звезда" className={`reward-float ${className ?? ''}`}>
      <ellipse cx="50" cy="88" rx="24" ry="4.6" fill={INK} opacity="0.12" />
      <path
        d="M50 12 L59 38 L86 38 L64 54 L72 80 L50 64 L28 80 L36 54 L14 38 L41 38 Z"
        fill="#FFD45C"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M38 34 L46 20" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.7" />
      <g className="pet-eyes">
        <circle cx="44" cy="46" r="3.2" fill={INK} />
        <circle cx="56" cy="46" r="3.2" fill={INK} />
      </g>
      <ellipse cx="38" cy="52" rx="4" ry="2.6" fill="#F38BBF" opacity="0.6" />
      <ellipse cx="62" cy="52" rx="4" ry="2.6" fill="#F38BBF" opacity="0.6" />
      <path d="M45 52 Q50 56 55 52" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Тот же выбор варианта, что и в процедурном RewardArt: 0 сундук, 1 подарок, 2 звезда */
export function premiumRewardKind(seed: number): number {
  let a = (seed * 31) >>> 0;
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * 3);
}

export const PREMIUM_ITEMS: Record<number, (p: ItemProps) => ReactElement> = {
  0: ChestArt,
  1: GiftArt,
  2: StarArt,
};

/** Остров Сонечки — ручная сцена: слои, свечения, живые детали */
export function IslandScene({ size = 340, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 340 210" role="img" aria-label="Остров Сонечки" className={className}>
      <defs>
        <linearGradient id="is-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EC8ED" />
          <stop offset="100%" stopColor="#D8F3FB" />
        </linearGradient>
        <linearGradient id="is-cliff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8BE0C3" />
          <stop offset="55%" stopColor="#7655D9" />
          <stop offset="100%" stopColor="#4A3687" />
        </linearGradient>
        <linearGradient id="is-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7FE3B4" />
          <stop offset="100%" stopColor="#4EC98B" />
        </linearGradient>
        <radialGradient id="is-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="100%" stopColor="#FFD45C" />
        </radialGradient>
      </defs>

      <rect width="340" height="210" rx="24" fill="url(#is-sky)" />

      {/* солнце */}
      <circle cx="284" cy="40" r="30" fill="#FFD45C" opacity="0.25" className="sun-halo" />
      <circle cx="284" cy="40" r="18" fill="url(#is-sun)" />

      {/* звёздочки-мерцалки */}
      <path d="M56 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFD45C" className="twinkle" />
      <path d="M306 92 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" fill="#F38BBF" className="twinkle" style={{ animationDelay: '0.8s' }} />
      <path d="M128 34 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#fff" className="twinkle" style={{ animationDelay: '1.5s' }} />

      {/* облака */}
      <g className="cloud-slow">
        <ellipse cx="66" cy="48" rx="26" ry="11" fill="#fff" opacity="0.92" />
        <ellipse cx="86" cy="41" rx="16" ry="9" fill="#fff" opacity="0.92" />
      </g>
      <g className="cloud-fast">
        <ellipse cx="188" cy="28" rx="20" ry="8" fill="#fff" opacity="0.78" />
      </g>
      <g className="cloud-slow" style={{ animationDelay: '2.2s' }}>
        <ellipse cx="248" cy="72" rx="16" ry="7" fill="#fff" opacity="0.6" />
      </g>

      {/* далёкий островок */}
      <g opacity="0.55">
        <path d="M250 96 Q272 84 294 96 Q288 106 272 107 Q256 106 250 96Z" fill="#8B7BD9" />
        <circle cx="272" cy="84" r="5" fill="#4EC98B" />
      </g>

      {/* утес острова */}
      <path d="M58 120 Q170 62 282 120 Q274 156 226 168 Q170 178 114 168 Q66 156 58 120Z" fill="url(#is-cliff)" stroke={INK} strokeWidth="3" />
      {/* светлая полоса-отражение на утёсе */}
      <path d="M84 128 Q170 92 256 128 Q232 146 170 148 Q108 146 84 128Z" fill="#fff" opacity="0.18" />
      {/* свисающие корни/камни */}
      <path d="M96 152 q4 10 -2 16 M244 150 q-4 12 2 18 M170 172 q0 8 -4 12" stroke="#4A3687" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* лужайка */}
      <path d="M76 118 Q170 76 264 118 Q236 134 170 136 Q104 134 76 118Z" fill="url(#is-grass)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />

      {/* тропинка к дому */}
      <path d="M150 120 Q160 112 170 112 Q180 112 188 120 Q180 128 168 128 Q156 128 150 120Z" fill="#F3DFC2" stroke={INK} strokeWidth="2" />

      {/* домик-портал */}
      <g>
        <path d="M148 96 L170 68 L192 96 Z" fill="#F38BBF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M154 92 L170 72 L186 92 Z" fill="#FBD3E8" opacity="0.7" />
        <rect x="153" y="96" width="34" height="27" rx="6" fill="#7655D9" stroke={INK} strokeWidth="3" />
        <ellipse cx="170" cy="113" rx="8.5" ry="12" fill="#5EC8ED" stroke={INK} strokeWidth="2.4" />
        <ellipse cx="170" cy="113" rx="8.5" ry="12" fill="#BDEAF8" className="door-glow" />
        {/* окошко */}
        <circle cx="181" cy="102" r="3.4" fill="#FFE9A8" stroke={INK} strokeWidth="1.8" />
      </g>

      {/* деревья */}
      <g className="pet-idle">
        <rect x="102" y="98" width="9" height="26" rx="3.5" fill="#8A5A3B" stroke={INK} strokeWidth="2" />
        <circle cx="106" cy="88" r="17" fill="#4ADE80" stroke={INK} strokeWidth="2.6" />
        <circle cx="97" cy="80" r="5.5" fill="#FFD45C" />
        <circle cx="115" cy="86" r="4.4" fill="#FFD45C" />
        <circle cx="106" cy="88" r="17" fill="#fff" opacity="0.12" />
      </g>
      <g>
        <rect x="232" y="104" width="7" height="20" rx="3" fill="#8A5A3B" stroke={INK} strokeWidth="1.8" />
        <circle cx="235" cy="98" r="12" fill="#6FE0B8" stroke={INK} strokeWidth="2.2" />
        <circle cx="231" cy="94" r="3" fill="#fff" opacity="0.5" />
      </g>

      {/* кристаллы */}
      <g className="animate-wiggle" style={{ transformOrigin: '212px 112px' }}>
        <path d="M205 124 L212 96 L219 124 Z" fill="#5EC8ED" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M212 96 L212 124" stroke="#fff" strokeWidth="1.8" opacity="0.75" />
      </g>
      <path d="M222 124 L226 108 L231 124 Z" fill="#7DD3FC" stroke={INK} strokeWidth="2" strokeLinejoin="round" />

      {/* цветочки и трава */}
      <g>
        <circle cx="92" cy="116" r="3" fill="#F38BBF" stroke={INK} strokeWidth="1.4" />
        <circle cx="92" cy="116" r="1.1" fill="#FFD45C" />
        <circle cx="248" cy="118" r="3" fill="#fff" stroke={INK} strokeWidth="1.4" />
        <circle cx="248" cy="118" r="1.1" fill="#F5B917" />
        <path d="M120 122 q3 -8 6 0 M200 124 q3 -8 6 0 M140 126 q3 -7 6 0" stroke="#3E9E6C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>

      {/* бабочка */}
      <g className="cloud-fast" style={{ animationDuration: '6s' }}>
        <ellipse cx="136" cy="66" rx="4" ry="3" fill="#F38BBF" stroke={INK} strokeWidth="1.2" transform="rotate(-24 136 66)" />
        <ellipse cx="143" cy="66" rx="4" ry="3" fill="#FFD45C" stroke={INK} strokeWidth="1.2" transform="rotate(24 143 66)" />
      </g>
    </svg>
  );
}
