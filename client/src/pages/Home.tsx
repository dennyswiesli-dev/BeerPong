import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createSession } from '../lib/sessionApi';
import type { BoardLayout } from '../types';

export default function Home() {
  const [layout, setLayout] = useState<BoardLayout>(10);
  const [singleDevice, setSingleDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCreate() {
    setLoading(true);
    try {
      const session = await createSession(layout, singleDevice);
      navigate(`/session/${session.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="animate-float-slow text-7xl mb-4">🍺</div>
      <h1 className="text-4xl sm:text-5xl font-black italic tracking-tight mb-2">
        <span className="text-sky-400">Beer</span> <span className="text-white">Pong</span>{' '}
        <span className="text-red-500">Arena</span>
      </h1>
      <p className="text-white/60 mb-10 max-w-md">
        Erstelle ein neues Match, lade dein Team per QR-Code ein und tracke jeden Treffer live auf allen Geräten.
      </p>

      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <h2 className="text-lg font-semibold mb-3">Spielbrett</h2>
        <div className="flex gap-3 justify-center mb-6">
          {[10, 6].map((n) => (
            <button
              key={n}
              onClick={() => setLayout(n as BoardLayout)}
              className={`px-5 py-2 rounded-xl font-semibold transition ${
                layout === n
                  ? 'bg-gradient-to-r from-sky-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {n} Becher
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 justify-center mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={singleDevice}
            onChange={(e) => setSingleDevice(e.target.checked)}
            className="h-5 w-5 accent-red-500"
          />
          <span className="text-sm text-white/80">Ein Gerät für beide Teams</span>
        </label>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-red-600 text-white font-bold text-lg shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
        >
          {loading ? 'Erstelle Match...' : 'Neues Match starten 🎉'}
        </button>
      </div>

      <div className="mt-8 flex items-center gap-6 text-sm">
        <Link to="/leaderboard" className="text-white/60 hover:text-sky-400 underline underline-offset-4">
          🏆 Leaderboard
        </Link>
        <Link to="/players" className="text-white/60 hover:text-red-500 underline underline-offset-4">
          👥 Spieler verwalten
        </Link>
      </div>
    </div>
  );
}
