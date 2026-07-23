import type { BoardLayout, Cup, LogEntry, SessionState, Team } from '../types';
import { triangleRows } from './formations';
import { hitSayings, pick, reformSayings, streakSayings, winSayings } from './sayings';

function uid(): string {
  return crypto.randomUUID();
}

function makeCups(count: number): Cup[] {
  return Array.from({ length: count }, (_, i) => ({ id: uid(), index: i, hit: false }));
}

function makeTeam(id: string, name: string, color: 'blue' | 'red', layout: BoardLayout): Team {
  return {
    id,
    name,
    color,
    players: [],
    cups: makeCups(layout),
    formationRows: triangleRows(layout),
    reformationUsed: false,
    score: 0,
  };
}

export function createSession(layout: BoardLayout, singleDeviceMode: boolean): SessionState {
  return {
    id: uid().slice(0, 8),
    createdAt: Date.now(),
    layout,
    singleDeviceMode,
    status: 'lobby',
    teams: [makeTeam(uid(), 'Team Blau', 'blue', layout), makeTeam(uid(), 'Team Rot', 'red', layout)],
    coinTossResult: null,
    coinTossId: null,
    currentTeam: null,
    winnerTeamId: null,
    streak: { teamId: null, count: 0 },
    log: [],
    saying: null,
  };
}

function clone(session: SessionState): SessionState {
  return JSON.parse(JSON.stringify(session));
}

function addLog(session: SessionState, message: string, kind: LogEntry['kind']) {
  session.log.unshift({ id: uid(), ts: Date.now(), message, kind });
  session.log = session.log.slice(0, 50);
}

function say(session: SessionState, text: string) {
  session.saying = { id: uid(), text };
}

export function addPlayer(session: SessionState, teamId: string, name: string): SessionState {
  const next = clone(session);
  const team = next.teams.find((t) => t.id === teamId);
  if (!team) return session;
  if (!team.players.includes(name)) team.players.push(name);
  addLog(next, `${name} ist Team "${team.name}" beigetreten.`, 'info');
  return next;
}

export function renameTeam(session: SessionState, teamId: string, name: string): SessionState {
  const next = clone(session);
  const team = next.teams.find((t) => t.id === teamId);
  if (!team) return session;
  team.name = name;
  return next;
}

export function setLayout(session: SessionState, layout: BoardLayout): SessionState {
  const next = clone(session);
  next.layout = layout;
  next.teams[0].cups = makeCups(layout);
  next.teams[0].formationRows = triangleRows(layout);
  next.teams[1].cups = makeCups(layout);
  next.teams[1].formationRows = triangleRows(layout);
  return next;
}

export function coinToss(session: SessionState): SessionState {
  const next = clone(session);
  const winner = next.teams[Math.floor(Math.random() * 2)];
  next.coinTossResult = winner.id;
  next.coinTossId = uid();
  next.currentTeam = winner.id;
  next.status = 'playing';
  addLog(next, `${winner.name} beginnt das Spiel!`, 'info');
  return next;
}

function remainingCups(team: Team) {
  return team.cups.filter((c) => !c.hit);
}

export function hitCup(session: SessionState, targetTeamId: string, cupId: string): SessionState {
  const next = clone(session);
  const targetTeam = next.teams.find((t) => t.id === targetTeamId);
  const scoringTeam = next.teams.find((t) => t.id !== targetTeamId);
  if (!targetTeam || !scoringTeam) return session;
  const cup = targetTeam.cups.find((c) => c.id === cupId);
  if (!cup || cup.hit) return session;
  cup.hit = true;
  scoringTeam.score += 1;

  if (next.streak.teamId === scoringTeam.id) {
    next.streak.count += 1;
  } else {
    next.streak = { teamId: scoringTeam.id, count: 1 };
  }

  addLog(next, `${scoringTeam.name} trifft einen Becher von ${targetTeam.name}!`, 'hit');
  say(next, pick(hitSayings));
  const streakOptions = streakSayings[next.streak.count];
  if (streakOptions) say(next, pick(streakOptions));

  const remaining = remainingCups(targetTeam);
  if (remaining.length === 0) {
    next.status = 'finished';
    next.winnerTeamId = scoringTeam.id;
    addLog(next, `${scoringTeam.name} gewinnt das Spiel!`, 'win');
    say(next, pick(winSayings));
  } else {
    next.currentTeam = targetTeamId;
  }

  return next;
}

export function reformCups(session: SessionState, teamId: string, formation: number[]): SessionState {
  const next = clone(session);
  const team = next.teams.find((t) => t.id === teamId);
  if (!team) return session;
  const remaining = remainingCups(team);
  if (team.reformationUsed || remaining.length <= 2) return session;
  if (formation.reduce((a, b) => a + b, 0) !== remaining.length) return session;

  team.reformationUsed = true;
  team.cups = remaining.map((c, i) => ({ ...c, index: i, hit: false }));
  team.formationRows = formation;
  addLog(next, `${team.name} formiert die Becher neu.`, 'reform');
  say(next, pick(reformSayings));
  return next;
}

export function resetGame(session: SessionState): SessionState {
  const next = clone(session);
  next.status = 'lobby';
  next.coinTossResult = null;
  next.coinTossId = null;
  next.currentTeam = null;
  next.winnerTeamId = null;
  next.streak = { teamId: null, count: 0 };
  next.log = [];
  next.saying = null;
  next.teams[0] = {
    ...next.teams[0],
    cups: makeCups(next.layout),
    formationRows: triangleRows(next.layout),
    reformationUsed: false,
    score: 0,
  };
  next.teams[1] = {
    ...next.teams[1],
    cups: makeCups(next.layout),
    formationRows: triangleRows(next.layout),
    reformationUsed: false,
    score: 0,
  };
  return next;
}

export function rematch(session: SessionState): SessionState {
  return coinToss(resetGame(session));
}
