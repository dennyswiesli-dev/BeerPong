import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLeaderboard } from '../lib/leaderboardApi';
import { getHeadToHead, getPlayerMatches, type HeadToHeadResult } from '../lib/matchApi';
import type { MatchRecord, PlayerStats } from '../types';

export default function PlayerDetail() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name ?? '');
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<string[]>([]);
  const [opponent, setOpponent] = useState('');
  const [h2h, setH2h] = useState<HeadToHeadResult | null>(null);

  useEffect(() => {
    if (!decodedName) return;
    setLoading(true);
    Promise.all([getLeaderboard(), getPlayerMatches(decodedName)]).then(([players, ms]) => {
      setStats(players.find((p) => p.name.toLowerCase() === decodedName.toLowerCase()) ?? null);
      setRoster(players.map((p) => p.name).filter((n) => n.toLowerCase() !== decodedName.toLowerCase()));
      setMatches(ms);
      setLoading(false);
    });
  }, [decodedName]);

  async function compare() {
    if (!opponent) return;
    setH2h(await getHeadToHead(decodedName, opponent));
  }

  return (
    <div className="min-h-svh px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black italic">{decodedName}</h1>
        <Link to="/leaderboard" className="text-white/50 hover:text-white text-sm">← Leaderboard</Link>
      </div>

      {loading && <p className="text-white/50">Lade...</p>}

      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40">Siege</p>
            <p className="text-xl font-bold text-sky-400">{stats.wins}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40">Niederlagen</p>
            <p className="text-xl font-bold text-red-400">{stats.losses}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40">Treffer</p>
            <p className="text-xl font-bold">{stats.cupsHit}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40">Rekordserie</p>
            <p className="text-xl font-bold">🔥 {stats.bestStreak}</p>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <h2 className="font-semibold mb-3">⚔️ Head-to-Head</h2>
        <div className="flex gap-2 mb-3">
          <select
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm outline-none"
          >
            <option value="" className="text-black">Gegner wählen…</option>
            {roster.map((n) => (
              <option key={n} value={n} className="text-black">
                {n}
              </option>
            ))}
          </select>
          <button
            onClick={compare}
            disabled={!opponent}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-red-600 text-white text-sm font-semibold disabled:opacity-40"
          >
            Vergleichen
          </button>
        </div>
        {h2h && (
          <p className="text-sm text-white/80">
            {h2h.matches.length === 0
              ? `${decodedName} und ${opponent} standen sich noch nie in gegnerischen Teams gegenüber.`
              : `${decodedName} ${h2h.aWins} : ${h2h.bWins} ${opponent} (${h2h.matches.length} Spiele als Gegner)`}
          </p>
        )}
      </div>

      <h2 className="font-semibold mb-3">📜 Letzte Spiele</h2>
      {!loading && matches.length === 0 && <p className="text-white/50 text-sm">Noch keine Spiele erfasst.</p>}
      <ul className="space-y-2">
        {matches.slice(0, 20).map((m) => {
          const teamIdx = m.teams.findIndex((t) => t.players.some((p) => p.toLowerCase() === decodedName.toLowerCase()));
          const won = teamIdx === m.winnerTeamIndex;
          return (
            <li
              key={m.id}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                won ? 'bg-sky-500/10 border-sky-500/30' : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <span className="text-sm">
                {m.teams[0].name} {m.teams[0].score} : {m.teams[1].score} {m.teams[1].name}
              </span>
              <span className={`text-xs font-bold ${won ? 'text-sky-400' : 'text-red-400'}`}>
                {won ? 'Sieg' : 'Niederlage'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
