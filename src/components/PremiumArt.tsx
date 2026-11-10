// ─── Премиальные ручные иллюстрации: реестр подмены ────────────────────────
// Каждый питомец нарисован вручную (многослойный SVG): градиенты, блики,
// тени, характерные детали. PetImage выбирает: ручная иллюстрация →
// файл-ассет (assets/manifest.json) → процедурный арт.

import type { ReactElement } from 'react';
import {
  OwlArt,
  FluffballArt,
  HedgehogArt,
  RockArt,
  FireflyArt,
  CloudBunnyArt,
  FoxArt,
  CrystalBearArt,
  PortalCatArt,
  DragonArt,
  RainbowKeeperArt,
  ShadowArt,
} from './premium/pets';

interface PremiumProps {
  size?: number;
  silhouette?: boolean;
  className?: string;
}

/** Лунная единорожка (demo-10, Legendary) */
export function UnicornArt({ size = 160, silhouette = false, className }: PremiumProps) {
  const s = silhouette;
  const cream = s ? '#3A3157' : '#FFF6E8';
  const ink = s ? '#241D3E' : '#21183D';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Лунная единорожка"
      style={s ? { filter: 'brightness(0.25) saturate(0.35)' } : undefined}
    >
      <defs>
        <radialGradient id="uni-bg" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={s ? '#3A3157' : '#FFF6DB'} />
          <stop offset="100%" stopColor={s ? '#2A2148' : '#FFFFFF'} />
        </radialGradient>
        <linearGradient id="uni-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s ? cream : '#FFFFFF'} />
          <stop offset="100%" stopColor={cream} />
        </linearGradient>
        <linearGradient id="uni-horn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s ? '#3A3157' : '#FFE9A8'} />
          <stop offset="100%" stopColor={s ? '#3A3157' : '#F5B917'} />
        </linearGradient>
        <linearGradient id="uni-mane1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={s ? '#453A6B' : '#F38BBF'} />
          <stop offset="100%" stopColor={s ? '#453A6B' : '#C25BA0'} />
        </linearGradient>
        <linearGradient id="uni-mane2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={s ? '#453A6B' : '#A78BFA'} />
          <stop offset="100%" stopColor={s ? '#453A6B' : '#7655D9'} />
        </linearGradient>
        <linearGradient id="uni-mane3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={s ? '#453A6B' : '#7DD3FC'} />
          <stop offset="100%" stopColor={s ? '#453A6B' : '#5EC8ED'} />
        </linearGradient>
        <radialGradient id="uni-eye" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={s ? ink : '#B79CFF'} />
          <stop offset="100%" stopColor={s ? ink : '#5B3FBF'} />
        </radialGradient>
        <radialGradient id="uni-blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={s ? '#453A6B' : '#F38BBF'} stopOpacity="0.65" />
          <stop offset="100%" stopColor={s ? '#453A6B' : '#F38BBF'} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="97" fill="url(#uni-bg)" />
      {!s && (
        <>
          <circle cx="100" cy="108" r="72" fill="#F5B917" opacity="0.12" className="pet-aura" />
          <path d="M42 52 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5 -8 -8 -3.5 8 -3.5z" fill="#FFD45C" className="twinkle" />
          <path d="M160 66 l2.6 6 6 2.6 -6 2.6 -2.6 6 -2.6 -6 -6 -2.6 6 -2.6z" fill="#F38BBF" className="twinkle" style={{ animationDelay: '0.9s' }} />
          <path d="M150 150 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#A78BFA" className="twinkle" style={{ animationDelay: '1.7s' }} />
        </>
      )}

      <ellipse cx="100" cy="168" rx="46" ry="9" fill={ink} opacity="0.1" />

      <g className="pet-idle">
        <path d="M138 120 Q172 112 168 84 Q160 100 148 102 Q160 84 150 70 Q142 88 134 96 Z" fill="url(#uni-mane3)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M138 122 Q170 122 172 98 Q160 110 150 108 Q164 96 158 82 Q148 96 138 102 Z" fill="url(#uni-mane2)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />

        <rect x="118" y="128" width="17" height="34" rx="8" fill="url(#uni-body)" stroke={ink} strokeWidth="2.5" />
        <rect x="117" y="150" width="19" height="14" rx="7" fill={s ? '#3A3157' : '#F5B917'} stroke={ink} strokeWidth="2.5" />

        <ellipse cx="102" cy="118" rx="42" ry="34" fill="url(#uni-body)" stroke={ink} strokeWidth="3" />
        {!s && <ellipse cx="88" cy="104" rx="16" ry="10" fill="#fff" opacity="0.55" transform="rotate(-18 88 104)" />}

        {!s && (
          <g transform="translate(122 116)">
            <path d="M4 -10 A11 11 0 1 0 4 10 A8.5 8.5 0 1 1 4 -10Z" fill="#F5B917" stroke={ink} strokeWidth="1.6" />
            <path d="M10 -6 l1.3 3 3 1.3 -3 1.3 -1.3 3 -1.3 -3 -3 -1.3 3 -1.3z" fill="#5EC8ED" stroke={ink} strokeWidth="1" />
          </g>
        )}

        <rect x="76" y="130" width="17" height="34" rx="8" fill="url(#uni-body)" stroke={ink} strokeWidth="2.5" />
        <rect x="75" y="152" width="19" height="14" rx="7" fill={s ? '#3A3157' : '#F5B917'} stroke={ink} strokeWidth="2.5" />

        <g className="pet-wing-l">
          <path d="M96 92 Q126 74 138 88 Q124 92 118 100 Q130 98 134 106 Q120 108 112 114 Q102 108 96 100 Z" fill={s ? '#453A6B' : '#EAF7FE'} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        </g>

        <path d="M66 96 Q58 66 76 52 Q92 42 106 52 L104 96 Z" fill="url(#uni-body)" stroke={ink} strokeWidth="3" strokeLinejoin="round" />

        <path d="M82 42 Q58 38 54 56 Q66 54 68 64 Q57 68 59 82 Q70 78 74 88 Q67 98 76 106 Q89 95 89 74 Q89 54 82 42Z" fill="url(#uni-mane1)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M90 38 Q72 30 64 42 Q77 42 79 52 Q70 54 72 64 Q82 60 86 68 Q92 56 90 38Z" fill="url(#uni-mane2)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M60 52 Q68 40 82 44 Q73 50 73 58 Q67 54 63 61 Q59 57 60 52Z" fill="url(#uni-mane3)" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />

        <path d="M86 46 L94 28 L103 44 Q94 40 86 46Z" fill={s ? cream : '#FFE9A8'} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        {!s && <path d="M89 43 L94 33 L99 42 Q94 40 89 43Z" fill="#F38BBF" opacity="0.8" />}

        <g>
          <path d="M62 46 Q64 14 70 8 Q76 14 78 46 Q70 50 62 46Z" fill="url(#uni-horn)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
          {!s && (
            <path d="M64 34 Q70 31 76 34 M65 24 Q70 21 75 24 M66 15 Q70 12 74 15" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
          )}
        </g>

        <ellipse cx="70" cy="66" rx="26" ry="24" fill="url(#uni-body)" stroke={ink} strokeWidth="3" />
        <ellipse cx="56" cy="76" rx="13" ry="10" fill={s ? cream : '#FFEDD6'} stroke={ink} strokeWidth="2.2" />
        {!s && <ellipse cx="52" cy="73" rx="4" ry="2.6" fill="#21183D" opacity="0.85" />}

        <g className="pet-eyes">
          <ellipse cx="76" cy="62" rx="8.5" ry="10" fill="#fff" stroke={ink} strokeWidth="2.4" />
          <ellipse cx="76" cy="63" rx="6" ry="7.4" fill="url(#uni-eye)" />
          <ellipse cx="76" cy="64" rx="3" ry="4.4" fill={ink} />
          {!s && (
            <>
              <circle cx="73.4" cy="59.5" r="2.4" fill="#fff" />
              <circle cx="79" cy="66" r="1.2" fill="#fff" opacity="0.85" />
              <path d="M68 54 q-3 -3 -6 -2.5 M84 54 q3 -3 6 -2.5" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </>
          )}
        </g>

        {!s && <ellipse cx="86" cy="74" rx="7" ry="4.6" fill="url(#uni-blush)" />}

        <path d="M50 82 Q55 87 61 84" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Реестр премиальных иллюстраций: id питомца → компонент */
export const PREMIUM_PETS: Record<string, (p: PremiumProps) => ReactElement> = {
  'owl-yarik': OwlArt,
  'demo-01': FluffballArt,
  'demo-02': HedgehogArt,
  'demo-03': RockArt,
  'demo-04': FireflyArt,
  'demo-05': CloudBunnyArt,
  'demo-06': FoxArt,
  'demo-07': CrystalBearArt,
  'demo-08': PortalCatArt,
  'demo-09': DragonArt,
  'demo-10': UnicornArt,
  'demo-11': RainbowKeeperArt,
  'demo-12': ShadowArt,
};
