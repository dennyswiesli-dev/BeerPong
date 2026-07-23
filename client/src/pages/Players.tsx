import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePlayer, getLeaderboard, registerPlayer } from '../lib/leaderboardApi';
import type { PlayerStats } from '../types';

export default function Players() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setPlayers(await getLeaderboard());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addPlayer() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await registerPlayer(trimmed);
      setName('');
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(playerName: string) {
    await deletePlayer(playerName);
    setConfirmingDelete(null);
    await load();
  }

  return (
    <div className="min-h-svh px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black italic">
          <span className="text-sky-400">Spieler</span> <span className="text-red-500">verwalten</span>
        </h1>
        <Link to="/" className="text-white/60 hover:text-white text-sm">← Zurück</Link>
      </div>
      <p className="text-white/50 text-sm mb-8">
        Lege Spieler einmalig hier an, damit ihr in der Lobby später einfach den richtigen Namen auswählen könnt —
        so bleiben Sieg-/Niederlage- und Trefferstatistiken über mehrere Abende hinweg sauber einem Spieler
        zugeordnet.
      </p>

      <div className="flex gap-2 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          placeholder="Name des neuen Spielers"
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-sky-400"
        />
        <button
          onClick={addPlayer}
          disabled={saving || !name.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-red-600 text-white font-bold disabled:opacity-40"
        >
          + Hinzufügen
        </button>
      </div>

      {loading && <p className="text-white/50">Lade Spieler...</p>}
      {!loading && players.length === 0 && <p className="text-white/50">Noch keine Spieler angelegt.</p>}

      {!loading && players.length > 0 && (
        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            >
              {confirmingDelete === p.name ? (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-sm text-white/80">{p.name} wirklich löschen?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDelete(p.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                    >
                      Löschen
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to={`/players/${encodeURIComponent(p.name)}`} className="flex-1 hover:text-sky-400 transition">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-white/50 ml-2">
                      {p.wins}S / {p.losses}N · {p.cupsHit} Treffer
                    </span>
                  </Link>
                  <button
                    onClick={() => setConfirmingDelete(p.name)}
                    title="Spieler löschen"
                    className="text-white/30 hover:text-red-500 px-2 transition"
                  >
                    🗑️
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
