import { Home, BookHeart, ScrollText, ShoppingBag, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

const ITEMS = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/collection', label: 'Альбом', icon: BookHeart },
  { to: '/quests', label: 'Задания', icon: ScrollText },
  { to: '/shop', label: 'Магазин', icon: ShoppingBag },
  { to: '/profile', label: 'Это я!', icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom z-40 mt-auto border-t border-ink/5 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition',
                isActive ? 'text-grape' : 'text-ink/40',
              )
            }
          >
            <Icon size={22} strokeWidth={2.4} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
