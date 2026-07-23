import { useState } from 'react';
import * as sessionApi from '../lib/sessionApi';
import * as leaderboardApi from '../lib/leaderboardApi';
import { formationOptions } from '../lib/formations';
import { teamPalette } from '../lib/teamColors';
import { CupBoard } from './CupBoard';
import type { SessionState, Team } from '../types';

interface Props {
  session: SessionState;
}

export default function GameBoard({ session }: Props) {
  const [shooter, setShooter] = useState<string>('');
  const [formationPickerFor, setFormationPickerFor] = useState<string | null>(null);
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

  function applyFormation(teamId: string, rows: number[]) {
    sessionApi.reformCups(session.id, teamId, rows);
    setFormationPickerFor(null);
  }

  const remaining = (team: Team) => team.cups.filter((c) => !c.hit).length;

  return (
    <div>
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
          const isCurrentTarget = currentTeam && team.id !== currentTeam.id;
          const left = remaining(team);
          const options = formationOptions(left);

          return (
            <div key={team.id} className={`${palette.panelBg} px-4 py-6 min-h-[50vh] flex flex-col items-center`}>
              <div className="flex items-center justify-between w-full max-w-xs mb-1">
                <h3 className={`font-black italic text-xl tracking-tight ${palette.text}`}>{team.name}</h3>
                {isCurrentTarget && <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 animate-pulse">Am Zug</span>}
              </div>
              <p className="text-xs text-white/50 mb-2">{team.players.join(', ') || '—'}</p>

              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Becher übrig</p>
              <p className={`text-6xl font-black ${palette.text} mb-2`}>{left}</p>
              <p className="text-xs text-white/40 mb-2">Getroffen: {team.score}</p>

              <CupBoard
                cups={team.cups}
                rows={team.formationRows}
                interactive={session.status === 'playing'}
                teamColor={team.color}
                onCupClick={(cupId) => handleCupClick(team.id, cupId)}
              />

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

      {session.status === 'playing' && currentTeam && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/5 border-t border-white/10 p-4">
          <p className="text-sm text-purple-200">
            Am Zug: <span className={`font-bold ${teamPalette[currentTeam.color].text}`}>{currentTeam.name}</span>
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
        </div>
      )}

      <div className="max-w-5xl mx-auto mt-4 max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3 mx-4 text-sm text-purple-300 space-y-1">
        {session.log.map((entry) => (
          <p key={entry.id}>{entry.message}</p>
        ))}
      </div>
    </div>
  );
}
