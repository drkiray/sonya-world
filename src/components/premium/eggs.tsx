// ─── Премиальные ручные яйца по редкостям ──────────────────────────────────
import type { Rarity } from '../../types';
import { INK } from './shared';

type EggProps = { size?: number; cracked?: boolean; className?: string };

function EggShell({
  size = 96,
  cracked,
  className,
  id,
  base,
  top,
  children,
}: EggProps & { id: string; base: string; top: string; children?: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Яйцо"
      className={cracked ? `egg-wobble ${className ?? ''}` : className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={base} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d="M50 12C32 12 21 37 21 58c0 21 13 34 29 34s29-13 29-34C79 37 68 12 50 12Z" />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="92" rx="25" ry="5" fill={INK} opacity="0.1" />
      <path
        d="M50 12C32 12 21 37 21 58c0 21 13 34 29 34s29-13 29-34C79 37 68 12 50 12Z"
        fill={`url(#${id})`}
        stroke={INK}
        strokeWidth="3"
      />
      <g clipPath={`url(#${id}-clip)`}>
        {children}
        <rect className="egg-shine" x="-40" y="0" width="26" height="110" fill="#fff" opacity="0.35" transform="skewX(-18)" />
      </g>
      <ellipse cx="37" cy="30" rx="6" ry="11" fill="#fff" opacity="0.5" transform="rotate(-16 37 30)" />
      {cracked && (
        <>
          <path d="M28 60 l8 -7 6 8 8 -9 7 9 8 -7 6 8" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M68 36 l6 -12 M74 40 l10 -8" stroke="#FFD45C" strokeWidth="3" strokeLinecap="round" className="egg-rays" />
        </>
      )}
    </svg>
  );
}

export function EggCommon({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-c" base="#9AA3B2" top="#D7DDE6">
      <g fill="#fff" opacity="0.5">
        <circle cx="38" cy="52" r="6" />
        <circle cx="58" cy="44" r="4.5" />
        <circle cx="62" cy="66" r="5.5" />
      </g>
    </EggShell>
  );
}

export function EggUncommon({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-u" base="#4ADE80" top="#B9F4D2">
      <g stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M36 62 Q44 50 52 60 M52 60 Q60 50 66 60" />
        <path d="M42 46 q4 -8 2 -12" />
      </g>
    </EggShell>
  );
}

export function EggRare({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-r" base="#5EC8ED" top="#C9EEF9">
      <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.8">
        <path d="M50 40 v16 M43 46 l14 8 M57 46 l-14 8 M45 42 l10 16 M55 42 l-10 16" />
        <path d="M40 70 q10 8 20 0" fill="none" />
      </g>
    </EggShell>
  );
}

export function EggEpic({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-e" base="#7655D9" top="#C7B6F1">
      <g fill="#FFD45C">
        <path d="M42 48 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8z" />
        <path d="M60 62 l1.5 3.4 3.4 1.5 -3.4 1.5 -1.5 3.4 -1.5 -3.4 -3.4 -1.5 3.4 -1.5z" />
      </g>
      <path d="M36 66 h8 M56 44 h8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" strokeDasharray="3 4" />
    </EggShell>
  );
}

export function EggLegendary({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-l" base="#F5B917" top="#FFE9A8">
      <g stroke="#B9820A" strokeWidth="3" fill="none" opacity="0.75">
        <path d="M28 52 Q50 44 72 52 M27 66 Q50 58 73 66" />
      </g>
      <g transform="translate(50 58)">
        <path d="M0 -10 L7 -3 L4 8 L-4 8 L-7 -3 Z" fill="#5EC8ED" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M0 -10 L0 8" stroke="#fff" strokeWidth="1.6" opacity="0.8" />
      </g>
      <path d="M24 40 l4 -8 M76 40 l-4 -8" stroke="#FFD45C" strokeWidth="3" strokeLinecap="round" className="egg-rays" />
    </EggShell>
  );
}

export function EggMythic({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-m" base="#F38BBF" top="#FBD3E8">
      <g fill="#fff" opacity="0.85">
        <path d="M42 50 c-4 -5 -10 -1 -6 4 l6 5 6 -5 c4 -5 -2 -9 -6 -4z" />
        <path d="M60 66 c-3 -4 -8 -1 -5 3 l5 4 5 -4 c3 -4 -2 -7 -5 -3z" />
      </g>
      <path d="M30 70 Q50 80 70 70" stroke="#fff" strokeWidth="2.6" fill="none" opacity="0.7" strokeLinecap="round" />
    </EggShell>
  );
}

export function EggSecret({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-s" base="#3A3157" top="#5B4A96">
      <path d="M38 40 L44 54 L38 66 L46 76 M60 38 L56 52 L64 62 L58 76" stroke="#FF6B6B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <circle cx="38" cy="48" r="3" fill="#FF6B6B" opacity="0.8" className="twinkle" />
      <circle cx="62" cy="58" r="3" fill="#FF6B6B" opacity="0.8" className="twinkle" style={{ animationDelay: '1s' }} />
    </EggShell>
  );
}

/** Космическая — звёздное небо в яйце */
export function EggCosmic({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-cos" base="#4F46E5" top="#A5B4FC">
      <g fill="#fff">
        <circle cx="36" cy="44" r="1.8" className="twinkle" />
        <circle cx="58" cy="38" r="1.4" className="twinkle" style={{ animationDelay: '0.6s' }} />
        <circle cx="48" cy="58" r="2" className="twinkle" style={{ animationDelay: '1.1s' }} />
        <circle cx="64" cy="62" r="1.5" className="twinkle" style={{ animationDelay: '1.6s' }} />
        <path d="M40 66 l4 -8 4 8z" fill="#C7B6F1" opacity="0.9" />
      </g>
      <ellipse cx="50" cy="52" rx="18" ry="10" fill="#312C8E" opacity="0.5" />
    </EggShell>
  );
}

/** Вечная — ледяной кристалл */
export function EggEternal({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-et" base="#22D3EE" top="#E0FBFF">
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
        <path d="M50 36 v20 M42 42 l16 10 M58 42 l-16 10 M44 38 l12 16 M56 38 l-12 16" />
      </g>
      <path d="M36 70 l5 -9 5 9z M54 72 l4 -7 4 7z" fill="#BAF2FA" stroke="#0E7490" strokeWidth="1.6" strokeLinejoin="round" />
    </EggShell>
  );
}

/** Божественная — сияющий нимб */
export function EggDivine({ size, cracked, className }: EggProps) {
  return (
    <EggShell size={size} cracked={cracked} className={className} id="egg-dv" base="#FDE047" top="#FFFBD1">
      <ellipse cx="50" cy="30" rx="20" ry="5" fill="none" stroke="#F59E0B" strokeWidth="3" opacity="0.8" />
      <g fill="#F59E0B" opacity="0.75">
        <path d="M38 48 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8z" />
        <path d="M58 62 l1.5 3.4 3.4 1.5 -3.4 1.5 -1.5 3.4 -1.5 -3.4 -3.4 -1.5 3.4 -1.5z" />
      </g>
      <path d="M34 44 q16 -8 32 0" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
    </EggShell>
  );
}

export const PREMIUM_EGGS: Record<Rarity, (p: EggProps) => React.ReactElement> = {
  'Обычная': EggCommon,
  'Необычная': EggUncommon,
  'Редкая': EggRare,
  'Эпическая': EggEpic,
  'Легендарная': EggLegendary,
  'Мифическая': EggMythic,
  'Космическая': EggCosmic,
  'Секретная': EggSecret,
  'Вечная': EggEternal,
  'Божественная': EggDivine,
};
