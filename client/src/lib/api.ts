import type { BoardLayout, PlayerStats, SessionState } from '../types';

export async function createSession(layout: BoardLayout, singleDeviceMode: boolean): Promise<SessionState> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layout, singleDeviceMode }),
  });
  if (!res.ok) throw new Error('Konnte Spiel nicht erstellen');
  return res.json();
}

export async function getSession(id: string): Promise<SessionState> {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) throw new Error('Spiel nicht gefunden');
  return res.json();
}

export async function getLeaderboard(): Promise<PlayerStats[]> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Leaderboard nicht verfügbar');
  return res.json();
}
