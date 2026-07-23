import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { resetGame } from '../lib/sessionApi';
import type { SessionState } from '../types';

interface Props {
  session: SessionState;
  winnerName: string;
  onClose: () => void;
}

export default function WinOverlay({ session, winnerName, onClose }: Props) {
  useEffect(() => {
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors: ['#facc15', '#f472b6', '#a855f7'] });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors: ['#facc15', '#f472b6', '#a855f7'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  function playAgain() {
    resetGame(session.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl animate-pop-in">🏆</div>
      <h2 className="text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pop-in">
        {winnerName} gewinnt!
      </h2>
      <p className="text-purple-200">Glückwunsch – Zeit für die Siegerrunde 🍺</p>
      <button
        onClick={playAgain}
        className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 text-purple-950 font-bold shadow-xl hover:scale-105 active:scale-95 transition"
      >
        Neues Spiel
      </button>
    </div>
  );
}
