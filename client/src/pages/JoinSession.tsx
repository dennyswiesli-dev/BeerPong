import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addPlayer, getSession } from '../lib/sessionApi';
import { getLeaderboard } from '../lib/leaderboardApi';
import { teamPalette } from '../lib/teamColors';
import type { SessionState } from '../types';

export default function JoinSession() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionState | null>(null);
  const [roster, setRoster] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    Promise.all([getSession(id), getLeaderboard()])
      .then(([s, players]) => {
        if (!s) return setError('Dieses Match existiert nicht (mehr).');
        setSession(s);
        setRoster(players.map((p) => p.name));
      })
      .catch(() => setError('Dieses Match existiert nicht (mehr).'));
  }, [id]);

  async function join() {
    if (!id || !teamId || !name) return;
    await addPlayer(id, teamId, name);
    navigate(`/session/${id}`);
  }

  if (error) {
    return (
      <div className="min-h-svh flex items-center justify-center text-center px-6">
        <p className="text-lg text-red-300">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p className="text-white/60">Lade Match...</p>
      </div>
    );
  }

  const assigned = new Set([...session.teams[0].players, ...session.teams[1].players]);
  const available = roster.filter((n) => !assigned.has(n));

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-6xl mb-4">🏓</div>
      <h1 className="text-3xl font-bold mb-6">Match beitreten</h1>

      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <label className="block text-sm text-white/60 mb-2 text-left">Dein Name</label>
        {available.length > 0 ? (
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-sky-400"
          >
            <option value="" className="text-black">Bitte wählen…</option>
            {available.map((n) => (
              <option key={n} value={n} className="text-black">
                {n}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-white/50 mb-5">
            Kein freier Spieler erfasst.{' '}
            <Link to="/players" className="text-sky-400 underline underline-offset-4">
              Erst hier anlegen
            </Link>
            .
          </p>
        )}

        <p className="text-sm text-white/60 mb-2 text-left">Team wählen</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {session.teams.map((t) => {
            const palette = teamPalette[t.color];
            return (
              <button
                key={t.id}
                onClick={() => setTeamId(t.id)}
                className={`px-3 py-3 rounded-xl font-semibold border transition ${
                  teamId === t.id
                    ? `${palette.accentBg} ${palette.accentText} border-transparent`
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                {t.icon} {t.name}
                <div className="text-xs opacity-70 font-normal mt-1">{t.players.join(', ') || 'noch niemand'}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={join}
          disabled={!teamId || !name}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-red-600 text-white font-bold shadow-lg disabled:opacity-40"
        >
          Beitreten
        </button>
      </div>
    </div>
  );
}
