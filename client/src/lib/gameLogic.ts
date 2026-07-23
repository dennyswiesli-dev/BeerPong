import type { BoardLayout, Cup, LogEntry, SessionSnapshot, SessionState, Team } from '../types';
import { triangleRows } from './formations';
import { hitSayings, pick, reformSayings, streakSayings, winSayings } from './sayings';

function uid(): string {
  return crypto.randomUUID();
}

function makeCups(count: number): Cup[] {
  return Array.from({ length: count }, (_, i) => ({ id: uid(), index: i, hit: false }));
}

function makeTeam(id: string, name: string, color: 'blue' | 'red', icon: string, layout: BoardLayout): Team {
  return {
    id,
    name,
    color,
    icon,
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
    startedAt: null,
    layout,
    singleDeviceMode,
    status: 'lobby',
    teams: [makeTeam(uid(), 'Team Blau', 'blue', '🔵', layout), makeTeam(uid(), 'Team Rot', 'red', '🔴', layout)],
    coinTossResult: null,
    coinTossId: null,
    currentTeam: null,
    winnerTeamId: null,
    streak: { teamId: null, count: 0 },
    playerStreak: { name: null, count: 0, best: 0 },
    matchStats: {},
    specialRule: null,
    log: [],
    saying: null,
    previousState: null,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function addLog(session: SessionState, message: string, kind: LogEntry['kind']) {
  session.log.unshift({ id: uid(), ts: Date.now(), message, kind });
  session.log = session.log.slice(0, 50);
}

function say(session: SessionState, text: string) {
  session.saying = { id: uid(), text };
}

function snapshot(session: SessionState): SessionSnapshot {
  return clone({
    teams: session.teams,
    status: session.status,
    currentTeam: session.currentTeam,
    winnerTeamId: session.winnerTeamId,
    streak: session.streak,
    playerStreak: session.playerStreak,
    matchStats: session.matchStats,
    log: session.log,
  });
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

export function setTeamIcon(session: SessionState, teamId: string, icon: string): SessionState {
  const next = clone(session);
  const team = next.teams.find((t) => t.id === teamId);
  if (!team) return session;
  team.icon = icon;
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

export function setSpecialRule(session: SessionState, rule: string | null): SessionState {
  const next = clone(session);
  next.specialRule = rule;
  return next;
}

export function shuffleTeams(session: SessionState): SessionState {
  const next = clone(session);
  if (next.status !== 'lobby') return session;
  const allPlayers = [...next.teams[0].players, ...next.teams[1].players];
  for (let i = allPlayers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
  }
  const mid = Math.ceil(allPlayers.length / 2);
  next.teams[0].players = allPlayers.slice(0, mid);
  next.teams[1].players = allPlayers.slice(mid);
  addLog(next, 'Teams wurden neu ausgelost.', 'info');
  return next;
}

export function coinToss(session: SessionState): SessionState {
  const next = clone(session);
  const winner = next.teams[Math.floor(Math.random() * 2)];
  next.coinTossResult = winner.id;
  next.coinTossId = uid();
  next.currentTeam = winner.id;
  next.status = 'playing';
  next.startedAt = Date.now();
  addLog(next, `${winner.name} beginnt das Spiel!`, 'info');
  return next;
}

function remainingCups(team: Team) {
  return team.cups.filter((c) => !c.hit);
}

export function hitCup(session: SessionState, targetTeamId: string, cupId: string, shooterName?: string): SessionState {
  const prev = snapshot(session);
  const next = clone(session);
  const targetTeam = next.teams.find((t) => t.id === targetTeamId);
  const scoringTeam = next.teams.find((t) => t.id !== targetTeamId);
  if (!targetTeam || !scoringTeam) return session;
  const cup = targetTeam.cups.find((c) => c.id === cupId);
  if (!cup || cup.hit) return session;
  cup.hit = true;
  scoringTeam.score += 1;
  next.previousState = prev;

  if (next.streak.teamId === scoringTeam.id) {
    next.streak.count += 1;
  } else {
    next.streak = { teamId: scoringTeam.id, count: 1 };
  }

  if (shooterName) {
    next.matchStats[shooterName] = (next.matchStats[shooterName] ?? 0) + 1;
    if (next.playerStreak.name === shooterName) {
      next.playerStreak.count += 1;
    } else {
      next.playerStreak = { name: shooterName, count: 1, best: next.playerStreak.best };
    }
    if (next.playerStreak.count > next.playerStreak.best) next.playerStreak.best = next.playerStreak.count;
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

export function undoLast(session: SessionState): SessionState {
  if (!session.previousState) return session;
  const next = clone(session);
  Object.assign(next, clone(session.previousState));
  next.previousState = null;
  addLog(next, 'Letzte Aktion wurde rückgängig gemacht.', 'info');
  return next;
}

export function reformCups(session: SessionState, teamId: string, formation: number[]): SessionState {
  const prev = snapshot(session);
  const next = clone(session);
  const team = next.teams.find((t) => t.id === teamId);
  if (!team) return session;
  const remaining = remainingCups(team);
  if (team.reformationUsed || remaining.length <= 2) return session;
  if (formation.reduce((a, b) => a + b, 0) !== remaining.length) return session;

  team.reformationUsed = true;
  team.cups = remaining.map((c, i) => ({ ...c, index: i, hit: false }));
  team.formationRows = formation;
  next.previousState = prev;
  addLog(next, `${team.name} formiert die Becher neu.`, 'reform');
  say(next, pick(reformSayings));
  return next;
}

export function resetGame(session: SessionState): SessionState {
  const next = clone(session);
  next.status = 'lobby';
  next.startedAt = null;
  next.coinTossResult = null;
  next.coinTossId = null;
  next.currentTeam = null;
  next.winnerTeamId = null;
  next.streak = { teamId: null, count: 0 };
  next.playerStreak = { name: null, count: 0, best: 0 };
  next.matchStats = {};
  next.log = [];
  next.saying = null;
  next.previousState = null;
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
