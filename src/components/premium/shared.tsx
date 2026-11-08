// ─── Общие хелперы премиальных иллюстраций ─────────────────────────────────
import type { ReactNode } from 'react';

export const INK = '#21183D';

let seq = 0;

/** Рамка: фоновый круг + силуэт-фильтр + дыхание */
export function Frame({
  size = 160,
  soft = '#F4F1FF',
  silhouette = false,
  label,
  className,
  children,
}: {
  size?: number;
  soft?: string;
  silhouette?: boolean;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const id = `fr${++seq}`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} role="img" aria-label={label}>
      <defs>
        <radialGradient id={id} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={soft} />
          <stop offset="100%" stopColor="#FFFFFF" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="97" fill={`url(#${id})`} />
      <g style={silhouette ? { filter: 'brightness(0.25) saturate(0.35)' } : undefined}>
        <g className="pet-idle">{children}</g>
      </g>
    </svg>
  );
}

/** Тень-подставка */
export function Ground({ y = 168, rx = 44 }: { y?: number; rx?: number }) {
  return <ellipse cx="100" cy={y} rx={rx} ry="9" fill={INK} opacity="0.1" />;
}

/** Мерцающая четырёхлучевая звёздочка */
export function Spark({
  x,
  y,
  s = 6,
  c = '#FFD45C',
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  c?: string;
  delay?: number;
}) {
  return (
    <path
      d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28}Z`}
      fill={c}
      className="twinkle"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

/** Мягкое свечение-ореол */
export function Glow({ cx, cy, r, color, op = 0.3 }: { cx: number; cy: number; r: number; color: string; op?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={color} opacity={op} className="pet-aura" />;
}

/** Осветление hex-цвета */
export function lighten(hex: string, amt = 40): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt);
  const g = Math.min(255, ((n >> 8) & 255) + amt);
  const b = Math.min(255, (n & 255) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
