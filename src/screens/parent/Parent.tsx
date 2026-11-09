import { lazy, Suspense, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Delete, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { verifyPin } from '../../services/store';
import { useUi } from '../../state/AppContext';

const SESSION_KEY = 'sonya-parent-auth';

export function isParentAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export default function Parent() {
  const location = useLocation();
  if (!isParentAuthed()) {
    return location.pathname === '/parent' ? <PinGate /> : <Navigate to="/parent" replace />;
  }
  return <ParentShell />;
}

const Overview = lazy(() => import('./ParentOverview'));
const Quests = lazy(() => import('./ParentQuests'));
const Rewards = lazy(() => import('./ParentRewards'));
const Finance = lazy(() => import('./ParentFinance'));
const Settings = lazy(() => import('./ParentSettings'));

function PinGate() {
  const navigate = useNavigate();
  const { toast } = useUi();
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      setTimeout(async () => {
        if (await verifyPin(next)) {
          sessionStorage.setItem(SESSION_KEY, '1');
          navigate('/parent/overview', { replace: true });
        } else {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setPin('');
          toast('Неверный PIN-код', 'error');
        }
      }, 150);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-night px-6 pb-8 pt-6 text-white">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="rounded-full bg-white/15 p-2" aria-label="Назад">
          <ArrowLeft size={18} />
        </button>
        <ShieldCheck className="text-sun" size={22} />
        <p className="text-lg font-black">Режим для мамы</p>
      </div>
      <p className="mt-6 text-center text-sm font-bold text-white/60">
        Введите PIN-код для входа.
        <br />
        PIN по умолчанию: <span className="text-sun">1234</span> (сменить во вкладке «Настройки» панели).
      </p>

      <div className={`mx-auto mt-8 flex gap-4 ${shake ? 'animate-wiggle' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full ${pin.length > i ? 'bg-sun' : 'bg-white/20'}`}
          />
        ))}
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-[280px] grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="flex h-16 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black backdrop-blur transition active:scale-90 active:bg-grape"
          >
            {show ? d : '•'}
          </button>
        ))}
        <button onClick={() => setShow(!show)} className="flex h-16 items-center justify-center rounded-3xl bg-white/10 transition active:scale-90" aria-label="Показать цифры">
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <button onClick={() => press('0')} className="flex h-16 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black transition active:scale-90 active:bg-grape">
          {show ? '0' : '•'}
        </button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="flex h-16 items-center justify-center rounded-3xl bg-white/10 transition active:scale-90" aria-label="Стереть">
          <Delete size={20} />
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { to: '/parent/overview', label: 'Обзор' },
  { to: '/parent/quests', label: 'Задания' },
  { to: '/parent/rewards', label: 'Награды' },
  { to: '/parent/finance', label: 'Финансы' },
  { to: '/parent/settings', label: 'Настройки' },
];

function ParentShell() {
  const navigate = useNavigate();

  // Выход из родительской панели: возврат к Соне + закрытие родительского доступа.
  // После этого снова открыть панель можно только по PIN-коду.
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-1 flex-col bg-[#EFEAFB]">
      <header className="border-b border-grape/10 bg-white px-4 pb-0 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={logout} className="rounded-full bg-ink/5 p-1.5 text-ink/60" aria-label="Вернуться к Соне">
              <ArrowLeft size={16} />
            </button>
            <p className="text-lg font-black text-ink">Родительская панель</p>
          </div>
          <button onClick={logout} className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-bold text-ink/50 active:bg-ink/10">
            Выйти
          </button>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <NavItem key={t.to} {...t} />
          ))}
        </nav>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-grape border-t-transparent" />
            </div>
          }
        >
          <Routes>
            <Route path="overview" element={<Overview />} />
            <Route path="quests" element={<Quests />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="finance" element={<Finance />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/parent/overview" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `shrink-0 rounded-t-xl border-b-2 px-3 py-2 text-sm font-bold transition ${
          isActive ? 'border-grape text-grape' : 'border-transparent text-ink/40'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
