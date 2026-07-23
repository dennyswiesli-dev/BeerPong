import fs from 'node:fs';
import path from 'node:path';
import type { PlayerStats } from './types.js';

const DB_PATH = path.join(process.cwd(), 'data', 'leaderboard.json');

let players: Record<string, PlayerStats> = {};

function load() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    players = JSON.parse(raw);
  } catch {
    players = {};
  }
}

function persist() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(players, null, 2));
}

load();

function key(name: string) {
  return name.trim().toLowerCase();
}

export function ensurePlayer(name: string): PlayerStats {
  const k = key(name);
  if (!players[k]) {
    players[k] = { name: name.trim(), wins: 0, losses: 0, gamesPlayed: 0, cupsHit: 0, shotsTaken: 0 };
  }
  return players[k];
}

export function recordShot(name: string, hit: boolean) {
  const p = ensurePlayer(name);
  p.shotsTaken += 1;
  if (hit) p.cupsHit += 1;
  persist();
}

export function recordGameResult(winners: string[], losers: string[]) {
  for (const name of winners) {
    const p = ensurePlayer(name);
    p.wins += 1;
    p.gamesPlayed += 1;
  }
  for (const name of losers) {
    const p = ensurePlayer(name);
    p.losses += 1;
    p.gamesPlayed += 1;
  }
  persist();
}

export function getLeaderboard(): PlayerStats[] {
  return Object.values(players).sort((a, b) => {
    const wrA = a.gamesPlayed ? a.wins / a.gamesPlayed : 0;
    const wrB = b.gamesPlayed ? b.wins / b.gamesPlayed : 0;
    if (wrB !== wrA) return wrB - wrA;
    return b.cupsHit - a.cupsHit;
  });
}
