import { useEffect, useState } from 'react';
import * as sessionApi from '../lib/sessionApi';
import * as leaderboardApi from '../lib/leaderboardApi';
import { formationOptions } from '../lib/formations';
import { teamPalette } from '../lib/teamColors';
import { CupBoard } from './CupBoard';
import type { SessionState, Team } from '../types';

interface Props {
  session: SessionState;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function MatchTimer({ startedAt }: { startedAt: number | null }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const interval = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;
  return <span className="font-mono text-white/50 text-sm">⏱ {formatElapsed(Date.now() - startedAt)}</span>;
}

export default function GameBoard({ session }: Props) {
  const [shooters, setShooters] = useState<Record<string, string>>({});
  const [formationPickerFor, setFormationPickerFor] = useState<string | null>(null);

  function shooterFor(targetTeam: Team, opponent: Team | undefined): string {
    return shooters[targetTeam.id] || opponent?.players[0] || '';
  }

  async function handleCupClick(targetTeam: Team, opponent: Team | undefined, cupId: string) {
    const shooter = shooterFor(targetTeam, opponent);
    const next = await sessionApi.hitCup(session.id, targetTeam.id, cupId, shooter || undefined);
    if (!next) return;
    if (shooter) await leaderboardApi.recordShot(shooter, true);
    if (next.status === 'finished' && next.winnerTeamId) {
      const winner = next.teams.find((t) => t.id === next.winnerTeamId);
      const loser = next.teams.find((t) => t.id !== next.winnerTeamId);
      if (winner && loser) await leaderboardApi.recordGameResult(winner.players, loser.players);
    }
  }

  function applyFormation(teamId: string, rows: number[]) {
    sessionApi.reformCups(session.id, teamId, rows);
    setFormationPickerFor(null);
  }

  function handleUndo() {
    sessionApi.undoLast(session.id);
  }

  const remaining = (team: Team) => team.cups.filter((c) => !c.hit).length;

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <MatchTimer startedAt={session.startedAt} />
        <button
          onClick={handleUndo}
          disabled={!session.previousState}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
        >
          ↩️ Rückgängig
        </button>
      </div>

      {session.specialRule && (
        <div className="text-center py-2 px-4">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs">
            🎲 Sonderregel: {session.specialRule}
          </span>
        </div>
      )}

      {session.streak.count >= 2 && (
        <div className="text-center py-2 animate-pop-in">
          <span className="inline-block px-4 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-200 text-sm font-semibold">
            🔥 {session.teams.find((t) => t.id === session.streak.teamId)?.name} — {session.streak.count} in Folge!
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2">
        {session.teams.map((team) => {
          const palette = teamPalette[team.color];
          const opponent = session.teams.find((t) => t.id !== team.id);
          const left = remaining(team);
          const options = formationOptions(left);

          return (
            <div key={team.id} className={`${palette.panelBg} px-4 py-6 min-h-[50vh] flex flex-col items-center`}>
              <h3 className={`font-black italic text-xl tracking-tight ${palette.text} mb-1`}>
                {team.icon} {team.name}
              </h3>
              <p className="text-xs text-white/50 mb-2">{team.players.join(', ') || '—'}</p>

              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Becher übrig</p>
              <p className={`text-6xl font-black ${palette.text} mb-2`}>{left}</p>
              <p className="text-xs text-white/40 mb-2">Getroffen: {team.score}</p>

              <CupBoard
                cups={team.cups}
                rows={team.formationRows}
                interactive={session.status === 'playing'}
                teamColor={team.color}
                onCupClick={(cupId) => handleCupClick(team, opponent, cupId)}
              />

              {session.status === 'playing' && (opponent?.players.length ?? 0) > 0 && (
                <div className="flex items-center gap-2 mt-2 w-full max-w-xs justify-center">
                  <label className="text-xs text-white/40">Wirft:</label>
                  <select
                    value={shooterFor(team, opponent)}
                    onChange={(e) => setShooters((prev) => ({ ...prev, [team.id]: e.target.value }))}
                    className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs outline-none"
                  >
                    {opponent?.players.map((p) => (
                      <option key={p} value={p} className="text-black">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formationPickerFor === team.id ? (
                <div className="w-full max-w-xs mt-2 bg-black/30 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-white/60 text-center">Neue Formation wählen ({left} Becher)</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => applyFormation(team.id, opt.rows)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
                      >
                        {opt.label} ({opt.rows.join('-')})
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setFormationPickerFor(null)}
                    className="w-full text-xs text-white/40 hover:text-white/70"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFormationPickerFor(team.id)}
                  disabled={team.reformationUsed || left <= 2 || session.status !== 'playing'}
                  className="w-full max-w-xs mt-2 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  🔺 Becher neu formieren {team.reformationUsed ? '(benutzt)' : ''}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto mt-4 max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3 mx-4 text-sm text-purple-300 space-y-1">
        {session.log.map((entry) => (
          <p key={entry.id}>{entry.message}</p>
        ))}
      </div>
    </div>
  );
}
