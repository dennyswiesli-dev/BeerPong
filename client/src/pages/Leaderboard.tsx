import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../lib/leaderboardApi';
import type { PlayerStats } from '../types';

export default function Leaderboard() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-svh px-4 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black italic">
          <span className="text-sky-400">🏆</span> Leaderboard
        </h1>
        <Link to="/" className="text-white/50 hover:text-white text-sm">← Zurück</Link>
      </div>

      {loading && <p className="text-white/50">Lade Statistik...</p>}
      {!loading && players.length === 0 && <p className="text-white/50">Noch keine Spiele gespielt.</p>}

      {!loading && players.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-white/60">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Spieler</th>
                <th className="px-4 py-3">Siege</th>
                <th className="px-4 py-3">Niederlagen</th>
                <th className="px-4 py-3">Win-Rate</th>
                <th className="px-4 py-3">Becher getroffen</th>
                <th className="px-4 py-3">Trefferquote</th>
                <th className="px-4 py-3">Rekordserie</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => {
                const winRate = p.gamesPlayed ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
                const accuracy = p.shotsTaken ? Math.round((p.cupsHit / p.shotsTaken) * 100) : 0;
                return (
                  <tr key={p.name} className="odd:bg-white/5 hover:bg-white/10">
                    <td className="px-4 py-3 text-white/40">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">
                      <Link to={`/players/${encodeURIComponent(p.name)}`} className="hover:text-sky-400">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">{p.wins}</td>
                    <td className="px-4 py-3 text-center">{p.losses}</td>
                    <td className="px-4 py-3 text-center text-sky-400">{winRate}%</td>
                    <td className="px-4 py-3 text-center">{p.cupsHit}</td>
                    <td className="px-4 py-3 text-center">{accuracy}%</td>
                    <td className="px-4 py-3 text-center text-red-400">🔥 {p.bestStreak ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
