import { useEffect, useRef, useState } from 'react';
import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppContext';

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
