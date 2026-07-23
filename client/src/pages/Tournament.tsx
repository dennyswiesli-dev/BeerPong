import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTournament, listTournaments } from '../lib/tournamentApi';
import type { Tournament as TournamentType } from '../types';

export default function Tournament() {
  const [name, setName] = useState('Bierpong-Turnier');
  const [teamInput, setTeamInput] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    listTournaments().then(setTournaments);
  }, []);

  function addTeam() {
    const trimmed = teamInput.trim();
    if (!trimmed || teams.includes(trimmed)) return;
    setTeams((prev) => [...prev, trimmed]);
    setTeamInput('');
  }

  function removeTeam(t: string) {
    setTeams((prev) => prev.filter((x) => x !== t));
  }

  async function handleCreate() {
    if (teams.length < 2) return;
    setCreating(true);
    try {
      const t = await createTournament(name.trim() || 'Turnier', teams);
      navigate(`/tournament/${t.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-svh px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black italic">
          <span className="text-sky-400">🥇</span> Turnier
        </h1>
        <Link to="/" className="text-white/50 hover:text-white text-sm">← Zurück</Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <h2 className="font-semibold mb-3">Neues Turnier erstellen</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Turniername"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-sky-400"
        />

        <div className="flex gap-2 mb-3">
          <input
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            placeholder="Team- oder Spielername"
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-sky-400 text-sm"
          />
          <button onClick={addTeam} className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-semibold">
            + Team
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {teams.map((t) => (
            <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm">
              {t}
              <button onClick={() => removeTeam(t)} className="text-white/40 hover:text-white">
                ✕
              </button>
            </span>
          ))}
          {teams.length === 0 && <p className="text-white/40 text-sm italic">Noch keine Teams hinzugefügt</p>}
        </div>

        <button
          onClick={handleCreate}
          disabled={teams.length < 2 || creating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-red-600 text-white font-bold disabled:opacity-40"
        >
          {creating ? 'Erstelle Turnier...' : `Turnierbaum erstellen (${teams.length} Teams)`}
        </button>
      </div>

      {tournaments.length > 0 && (
        <>
          <h2 className="font-semibold mb-3">Bisherige Turniere</h2>
          <ul className="space-y-2">
            {tournaments.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/tournament/${t.id}`}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition"
                >
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-xs text-white/50">{t.teams.length} Teams</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
