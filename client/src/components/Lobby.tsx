import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { socket } from '../lib/socket';
import type { BoardLayout, SessionState } from '../types';

interface Props {
  session: SessionState;
}

export default function Lobby({ session }: Props) {
  const [names, setNames] = useState<Record<string, string>>({});
  const joinUrl = `${window.location.origin}/join/${session.id}`;

  function addPlayer(teamId: string) {
    const name = names[teamId]?.trim();
    if (!name) return;
    socket.emit('addPlayer', { sessionId: session.id, teamId, name });
    setNames((prev) => ({ ...prev, [teamId]: '' }));
  }

  function renameTeam(teamId: string, name: string) {
    socket.emit('renameTeam', { sessionId: session.id, teamId, name });
  }

  function setLayout(layout: BoardLayout) {
    socket.emit('setLayout', { sessionId: session.id, layout });
  }

  const canStart = session.teams.every((t) => t.players.length > 0 || session.singleDeviceMode);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-bold text-center mb-1">Lobby</h1>
      <p className="text-center text-purple-300 mb-8">Match-Code: <span className="font-mono text-amber-300">{session.id}</span></p>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {session.teams.map((team, i) => (
          <div key={team.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <input
              defaultValue={team.name}
              onBlur={(e) => renameTeam(team.id, e.target.value || team.name)}
              className={`w-full text-xl font-bold bg-transparent outline-none mb-3 ${
                i === 0 ? 'text-red-300' : 'text-amber-300'
              }`}
            />
            <ul className="space-y-1 mb-4 min-h-8">
              {team.players.map((p) => (
                <li key={p} className="text-purple-100 text-sm">🙋 {p}</li>
              ))}
              {team.players.length === 0 && <li className="text-purple-400 text-sm italic">Noch keine Spieler</li>}
            </ul>
            <div className="flex gap-2">
              <input
                value={names[team.id] ?? ''}
                onChange={(e) => setNames((prev) => ({ ...prev, [team.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer(team.id)}
                placeholder="Name hinzufügen"
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:border-amber-400 text-sm"
              />
              <button
                onClick={() => addPlayer(team.id)}
                className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-semibold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <div>
          <h2 className="font-semibold mb-2">Spielbrett</h2>
          <div className="flex gap-2">
            {[10, 6].map((n) => (
              <button
                key={n}
                onClick={() => setLayout(n as BoardLayout)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  session.layout === n ? 'bg-amber-400 text-purple-950' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {n} Becher
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-purple-300 mb-2">Per QR beitreten</p>
          <div className="bg-white p-2 rounded-lg inline-block">
            <QRCodeSVG value={joinUrl} size={110} />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          disabled={!canStart}
          onClick={() => socket.emit('coinToss', { sessionId: session.id })}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 text-purple-950 font-bold text-xl shadow-xl shadow-pink-500/30 hover:scale-[1.03] active:scale-95 transition disabled:opacity-40"
        >
          🪙 Münze werfen &amp; Start
        </button>
        {!canStart && <p className="text-sm text-purple-400 mt-2">Beide Teams brauchen mindestens einen Spieler.</p>}
      </div>
    </div>
  );
}
