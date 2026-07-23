import { doc, getDoc, onSnapshot, setDoc, type DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import * as logic from './gameLogic';
import type { BoardLayout, SessionState } from '../types';

const sessionRef = (id: string) => doc(db, 'sessions', id);

export async function createSession(layout: BoardLayout, singleDeviceMode: boolean): Promise<SessionState> {
  const session = logic.createSession(layout, singleDeviceMode);
  await setDoc(sessionRef(session.id), session as unknown as DocumentData);
  return session;
}

export async function getSession(id: string): Promise<SessionState | null> {
  const snap = await getDoc(sessionRef(id));
  return snap.exists() ? (snap.data() as SessionState) : null;
}

export function subscribeSession(id: string, cb: (session: SessionState | null) => void) {
  return onSnapshot(sessionRef(id), (snap) => {
    cb(snap.exists() ? (snap.data() as SessionState) : null);
  });
}

async function mutate(id: string, fn: (session: SessionState) => SessionState): Promise<SessionState | null> {
  const current = await getSession(id);
  if (!current) return null;
  const next = fn(current);
  await setDoc(sessionRef(id), next as unknown as DocumentData);
  return next;
}

export const addPlayer = (id: string, teamId: string, name: string) =>
  mutate(id, (s) => logic.addPlayer(s, teamId, name));

export const renameTeam = (id: string, teamId: string, name: string) =>
  mutate(id, (s) => logic.renameTeam(s, teamId, name));

export const setTeamIcon = (id: string, teamId: string, icon: string) =>
  mutate(id, (s) => logic.setTeamIcon(s, teamId, icon));

export const setLayout = (id: string, layout: BoardLayout) => mutate(id, (s) => logic.setLayout(s, layout));

export const setSpecialRule = (id: string, rule: string | null) =>
  mutate(id, (s) => logic.setSpecialRule(s, rule));

export const shuffleTeams = (id: string) => mutate(id, (s) => logic.shuffleTeams(s));

export const coinToss = (id: string) => mutate(id, (s) => logic.coinToss(s));

export const hitCup = (id: string, targetTeamId: string, cupId: string, shooterName?: string) =>
  mutate(id, (s) => logic.hitCup(s, targetTeamId, cupId, shooterName));

export const undoLast = (id: string) => mutate(id, (s) => logic.undoLast(s));

export const reformCups = (id: string, teamId: string, formation: number[]) =>
  mutate(id, (s) => logic.reformCups(s, teamId, formation));

export const resetGame = (id: string) => mutate(id, (s) => logic.resetGame(s));

export const rematch = (id: string) => mutate(id, (s) => logic.rematch(s));
