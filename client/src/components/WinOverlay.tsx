import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { rematch, resetGame } from '../lib/sessionApi';
import { recordMatch } from '../lib/matchApi';
import { recordStreak } from '../lib/leaderboardApi';
import { playWinSound } from '../lib/sound';
import type { SessionState } from '../types';

interface Props {
  session: SessionState;
  winnerName: string;
  onClose: () => void;
}

const mvpEntry = (session: SessionState) =>
  Object.entries(session.matchStats).sort((a, b) => b[1] - a[1])[0] as [string, number] | undefined;

export default function WinOverlay({ session, winnerName, onClose }: Props) {
  useEffect(() => {
    playWinSound();
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors: ['#3b82f6', '#ef4444', '#ffffff'] });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors: ['#3b82f6', '#ef4444', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    recordMatch(session);
    if (session.playerStreak.name && session.playerStreak.best > 0) {
      recordStreak(session.playerStreak.name, session.playerStreak.best);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRematch() {
    rematch(session.id);
    onClose();
  }

  function handleBackToLobby() {
    resetGame(session.id);
    onClose();
  }

  const mvp = mvpEntry(session);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl animate-pop-in">🏆</div>
      <h2 className="text-4xl font-extrabold text-white animate-pop-in">
        {winnerName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-red-500">gewinnt!</span>
      </h2>
      <p className="text-white/60">Glückwunsch – Zeit für die Siegerrunde 🍺</p>

      {mvp && (
        <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3">
          <p className="text-xs uppercase tracking-widest text-white/40">Spieler des Spiels</p>
          <p className="text-lg font-bold text-amber-300">🌟 {mvp[0]} ({mvp[1]} Treffer)</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={handleRematch}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-red-600 text-white font-bold shadow-xl hover:scale-105 active:scale-95 transition"
        >
          🔁 Revanche
        </button>
        <button
          onClick={handleBackToLobby}
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
        >
          Zurück zur Lobby
        </button>
        <Link
          to="/leaderboard"
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
        >
          🏆 Leaderboard
        </Link>
      </div>
    </div>
  );
}
