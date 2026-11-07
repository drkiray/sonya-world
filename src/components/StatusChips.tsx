import { Coins, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppContext';
import { useOnline } from '../services/online';
import { isCloudMode } from '../services/cloud';

export function CoinChip() {
  const state = useAppState();
  return (
    <Link
      to="/profile"
      className="flex items-center gap-1.5 rounded-full bg-night/80 py-1.5 pl-3 pr-4 font-black text-sun backdrop-blur transition active:scale-95"
    >
      <Coins size={16} />
      {state.profile.coins}
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
