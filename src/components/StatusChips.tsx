import { useEffect, useRef, useState } from 'react';
import { Coins, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppContext';
import { useOnline } from '../services/online';
import { isCloudMode } from '../services/cloud';

export function CoinChip() {
  const state = useAppState();
  const coins = state.profile.coins;
  const [gain, setGain] = useState<{ amount: number; key: number } | null>(null);
  const prev = useRef(coins);
  const seq = useRef(0);

  useEffect(() => {
    if (coins > prev.current) {
      seq.current += 1;
      setGain({ amount: coins - prev.current, key: seq.current });
      const t = setTimeout(() => setGain(null), 1700);
      prev.current = coins;
      return () => clearTimeout(t);
    }
    prev.current = coins;
  }, [coins]);

  return (
    <Link
      to="/profile"
      className="relative flex items-center gap-1.5 rounded-full bg-night/80 py-1.5 pl-3 pr-4 font-black text-sun backdrop-blur transition active:scale-95"
    >
      <Coins size={16} />
      {coins}
      {gain && (
        <span key={gain.key} className="coin-gain">
          +{gain.amount}
        </span>
      )}
    </Link>
  );
}

export function OnlineChip() {
  const online = useOnline();
  const cloud = isCloudMode();
  return (
    <span
      className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold text-white backdrop-blur"
      title={cloud ? (online ? 'Онлайн, облачная синхронизация' : 'Офлайн, изменения сохранятся локально') : 'Локальный режим'}
    >
      {online ? <Wifi size={11} /> : <WifiOff size={11} />}
      {cloud ? (online ? 'Онлайн' : 'Офлайн') : 'Локально'}
    </span>
  );
}
