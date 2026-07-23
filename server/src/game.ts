import { randomUUID } from 'node:crypto';
import type { BoardLayout, Cup, LogEntry, SessionState, Team } from './types.js';

const sessions = new Map<string, SessionState>();

function makeCups(count: number): Cup[] {
  return Array.from({ length: count }, (_, i) => ({ id: randomUUID(), index: i, hit: false }));
}

function makeTeam(id: string, name: string, layout: BoardLayout): Team {
  return {
    id,
    name,
    players: [],
    cups: makeCups(layout),
    reformationUsed: false,
    score: 0,
  };
}

export function createSession(layout: BoardLayout, singleDeviceMode: boolean): SessionState {
  const id = randomUUID().slice(0, 8);
  const session: SessionState = {
    id,
    createdAt: Date.now(),
    layout,
    singleDeviceMode,
    status: 'lobby',
    teams: [makeTeam(randomUUID(), 'Team 1', layout), makeTeam(randomUUID(), 'Team 2', layout)],
    coinTossResult: null,
    currentTeam: null,
    winnerTeamId: null,
    streak: { teamId: null, count: 0 },
    log: [],
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): SessionState | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string) {
  sessions.delete(id);
}

function addLog(session: SessionState, message: string, kind: LogEntry['kind']) {
  session.log.unshift({ id: randomUUID(), ts: Date.now(), message, kind });
  session.log = session.log.slice(0, 50);
}

export function addPlayer(session: SessionState, teamId: string, name: string) {
  const team = session.teams.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');
  if (!team.players.includes(name)) team.players.push(name);
  addLog(session, `${name} ist Team "${team.name}" beigetreten.`, 'info');
}

export function renameTeam(session: SessionState, teamId: string, name: string) {
  const team = session.teams.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');
  team.name = name;
}

export function setLayout(session: SessionState, layout: BoardLayout) {
  session.layout = layout;
  session.teams[0].cups = makeCups(layout);
  session.teams[1].cups = makeCups(layout);
}

export function coinToss(session: SessionState): string {
  const winner = session.teams[Math.floor(Math.random() * 2)];
  session.coinTossResult = winner.id;
  session.currentTeam = winner.id;
  session.status = 'playing';
  addLog(session, `${winner.name} beginnt das Spiel!`, 'info');
  return winner.id;
}

function remainingCups(team: Team) {
  return team.cups.filter((c) => !c.hit);
}

export interface HitResult {
  cupId: string;
  streakSayingLevel?: number;
  gameOver: boolean;
  winnerTeamId?: string;
}

export function hitCup(session: SessionState, targetTeamId: string, cupId: string): HitResult {
  const targetTeam = session.teams.find((t) => t.id === targetTeamId);
  if (!targetTeam) throw new Error('Team not found');
  const cup = targetTeam.cups.find((c) => c.id === cupId);
  if (!cup || cup.hit) throw new Error('Invalid cup');
  cup.hit = true;

  const scoringTeam = session.teams.find((t) => t.id !== targetTeamId)!;
  scoringTeam.score += 1;

  if (session.streak.teamId === scoringTeam.id) {
    session.streak.count += 1;
  } else {
    session.streak = { teamId: scoringTeam.id, count: 1 };
  }

  addLog(session, `${scoringTeam.name} trifft einen Becher von ${targetTeam.name}!`, 'hit');

  const remaining = remainingCups(targetTeam);
  const gameOver = remaining.length === 0;
  if (gameOver) {
    session.status = 'finished';
    session.winnerTeamId = scoringTeam.id;
    addLog(session, `${scoringTeam.name} gewinnt das Spiel!`, 'win');
  } else {
    session.currentTeam = targetTeamId;
  }

  return {
    cupId,
    streakSayingLevel: [3, 5, 7].includes(session.streak.count) ? session.streak.count : undefined,
    gameOver,
    winnerTeamId: gameOver ? scoringTeam.id : undefined,
  };
}

export function missShot(session: SessionState, shootingTeamId: string) {
  const shootingTeam = session.teams.find((t) => t.id === shootingTeamId);
  const opponent = session.teams.find((t) => t.id !== shootingTeamId);
  if (!shootingTeam || !opponent) throw new Error('Team not found');
  session.streak = { teamId: null, count: 0 };
  session.currentTeam = opponent.id;
  addLog(session, `${shootingTeam.name} verwirft den Wurf.`, 'miss');
}

export function reformCups(session: SessionState, teamId: string): boolean {
  const team = session.teams.find((t) => t.id === teamId);
  if (!team) throw new Error('Team not found');
  const remaining = remainingCups(team);
  if (team.reformationUsed || remaining.length <= 2) return false;
  team.reformationUsed = true;
  const reindexed = remaining.map((c, i) => ({ ...c, index: i }));
  team.cups = [...reindexed, ...team.cups.filter((c) => c.hit)];
  addLog(session, `${team.name} formiert die Becher neu.`, 'reform');
  return true;
}

export function resetGame(session: SessionState) {
  session.status = 'lobby';
  session.coinTossResult = null;
  session.currentTeam = null;
  session.winnerTeamId = null;
  session.streak = { teamId: null, count: 0 };
  session.log = [];
  session.teams[0] = { ...session.teams[0], cups: makeCups(session.layout), reformationUsed: false, score: 0 };
  session.teams[1] = { ...session.teams[1], cups: makeCups(session.layout), reformationUsed: false, score: 0 };
}
