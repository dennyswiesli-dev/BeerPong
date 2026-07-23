import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subscribeTournament, pickWinner } from '../lib/tournamentApi';
import { teamName, tournamentWinner } from '../lib/bracket';
import type { Tournament } from '../types';

export default function TournamentBracket() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (!id) return;
    return subscribeTournament(id, setTournament);
  }, [id]);

  if (!tournament) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p className="text-white/50">Lade Turnier...</p>
      </div>
    );
  }

  const rounds = Math.max(...tournament.matches.map((m) => m.round));
  const winner = tournamentWinner(tournament);

  return (
    <div className="min-h-svh px-4 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black italic">{tournament.name}</h1>
        <Link to="/tournament" className="text-white/50 hover:text-white text-sm">← Turniere</Link>
      </div>

      {winner && (
        <div className="text-center mb-10 animate-pop-in">
          <p className="text-xs uppercase tracking-widest text-white/40">Turniersieger</p>
          <p className="text-4xl font-black text-amber-300">🏆 {winner.name}</p>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-4">
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col justify-around gap-4 min-w-[220px]">
            <p className="text-xs uppercase tracking-widest text-white/40 text-center">
              {round === rounds ? 'Finale' : `Runde ${round}`}
            </p>
            {tournament.matches
              .filter((m) => m.round === round)
              .sort((a, b) => a.slot - b.slot)
              .map((m) => {
                const canPick = m.teamAId && m.teamBId && !m.winnerId;
                return (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {[m.teamAId, m.teamBId].map((teamId, idx) => (
                      <button
                        key={idx}
                        disabled={!canPick}
                        onClick={() => teamId && id && pickWinner(id, m.id, teamId)}
                        className={`w-full text-left px-3 py-2 text-sm transition ${
                          m.winnerId && teamId === m.winnerId
                            ? 'bg-sky-500/30 font-bold text-sky-300'
                            : m.winnerId
                              ? 'text-white/30'
                              : canPick
                                ? 'hover:bg-white/10 cursor-pointer'
                                : 'text-white/50'
                        }`}
                      >
                        {teamName(tournament, teamId)}
                      </button>
                    ))}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs mt-8 text-center">
        Tipp: Klicke im jeweiligen Match auf das gewinnende Team, um es in die nächste Runde zu befördern.
      </p>
    </div>
  );
}
