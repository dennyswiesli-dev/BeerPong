export type BoardLayout = 10 | 6;

export type TeamColor = 'blue' | 'red';

export interface Cup {
  id: string;
  index: number;
  hit: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  icon: string;
  players: string[];
  cups: Cup[];
  formationRows: number[];
  reformationUsed: boolean;
  score: number;
}

export type SessionStatus = 'lobby' | 'cointoss' | 'playing' | 'finished';

export interface StreakState {
  teamId: string | null;
  count: number;
}

export interface PlayerStreakState {
  name: string | null;
  count: number;
  best: number;
}

export interface LogEntry {
  id: string;
  ts: number;
  message: string;
  kind: 'hit' | 'miss' | 'reform' | 'win' | 'info' | 'saying';
}

export interface SessionSnapshot {
  teams: [Team, Team];
  status: SessionStatus;
  currentTeam: string | null;
  winnerTeamId: string | null;
  streak: StreakState;
  playerStreak: PlayerStreakState;
  matchStats: Record<string, number>;
  log: LogEntry[];
}

export interface SessionState {
  id: string;
  createdAt: number;
  startedAt: number | null;
  layout: BoardLayout;
  singleDeviceMode: boolean;
  status: SessionStatus;
  teams: [Team, Team];
  coinTossResult: string | null;
  coinTossId: string | null;
  currentTeam: string | null;
  winnerTeamId: string | null;
  streak: StreakState;
  playerStreak: PlayerStreakState;
  matchStats: Record<string, number>;
  specialRule: string | null;
  log: LogEntry[];
  saying: { id: string; text: string } | null;
  previousState: SessionSnapshot | null;
}

export interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  cupsHit: number;
  shotsTaken: number;
  bestStreak: number;
}

export interface MatchRecordTeam {
  name: string;
  color: TeamColor;
  players: string[];
  score: number;
}

export interface MatchRecord {
  id: string;
  ts: number;
  layout: BoardLayout;
  teams: [MatchRecordTeam, MatchRecordTeam];
  winnerTeamIndex: 0 | 1;
  mvp: string | null;
}

export interface TournamentTeam {
  id: string;
  name: string;
}

export interface TournamentMatch {
  id: string;
  round: number;
  slot: number;
  teamAId: string | null;
  teamBId: string | null;
  winnerId: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: number;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
}
