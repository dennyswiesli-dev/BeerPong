import { useState } from 'react';
import * as sessionApi from '../lib/sessionApi';
import * as leaderboardApi from '../lib/leaderboardApi';
import { CupBoard } from './CupBoard';
import type { SessionState } from '../types';

interface Props {
  session: SessionState;
}

export default function GameBoard({ session }: Props) {
  const [shooter, setShooter] = useState<string>('');
  const currentTeam = session.teams.find((t) => t.id === session.currentTeam);
  const shooterOptions = currentTeam?.players ?? [];
  const effectiveShooter = shooter || shooterOptions[0] || '';

  async function handleCupClick(targetTeamId: string, cupId: string) {
    const next = await sessionApi.hitCup(session.id, targetTeamId, cupId);
    if (!next) return;
    if (effectiveShooter) await leaderboardApi.recordShot(effectiveShooter, true);
    if (next.status === 'finished' && next.winnerTeamId) {
      const winner = next.teams.find((t) => t.id === next.winnerTeamId);
      const loser = next.teams.find((t) => t.id !== next.winnerTeamId);
      if (winner && loser) await leaderboardApi.recordGameResult(winner.players, loser.players);
    }
  }

  async function handleMiss() {
    if (!currentTeam) return;
    await sessionApi.missShot(session.id, currentTeam.id);
    if (effectiveShooter) await leaderboardApi.recordShot(effectiveShooter, false);
  }

  function handleReform(teamId: string) {
    sessionApi.reformCups(session.id, teamId);
  }

  const remaining = (teamIdx: number) => session.teams[teamIdx].cups.filter((c) => !c.hit).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {session.streak.count >= 2 && (
        <div className="text-center mb-4 animate-pop-in">
          <span className="inline-block px-4 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-200 text-sm font-semibold">
            🔥 {session.teams.find((t) => t.id === session.streak.teamId)?.name} — {session.streak.count} in Folge!
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {session.teams.map((team, idx) => {
          const isCurrentTarget = currentTeam && team.id !== currentTeam.id;
          return (
            <div
              key={team.id}
              className={`rounded-2xl border p-4 transition ${
                isCurrentTarget ? 'border-amber-400/60 bg-white/10 animate-glow-pulse' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-bold text-lg ${idx === 0 ? 'text-red-300' : 'text-amber-300'}`}>{team.name}</h3>
                <span className="text-sm text-purple-300">{remaining(idx)} Becher übrig</span>
              </div>
              <p className="text-xs text-purple-400 mb-1">{team.players.join(', ') || '—'}</p>
              <p className="text-xs text-purple-400 mb-2">Getroffen: {team.score}</p>

              <CupBoard
                cups={team.cups}
                interactive={session.status === 'playing'}
                teamColor={idx === 0 ? 'red' : 'yellow'}
                onCupClick={(cupId) => handleCupClick(team.id, cupId)}
              />

              <button
                onClick={() => handleReform(team.id)}
                disabled={team.reformationUsed || remaining(idx) <= 2 || session.status !== 'playing'}
                className="w-full mt-2 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                🔺 Becher neu formieren {team.reformationUsed ? '(benutzt)' : ''}
              </button>
            </div>
          );
        })}
      </div>

      {session.status === 'playing' && currentTeam && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-purple-200">
            Am Zug: <span className="font-bold text-amber-300">{currentTeam.name}</span>
          </p>
          {shooterOptions.length > 0 && (
            <select
              value={effectiveShooter}
              onChange={(e) => setShooter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm outline-none"
            >
              {shooterOptions.map((p) => (
                <option key={p} value={p} className="text-black">
                  {p}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleMiss}
            className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold"
          >
            ❌ Wurf daneben
          </button>
        </div>
      )}

      <div className="mt-6 max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-purple-300 space-y-1">
        {session.log.map((entry) => (
          <p key={entry.id}>{entry.message}</p>
        ))}
      </div>
    </div>
  );
}
