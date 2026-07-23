import { useEffect, useState } from 'react';
import { teamPalette } from '../lib/teamColors';
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
  }, [session.coinTossId]);

  const winner = session.teams.find((t) => t.id === session.coinTossResult);
  const loser = session.teams.find((t) => t.id !== session.coinTossResult);
  const winnerPalette = winner ? teamPalette[winner.color] : null;
  const loserPalette = loser ? teamPalette[loser.color] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-8">
      <div className="[perspective:800px]">
        <div className="relative h-28 w-28 animate-coin-flip [transform-style:preserve-3d]">
          <div
            className={`absolute inset-0 rounded-full border-4 border-white/30 flex items-center justify-center text-3xl font-black text-white [backface-visibility:hidden] ${
              winnerPalette?.accentBg ?? 'bg-sky-500'
            }`}
          >
            {winnerPalette?.label[0] ?? 'B'}
          </div>
          <div
            className={`absolute inset-0 rounded-full border-4 border-white/30 flex items-center justify-center text-3xl font-black text-white [backface-visibility:hidden] [transform:rotateY(180deg)] ${
              loserPalette?.accentBg ?? 'bg-red-500'
            }`}
          >
            {loserPalette?.label[0] ?? 'R'}
          </div>
        </div>
      </div>
      {revealed && winner && winnerPalette && (
        <div className="animate-pop-in text-center">
          <p className="text-purple-300 mb-1">Münzwurf-Ergebnis</p>
          <h2 className={`text-3xl font-black italic ${winnerPalette.text}`}>{winner.name} beginnt!</h2>
        </div>
      )}
    </div>
  );
}
