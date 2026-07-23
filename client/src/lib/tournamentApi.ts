import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateBracket, setMatchWinner } from './bracket';
import type { Tournament } from '../types';

const tournamentsCol = collection(db, 'tournaments');
const tournamentRef = (id: string) => doc(tournamentsCol, id);

export async function createTournament(name: string, teamNames: string[]): Promise<Tournament> {
  const teams = teamNames.map((n) => ({ id: crypto.randomUUID(), name: n }));
  const tournament: Tournament = {
    id: crypto.randomUUID().slice(0, 8),
    name,
    createdAt: Date.now(),
    teams,
    matches: generateBracket(teams),
  };
  await setDoc(tournamentRef(tournament.id), tournament);
  return tournament;
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const snap = await getDoc(tournamentRef(id));
  return snap.exists() ? (snap.data() as Tournament) : null;
}

export function subscribeTournament(id: string, cb: (t: Tournament | null) => void) {
  return onSnapshot(tournamentRef(id), (snap) => cb(snap.exists() ? (snap.data() as Tournament) : null));
}

export async function listTournaments(): Promise<Tournament[]> {
  const snap = await getDocs(query(tournamentsCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => d.data() as Tournament);
}

export async function pickWinner(id: string, matchId: string, winnerId: string) {
  const tournament = await getTournament(id);
  if (!tournament) return;
  tournament.matches = setMatchWinner(tournament.matches, matchId, winnerId);
  await setDoc(tournamentRef(id), tournament);
}
