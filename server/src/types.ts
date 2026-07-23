export type BoardLayout = 10 | 6;

export interface Cup {
  id: string;
  index: number; // position in the rack, row-based
  hit: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: string[]; // player names
  cups: Cup[];
  reformationUsed: boolean;
  score: number; // cups hit by this team (offense)
}

export type SessionStatus = 'lobby' | 'cointoss' | 'playing' | 'finished';

export interface StreakState {
  teamId: string | null;
  count: number;
}

export interface SessionState {
  id: string;
  createdAt: number;
  layout: BoardLayout;
  singleDeviceMode: boolean;
  status: SessionStatus;
  teams: [Team, Team];
  coinTossResult: string | null; // teamId that starts
  currentTeam: string | null;
  winnerTeamId: string | null;
  streak: StreakState;
  log: LogEntry[];
}

export interface LogEntry {
  id: string;
  ts: number;
  message: string;
  kind: 'hit' | 'miss' | 'reform' | 'win' | 'info' | 'saying';
}

export interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  cupsHit: number;
  shotsTaken: number;
}
