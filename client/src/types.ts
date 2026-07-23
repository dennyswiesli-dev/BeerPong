export type BoardLayout = 10 | 6;

export interface Cup {
  id: string;
  index: number;
  hit: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: string[];
  cups: Cup[];
  reformationUsed: boolean;
  score: number;
}

export type SessionStatus = 'lobby' | 'cointoss' | 'playing' | 'finished';

export interface StreakState {
  teamId: string | null;
  count: number;
}

export interface LogEntry {
  id: string;
  ts: number;
  message: string;
  kind: 'hit' | 'miss' | 'reform' | 'win' | 'info' | 'saying';
}

export interface SessionState {
  id: string;
  createdAt: number;
  layout: BoardLayout;
  singleDeviceMode: boolean;
  status: SessionStatus;
  teams: [Team, Team];
  coinTossResult: string | null;
  currentTeam: string | null;
  winnerTeamId: string | null;
  streak: StreakState;
  log: LogEntry[];
  saying: { id: string; text: string } | null;
}

export interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  cupsHit: number;
  shotsTaken: number;
}
