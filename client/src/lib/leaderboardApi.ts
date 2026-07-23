import { collection, doc, getDoc, getDocs, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { PlayerStats } from '../types';

const playersCol = collection(db, 'players');
const key = (name: string) => name.trim().toLowerCase();

async function ensurePlayer(name: string) {
  const ref = doc(playersCol, key(name));
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initial: PlayerStats = {
      name: name.trim(),
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      cupsHit: 0,
      shotsTaken: 0,
      bestStreak: 0,
    };
    await setDoc(ref, initial);
  }
  return ref;
}

export async function registerPlayer(name: string) {
  await ensurePlayer(name);
}

export async function recordShot(name: string, hit: boolean) {
  const ref = await ensurePlayer(name);
  await updateDoc(ref, { shotsTaken: increment(1), ...(hit ? { cupsHit: increment(1) } : {}) });
}

export async function recordGameResult(winners: string[], losers: string[]) {
  for (const name of winners) {
    const ref = await ensurePlayer(name);
    await updateDoc(ref, { wins: increment(1), gamesPlayed: increment(1) });
  }
  for (const name of losers) {
    const ref = await ensurePlayer(name);
    await updateDoc(ref, { losses: increment(1), gamesPlayed: increment(1) });
  }
}

export async function recordStreak(name: string, streak: number) {
  const ref = await ensurePlayer(name);
  const snap = await getDoc(ref);
  const current = (snap.data() as PlayerStats | undefined)?.bestStreak ?? 0;
  if (streak > current) await updateDoc(ref, { bestStreak: streak });
}

export async function getLeaderboard(): Promise<PlayerStats[]> {
  const snap = await getDocs(playersCol);
  const players = snap.docs.map((d) => d.data() as PlayerStats);
  return players.sort((a, b) => {
    const wrA = a.gamesPlayed ? a.wins / a.gamesPlayed : 0;
    const wrB = b.gamesPlayed ? b.wins / b.gamesPlayed : 0;
    if (wrB !== wrA) return wrB - wrA;
    return b.cupsHit - a.cupsHit;
  });
}
