import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

// ─── UI-кит ────────────────────────────────────────────────────────────────

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'sun';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-base',
        size === 'lg' && 'px-5 py-3.5 text-lg',
        variant === 'primary' && 'bg-grape text-white shadow-pop',
        variant === 'sun' && 'bg-sun text-night shadow-card',
        variant === 'secondary' && 'bg-white text-grape border-2 border-grape/20 shadow-card',
        variant === 'ghost' && 'bg-grape/10 text-grape',
        variant === 'danger' && 'bg-red-100 text-red-700 border-2 border-red-200',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-3xl bg-white shadow-card', className)}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-5 flex items-center justify-between px-1">
      <h2 className="text-lg font-black text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function ProgressBar({ value, max, className, gradient = true }: { value: number; max: number; className?: string; gradient?: boolean }) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-ink/10', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', gradient ? 'bg-gradient-to-r from-sky via-grape to-rosa' : 'bg-grape')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Chip({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', className)} style={style}>
      {children}
    </span>
  );
}

export function EmptyState({ art, title, text, action }: { art?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-grape/20 bg-white/70 px-6 py-10 text-center">
      {art && <div className="animate-floaty">{art}</div>}
      <p className="text-lg font-black text-ink">{title}</p>
      {text && <p className="text-sm font-semibold text-ink/60">{text}</p>}
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/60 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm animate-popIn rounded-3xl bg-white p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black text-ink">{title}</h3>
          {onClose && (
            <button onClick={onClose} aria-label="Закрыть" className="rounded-full bg-ink/5 p-1.5 text-ink/60">
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function DemoTag() {
  return (
    <Chip className="bg-sun/30 text-[#8A6100] border border-sun">
      Demo
    </Chip>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto no-scrollbar rounded-2xl bg-ink/5 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold transition',
            value === o.value ? 'bg-white text-grape shadow-card' : 'text-ink/50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
