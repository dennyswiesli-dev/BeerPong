import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import * as sessionApi from '../lib/sessionApi';
import { getLeaderboard } from '../lib/leaderboardApi';
import { teamPalette } from '../lib/teamColors';
import { randomSpecialRule } from '../lib/specialRules';
import type { BoardLayout, SessionState } from '../types';

interface Props {
  session: SessionState;
}

const TEAM_ICONS = ['🔵', '🔴', '🍺', '🍻', '🏆', '🔥', '⚡', '💀', '🐺', '🦅', '🎯', '👑'];

export default function Lobby({ session }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [roster, setRoster] = useState<string[]>([]);
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const joinUrl = `${window.location.origin}${window.location.pathname}#/join/${session.id}`;

  useEffect(() => {
    getLeaderboard().then((players) => setRoster(players.map((p) => p.name)));
  }, []);

  const assigned = new Set([...session.teams[0].players, ...session.teams[1].players]);
  const available = roster.filter((n) => !assigned.has(n));

  function addPlayer(teamId: string) {
    const name = selected[teamId];
    if (!name) return;
    sessionApi.addPlayer(session.id, teamId, name);
    setSelected((prev) => ({ ...prev, [teamId]: '' }));
  }

  function renameTeam(teamId: string, name: string) {
    sessionApi.renameTeam(session.id, teamId, name);
  }

  function setLayout(layout: BoardLayout) {
    sessionApi.setLayout(session.id, layout);
  }

  function pickIcon(teamId: string, icon: string) {
    sessionApi.setTeamIcon(session.id, teamId, icon);
    setIconPickerFor(null);
  }

  function shuffleTeams() {
    sessionApi.shuffleTeams(session.id);
  }

  function drawSpecialRule() {
    sessionApi.setSpecialRule(session.id, randomSpecialRule());
  }

  const canStart = session.teams.every((t) => t.players.length > 0 || session.singleDeviceMode);
  const totalPlayers = session.teams[0].players.length + session.teams[1].players.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-bold text-center mb-1">Lobby</h1>
      <p className="text-center text-white/50 mb-8">
        Match-Code: <span className="font-mono text-sky-400">{session.id}</span>
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-4">
        {session.teams.map((team) => (
          <div key={team.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIconPickerFor(iconPickerFor === team.id ? null : team.id)}
                className="text-2xl hover:scale-110 transition"
                title="Icon wählen"
              >
                {team.icon}
              </button>
              <input
                defaultValue={team.name}
                onBlur={(e) => renameTeam(team.id, e.target.value || team.name)}
                className={`flex-1 text-xl font-black italic bg-transparent outline-none ${teamPalette[team.color].text}`}
              />
            </div>

            {iconPickerFor === team.id && (
              <div className="flex flex-wrap gap-2 mb-3 bg-black/30 rounded-lg p-2">
                {TEAM_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => pickIcon(team.id, icon)}
                    className="text-xl p-1 rounded hover:bg-white/10"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}

            <ul className="space-y-1 mb-4 min-h-8">
              {team.players.map((p) => (
                <li key={p} className="text-white/80 text-sm">🙋 {p}</li>
              ))}
              {team.players.length === 0 && <li className="text-white/40 text-sm italic">Noch keine Spieler</li>}
            </ul>
            <div className="flex gap-2">
              <select
                value={selected[team.id] ?? ''}
                onChange={(e) => setSelected((prev) => ({ ...prev, [team.id]: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-sky-400 text-sm"
              >
                <option value="" className="text-black">Spieler wählen…</option>
                {available.map((n) => (
                  <option key={n} value={n} className="text-black">
                    {n}
                  </option>
                ))}
              </select>
              <button
                onClick={() => addPlayer(team.id)}
                disabled={!selected[team.id]}
                className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-semibold disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {roster.length === 0 && (
        <p className="text-center text-white/50 text-sm mb-6">
          Noch keine Spieler erfasst.{' '}
          <Link to="/players" className="text-sky-400 underline underline-offset-4">
            Jetzt Spieler anlegen
          </Link>
        </p>
      )}
      {roster.length > 0 && available.length === 0 && totalPlayers < roster.length && (
        <p className="text-center text-white/40 text-sm mb-6">Alle erfassten Spieler sind bereits einem Team zugeteilt.</p>
      )}

      {totalPlayers >= 2 && (
        <div className="text-center mb-8">
          <button onClick={shuffleTeams} className="text-xs text-white/50 hover:text-white underline underline-offset-4">
            🎲 Teams zufällig neu mischen
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <div>
          <h2 className="font-semibold mb-2">Spielbrett</h2>
          <div className="flex gap-2">
            {[10, 6].map((n) => (
              <button
                key={n}
                onClick={() => setLayout(n as BoardLayout)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  session.layout === n
                    ? 'bg-gradient-to-r from-sky-500 to-red-600 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {n} Becher
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-white/50 mb-2">Per QR beitreten</p>
          <div className="bg-white p-2 rounded-lg inline-block">
            <QRCodeSVG value={joinUrl} size={110} />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">🎲 Sonderregel (optional)</h2>
          <button onClick={drawSpecialRule} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">
            Auslosen
          </button>
        </div>
        {session.specialRule ? (
          <p className="text-sm text-white/70">{session.specialRule}</p>
        ) : (
          <p className="text-sm text-white/40 italic">Keine aktiv</p>
        )}
      </div>

      <div className="text-center">
        <button
          disabled={!canStart}
          onClick={() => sessionApi.coinToss(session.id)}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-red-600 text-white font-bold text-xl shadow-xl shadow-red-500/30 hover:scale-[1.03] active:scale-95 transition disabled:opacity-40"
        >
          🪙 Münze werfen &amp; Start
        </button>
        {!canStart && <p className="text-sm text-white/40 mt-2">Beide Teams brauchen mindestens einen Spieler.</p>}
      </div>
    </div>
  );
}
