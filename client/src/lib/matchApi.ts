import { collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { MatchRecord, SessionState } from '../types';

const matchesCol = collection(db, 'matches');

export async function recordMatch(session: SessionState) {
  if (!session.winnerTeamId) return;
  const winnerIndex = session.teams.findIndex((t) => t.id === session.winnerTeamId) as 0 | 1;
  const mvpEntry = Object.entries(session.matchStats).sort((a, b) => b[1] - a[1])[0];
  const record: MatchRecord = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    layout: session.layout,
    teams: [
      {
        name: session.teams[0].name,
        color: session.teams[0].color,
        players: session.teams[0].players,
        score: session.teams[0].score,
      },
      {
        name: session.teams[1].name,
        color: session.teams[1].color,
        players: session.teams[1].players,
        score: session.teams[1].score,
      },
    ],
    winnerTeamIndex: winnerIndex,
    mvp: mvpEntry ? mvpEntry[0] : null,
  };
  await setDoc(doc(matchesCol, record.id), record);
}

export async function getRecentMatches(limitCount = 200): Promise<MatchRecord[]> {
  const snap = await getDocs(query(matchesCol, orderBy('ts', 'desc')));
  return snap.docs.slice(0, limitCount).map((d) => d.data() as MatchRecord);
}

export async function getPlayerMatches(name: string): Promise<MatchRecord[]> {
  const all = await getRecentMatches();
  const lower = name.trim().toLowerCase();
  return all.filter((m) => m.teams.some((t) => t.players.some((p) => p.toLowerCase() === lower)));
}

export interface HeadToHeadResult {
  aWins: number;
  bWins: number;
  matches: MatchRecord[];
}

export async function getHeadToHead(nameA: string, nameB: string): Promise<HeadToHeadResult> {
  const lowerA = nameA.trim().toLowerCase();
  const lowerB = nameB.trim().toLowerCase();
  const all = await getRecentMatches();
  const matches = all.filter((m) => {
    const teamOf = (name: string) => m.teams.findIndex((t) => t.players.some((p) => p.toLowerCase() === name));
    const idxA = teamOf(lowerA);
    const idxB = teamOf(lowerB);
    return idxA !== -1 && idxB !== -1 && idxA !== idxB;
  });
  let aWins = 0;
  let bWins = 0;
  for (const m of matches) {
    const teamOf = (name: string) => m.teams.findIndex((t) => t.players.some((p) => p.toLowerCase() === name));
    const winnerIsA = teamOf(lowerA) === m.winnerTeamIndex;
    if (winnerIsA) aWins += 1;
    else bWins += 1;
  }
  return { aWins, bWins, matches };
}
