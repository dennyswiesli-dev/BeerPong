import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addPlayer, getSession } from '../lib/sessionApi';
import { teamPalette } from '../lib/teamColors';
import type { SessionState } from '../types';

export default function JoinSession() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionState | null>(null);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getSession(id)
      .then((s) => (s ? setSession(s) : setError('Dieses Match existiert nicht (mehr).')))
      .catch(() => setError('Dieses Match existiert nicht (mehr).'));
  }, [id]);

  async function join() {
    if (!id || !teamId || !name.trim()) return;
    await addPlayer(id, teamId, name.trim());
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
        <p className="text-purple-200">Lade Match...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-6xl mb-4">🏓</div>
      <h1 className="text-3xl font-bold mb-6">Match beitreten</h1>

      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <label className="block text-sm text-purple-300 mb-2 text-left">Dein Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Max"
          className="w-full mb-5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-amber-400"
        />

        <p className="text-sm text-purple-300 mb-2 text-left">Team wählen</p>
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
                {t.name}
                <div className="text-xs opacity-70 font-normal mt-1">{t.players.join(', ') || 'noch niemand'}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={join}
          disabled={!teamId || !name.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 text-purple-950 font-bold shadow-lg disabled:opacity-40"
        >
          Beitreten
        </button>
      </div>
    </div>
  );
}
