import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSyncExternalStore } from 'react';
import { Star } from 'lucide-react';
import { fireConfetti } from '../components/Confetti';
import {
  ACHIEVEMENTS,
  EGG_XP,
  evaluateAchievements,
  evaluateHatching,
  getState,
  subscribe,
  type AppState,
} from '../services/store';
import { playSound, setSoundEnabled, installClickSound } from '../services/sound';
import type { AchievementDef } from '../types';

// ─── Глобальное состояние + тосты + очередь достижений ─────────────────────

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState);
}

export interface Toast {
  id: number;
  kind: 'info' | 'success' | 'error';
  text: string;
}

interface AppUi {
  toasts: Toast[];
  toast: (text: string, kind?: Toast['kind']) => void;
  achievementQueue: AchievementDef[];
  dismissAchievement: () => void;
}

const UiContext = createContext<AppUi | null>(null);

let toastSeq = 1;
const shownAchievements = new Set<string>();

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [achievementQueue, setAchievementQueue] = useState<AchievementDef[]>([]);
  const prevLevel = useRef(state.profile.level);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  // null = приложение только загрузило накопленные достижения — не считаем их новыми
  const prevAchCount = useRef<number | null>(null);

  const toast = useCallback((text: string, kind: Toast['kind'] = 'info') => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, kind, text }]);
    if (kind === 'error') playSound('error');
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Звук: синхронизация с настройкой + звук кликов по кнопкам
  useEffect(() => {
    setSoundEnabled(state.profile.soundEnabled);
  }, [state.profile.soundEnabled]);

  useEffect(() => {
    installClickSound();
  }, []);

  // Вылупление яиц: проверяем созревшие яйца при старте и каждые 5 секунд
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (!alive || !getState().ready) return;
      const hatched = await evaluateHatching();
      if (alive && hatched.length > 0) {
        fireConfetti();
        for (const pet of hatched) {
          toast(`Яйцо вылупилось! Это ${pet.name}! +${EGG_XP[pet.rarity]} опыта`, 'success');
        }
      }
    };
    const t = setInterval(tick, 5000);
    void tick();
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Отслеживаем новые достижения → показываем анимацию-поздравление
  useEffect(() => {
    if (prevAchCount.current === null) {
      prevAchCount.current = state.achievements.length;
      return;
    }
    if (state.achievements.length > prevAchCount.current) {
      const fresh = state.achievements.slice(prevAchCount.current);
      const defs = fresh
        .map((a) => ACHIEVEMENTS.find((d) => d.id === a.achievementId))
        .filter((d): d is AchievementDef => Boolean(d))
        .filter((d) => !shownAchievements.has(d.id));
      defs.forEach((d) => shownAchievements.add(d.id));
      if (defs.length) {
        setAchievementQueue((q) => [...q, ...defs]);
        fireConfetti();
      }
    }
    prevAchCount.current = state.achievements.length;
  }, [state.achievements]);

  // Отслеживаем повышение уровня
  useEffect(() => {
    if (state.profile.level > prevLevel.current) {
      setLevelUp(state.profile.level);
      fireConfetti(2000);
      playSound('levelup');
    }
    prevLevel.current = state.profile.level;
  }, [state.profile.level]);

  // Первая проверка достижений после загрузки
  useEffect(() => {
    if (state.ready) evaluateAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready]);

  const value = useMemo<AppUi>(
    () => ({
      toasts,
      toast,
      achievementQueue,
      dismissAchievement: () => setAchievementQueue((q) => q.slice(1)),
      // eslint-disable-next-line
    }),
    [toasts, toast, achievementQueue],
  );

  const currentAchievement = achievementQueue[0];

  return (
    <UiContext.Provider value={value}>
      {children}
      {/* Тосты */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex w-full max-w-sm flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'w-full animate-popIn rounded-2xl px-4 py-2.5 text-center text-sm font-bold text-white shadow-pop ' +
              (t.kind === 'success' ? 'bg-green-500' : t.kind === 'error' ? 'bg-red-500' : 'bg-night/90')
            }
          >
            {t.text}
          </div>
        ))}
      </div>
      {/* Поздравление с достижением */}
      {currentAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-6" onClick={value.dismissAchievement}>
          <div className="w-full max-w-xs animate-popIn rounded-3xl bg-white p-6 text-center shadow-pop">
            <div className="mx-auto mb-3 flex h-20 w-20 animate-floaty items-center justify-center rounded-full bg-gradient-to-br from-sun to-rosa">
              <Star size={40} className="fill-white text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-grape">Достижение открыто!</p>
            <p className="mt-1 text-2xl font-black text-ink">{currentAchievement.title}</p>
            <p className="mt-1 text-sm font-semibold text-ink/60">{currentAchievement.description}</p>
            <button onClick={value.dismissAchievement} className="mt-4 w-full rounded-2xl bg-grape py-3 font-black text-white">
              Супер!
            </button>
          </div>
        </div>
      )}
      {levelUp !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-6"
          onClick={() => setLevelUp(null)}
        >
          <div className="w-full max-w-xs animate-popIn rounded-3xl bg-gradient-to-b from-sun to-[#FFB84C] p-6 text-center shadow-pop">
            <p className="text-sm font-black uppercase tracking-widest text-night/60">Новый уровень!</p>
            <p className="my-2 text-5xl font-black text-night">{levelUp}</p>
            <p className="font-bold text-night/80">Соня стала коллекционером уровня {levelUp}!</p>
            <button
              onClick={() => setLevelUp(null)}
              className="mt-4 w-full rounded-2xl bg-night py-3 font-black text-sun"
            >
              Ура!
            </button>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
}

export function useUi(): AppUi {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi вне AppProvider');
  return ctx;
}
