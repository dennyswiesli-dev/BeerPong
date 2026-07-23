import type { Tournament, TournamentMatch, TournamentTeam } from '../types';

function uid(): string {
  return crypto.randomUUID();
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function propagateWinners(matches: TournamentMatch[]) {
  const maxRound = Math.max(...matches.map((m) => m.round));
  for (let r = 1; r < maxRound; r += 1) {
    const roundMatches = matches.filter((m) => m.round === r).sort((a, b) => a.slot - b.slot);
    for (const m of roundMatches) {
      if (!m.winnerId) continue;
      const target = matches.find((mm) => mm.round === r + 1 && mm.slot === Math.floor(m.slot / 2));
      if (!target) continue;
      if (m.slot % 2 === 0) target.teamAId = m.winnerId;
      else target.teamBId = m.winnerId;
    }
  }
}

export function generateBracket(teams: TournamentTeam[]): TournamentMatch[] {
  const shuffled = shuffle(teams);
  const size = nextPowerOfTwo(shuffled.length);
  const rounds = Math.log2(size);
  const matches: TournamentMatch[] = [];

  // Byes are spread one-per-match across the first `byesNeeded` matches (always
  // fewer than the number of round-1 matches) so a team never draws two byes
  // in a row and no match ends up with zero real teams in it.
  const byesNeeded = size - shuffled.length;
  let teamIdx = 0;
  for (let i = 0; i < size / 2; i += 1) {
    const a = shuffled[teamIdx++]?.id ?? null;
    const b = i < byesNeeded ? null : (shuffled[teamIdx++]?.id ?? null);
    let winner: string | null = null;
    if (a && !b) winner = a;
    else if (!a && b) winner = b;
    matches.push({ id: uid(), round: 1, slot: i, teamAId: a, teamBId: b, winnerId: winner });
  }

  let count = size / 2;
  for (let r = 2; r <= rounds; r += 1) {
    count /= 2;
    for (let i = 0; i < count; i += 1) {
      matches.push({ id: uid(), round: r, slot: i, teamAId: null, teamBId: null, winnerId: null });
    }
  }

  propagateWinners(matches);
  return matches;
}

export function setMatchWinner(matches: TournamentMatch[], matchId: string, winnerId: string): TournamentMatch[] {
  const next = matches.map((m) => ({ ...m }));
  const target = next.find((m) => m.id === matchId);
  if (!target) return matches;
  target.winnerId = winnerId;
  for (const m of next) {
    if (m.round > target.round) {
      m.teamAId = null;
      m.teamBId = null;
      m.winnerId = null;
    }
  }
  propagateWinners(next);
  return next;
}

export function tournamentWinner(tournament: Tournament): TournamentTeam | null {
  const maxRound = Math.max(...tournament.matches.map((m) => m.round));
  const final = tournament.matches.find((m) => m.round === maxRound);
  if (!final?.winnerId) return null;
  return tournament.teams.find((t) => t.id === final.winnerId) ?? null;
}

export function teamName(tournament: Tournament, id: string | null): string {
  if (!id) return '—';
  return tournament.teams.find((t) => t.id === id)?.name ?? '—';
}
