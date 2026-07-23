import { useEffect, useState } from 'react';
import type { SessionState } from '../types';

interface Props {
  session: SessionState;
  onDone: () => void;
}

export default function CoinTossOverlay({ session, onDone }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setRevealed(true), 1600);
    const t2 = window.setTimeout(() => onDone(), 3400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const winner = session.teams.find((t) => t.id === session.coinTossResult);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-8">
      <div className="[perspective:800px]">
        <div className="animate-coin-flip h-28 w-28 rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 border-4 border-amber-300 shadow-2xl flex items-center justify-center text-4xl">
          🍺
        </div>
      </div>
      {revealed && winner && (
        <div className="animate-pop-in text-center">
          <p className="text-purple-300 mb-1">Münzwurf-Ergebnis</p>
          <h2 className="text-3xl font-extrabold text-amber-300">{winner.name} beginnt!</h2>
        </div>
      )}
    </div>
  );
}
